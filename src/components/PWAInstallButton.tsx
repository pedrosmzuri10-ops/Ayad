import React, { useState } from 'react';
import { Download, Laptop, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DesktopShortcutModal } from './DesktopShortcutModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode (installed app window), don't show prompt button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setIsModalOpen(true);
          }
        }}
        title="داگرتن و دروستکردنی شۆرتکەت لەسەر کۆمپیوتەر (Desktop Shortcut)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs active:scale-97"
      >
        <Laptop className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">شۆرتکەتی کۆمپیوتەر</span>
        <span className="sm:hidden">داگرتن</span>
        <Download className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
      </button>

      <DesktopShortcutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
