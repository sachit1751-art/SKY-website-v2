import React from 'react';
import { X, Check, ExternalLink, Download, Battery, ShieldCheck, Cpu, Code, Users, Sparkles, Trash2 } from 'lucide-react';
import { RomItem } from '../../shared/types';

interface RomCompareModalProps {
  roms: RomItem[];
  onClose: () => void;
  onRemoveRom: (romName: string) => void;
}

export const RomCompareModal: React.FC<RomCompareModalProps> = ({
  roms,
  onClose,
  onRemoveRom
}) => {
  if (!roms || roms.length === 0) return null;

  const renderBatteryRating = (rating?: number) => {
    const stars = rating || 4;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((star) => (
          <Battery
            key={star}
            className={`w-4 h-4 ${
              star <= stars
                ? 'text-[#FDE694] fill-[#FDE694]/20'
                : 'text-[#36342A] opacity-40'
            }`}
          />
        ))}
        <span className="text-xs font-bold ml-1 text-[#FDE694]">
          {stars === 4 ? 'A+ Excellent' : stars === 3 ? 'A Good' : 'B Standard'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#1C1B17] border border-[#36342A] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#FAF3DD]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#36342A] bg-[#121210]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDE694]/15 border border-[#FDE694]/30 flex items-center justify-center text-[#FDE694]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FAF3DD]">ROM Comparison Tool</h2>
              <p className="text-xs text-[#9C9888]">Comparing {roms.length} custom builds for SKY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9C9888] hover:text-[#FAF3DD] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table Container */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
          <div className="min-w-[600px] grid grid-cols-[160px_repeat(auto-fit,minmax(200px,1fr))] gap-3">
            
            {/* Table Row Labels */}
            <div className="space-y-6 pt-16 text-xs font-bold text-[#9C9888]">
              <div className="h-10 flex items-center">Status</div>
              <div className="h-10 flex items-center">Android Version</div>
              <div className="h-10 flex items-center">Build Version</div>
              <div className="h-10 flex items-center">Maintainer</div>
              <div className="h-10 flex items-center">Battery Rating</div>
              <div className="h-10 flex items-center">Device Variant</div>
              <div className="h-12 flex items-center">Community & Source</div>
              <div className="h-12 flex items-center">Download</div>
            </div>

            {/* ROM Columns */}
            {roms.map((rom) => (
              <div
                key={rom.name}
                className="bg-[#121210] border border-[#36342A] rounded-2xl p-4 flex flex-col space-y-6 relative"
              >
                {/* ROM Card Header */}
                <div className="relative pt-2 pb-1 border-b border-[#36342A]/60 flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      {rom.logoUrl ? (
                        <img src={rom.logoUrl} alt={rom.name} decoding="async" referrerPolicy="no-referrer" className="w-7 h-7 aspect-square rounded-lg object-cover bg-black/40" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#FDE694]/20 flex items-center justify-center text-[#FDE694] font-bold text-xs">
                          {rom.name.charAt(0)}
                        </div>
                      )}
                      <h3 className="text-base font-bold text-[#FAF3DD] truncate">{rom.name}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveRom(rom.name)}
                    className="absolute top-0 right-0 p-1.5 text-[#9C9888] hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status */}
                <div className="h-10 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    rom.status === 'Official' || rom.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {rom.status}
                  </span>
                </div>

                {/* Android Version */}
                <div className="h-10 flex items-center text-xs font-bold text-[#FAF3DD]">
                  <span className="px-2.5 py-1 bg-[#1C1B17] border border-[#36342A] rounded-lg">
                    Android {rom.androidVersion}
                  </span>
                </div>

                {/* Build Version */}
                <div className="h-10 flex items-center text-xs text-[#BDB8A4]">
                  {rom.version || 'v1.0 Latest'}
                </div>

                {/* Maintainer */}
                <div className="h-10 flex items-center text-xs font-medium text-[#FAF3DD]">
                  {rom.maintainerHandle ? (
                    <a
                      href={`https://t.me/${rom.maintainerHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FDE694] hover:underline flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {rom.maintainer}
                    </a>
                  ) : (
                    <span>{rom.maintainer}</span>
                  )}
                </div>

                {/* Battery Rating */}
                <div className="h-10 flex items-center">
                  {renderBatteryRating(rom.batteryEfficiency)}
                </div>

                {/* Device Variant */}
                <div className="h-10 flex items-center text-xs text-[#BDB8A4]">
                  {rom.variant || 'sky / sky_in (POCO M6 Pro / Redmi 12)'}
                </div>

                {/* Links */}
                <div className="h-12 flex items-center gap-2">
                  {rom.communityUrl && (
                    <a
                      href={rom.communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#1C1B17] border border-[#36342A] text-xs text-[#FAF3DD] hover:text-[#FDE694] hover:border-[#FDE694]/40 transition-all flex items-center gap-1"
                      title="Telegram Support Group"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  )}
                  {rom.sourceUrl && (
                    <a
                      href={rom.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#1C1B17] border border-[#36342A] text-xs text-[#FAF3DD] hover:text-[#FDE694] hover:border-[#FDE694]/40 transition-all flex items-center gap-1"
                      title="Source Code"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Source</span>
                    </a>
                  )}
                </div>

                {/* Download Action */}
                <div className="h-12 flex items-center">
                  <a
                    href={rom.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#FDE694] text-[#121210] hover:bg-[#F4D068] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Get ROM</span>
                  </a>
                </div>

              </div>
            ))}

          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#36342A] bg-[#121210] flex items-center justify-between text-xs text-[#9C9888]">
          <span>Tip: You can compare up to 3 custom ROMs at once.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1C1B17] border border-[#36342A] text-[#FAF3DD] hover:bg-[#36342A] transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
