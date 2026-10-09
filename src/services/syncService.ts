import {
  Category,
  Customer,
  Expense,
  Invoice,
  Item,
  PaymentRecord,
  PurchaseInvoice,
  ShopSettings,
  Supplier,
} from '../types';

export interface AppSyncData {
  items: Item[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: PurchaseInvoice[];
  expenses: Expense[];
  payments: PaymentRecord[];
  settings: ShopSettings;
}

export interface SyncPayload {
  data: AppSyncData;
  lastUpdated: number;
  updatedBy: string;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

class SyncService {
  private deviceId: string = '';
  private deviceType: 'computer' | 'mobile' = 'computer';
  private status: SyncStatus = 'connected';
  private lastRemoteTimestamp: number = 0;
  private isPushing: boolean = false;
  private pushTimeout: any = null;
  private pollInterval: any = null;
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private updateCallbacks: Set<(data: AppSyncData, timestamp: number) => void> = new Set();
  private lastSuccessfulSyncTime: Date | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Determine device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
      this.deviceType = isMobile ? 'mobile' : 'computer';

      // Load or generate device ID
      let id = localStorage.getItem('pedros_pos_device_id');
      if (!id) {
        id = `${this.deviceType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        localStorage.setItem('pedros_pos_device_id', id);
      }
      this.deviceId = id;

      // Broadcast channel for instantaneous cross-tab sync
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('pedros_pos_sync_channel');
          this.broadcastChannel.onmessage = (event) => {
            const { type, data, timestamp, senderId } = event.data || {};
            if (type === 'STATE_UPDATE' && senderId !== this.deviceId && data) {
              this.notifyRemoteUpdate(data, timestamp || Date.now());
            }
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported', err);
      }

      // Online/Offline status listeners
      window.addEventListener('online', () => {
        this.setStatus('connected');
        this.fetchLatest();
      });
      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });

      // When tab becomes active/visible on mobile, poll immediately
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchLatest();
        }
      });
      window.addEventListener('focus', () => {
        this.fetchLatest();
      });
    }
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public getDeviceType(): 'computer' | 'mobile' {
    return this.deviceType;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getLastSyncTime(): Date | null {
    return this.lastSuccessfulSyncTime;
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.status);
    return () => this.listeners.delete(callback);
  }

  public onRemoteUpdate(callback: (data: AppSyncData, timestamp: number) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  private setStatus(newStatus: SyncStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach((cb) => cb(newStatus));
    }
  }

  private notifyRemoteUpdate(data: AppSyncData, timestamp: number) {
    this.lastRemoteTimestamp = timestamp;
    this.lastSuccessfulSyncTime = new Date();
    this.updateCallbacks.forEach((cb) => cb(data, timestamp));
  }

  // Start background sync & SSE connection
  public startSync(initialLocalTimestamp: number = 0) {
    this.lastRemoteTimestamp = initialLocalTimestamp;

    // Connect SSE for instant push notifications
    this.connectSSE();

    // Start polling fallback (every 3 seconds)
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchLatest();
    }, 3000);

    // Initial fetch
    this.fetchLatest();
  }

  public stopSync() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined') return;
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }
      this.eventSource = new EventSource('/api/sync/events');

      this.eventSource.onopen = () => {
        this.setStatus('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data && payload.updatedBy !== this.deviceId) {
            if (payload.lastUpdated > this.lastRemoteTimestamp) {
              this.notifyRemoteUpdate(payload.data, payload.lastUpdated);
            }
          } else if (payload.lastUpdated && payload.lastUpdated > this.lastRemoteTimestamp) {
            // Timestamp ping, fetch full data
            this.fetchLatest();
          }
        } catch {
          // parse error
        }
      };

      this.eventSource.onerror = () => {
        // SSE might not be supported in some proxy or serverless environments, fallback to polling
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      };
    } catch {
      // Ignore SSE init failure
    }
  }

  // Fetch the latest state from backend
  public async fetchLatest(): Promise<AppSyncData | null> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.setStatus('offline');
      return null;
    }

    try {
      const response = await fetch('/api/sync', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        return null;
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        this.setStatus('connected');
        this.lastSuccessfulSyncTime = new Date();

        if (resJson.lastUpdated > this.lastRemoteTimestamp) {
          this.notifyRemoteUpdate(resJson.data, resJson.lastUpdated);
          return resJson.data;
        }
      }
      return null;
    } catch (err) {
      console.warn('[SyncService] Fetch error:', err);
      return null;
    }
  }

  // Push new data to backend (debounced)
  public pushState(data: AppSyncData, timestamp: number = Date.now()) {
    this.lastRemoteTimestamp = timestamp;

    // Immediately notify other tabs on the same device
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          data,
          timestamp,
          senderId: this.deviceId,
        });
      }
    } catch {
      // Ignore
    }

    // Debounce network push
    if (this.pushTimeout) clearTimeout(this.pushTimeout);

    this.pushTimeout = setTimeout(async () => {
      await this.sendPush(data, timestamp);
    }, 200);
  }

  private async sendPush(data: AppSyncData, timestamp: number) {
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.isPushing = true;
    this.setStatus('syncing');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data,
          timestamp,
          updatedBy: this.deviceId,
        }),
      });

      if (response.ok) {
        this.setStatus('connected');
        this.lastSuccessfulSyncTime = new Date();
      } else {
        this.setStatus('connected');
      }
    } catch (err) {
      console.warn('[SyncService] Push failed:', err);
      this.setStatus('error');
    } finally {
      this.isPushing = false;
    }
  }
}

export const syncService = new SyncService();
