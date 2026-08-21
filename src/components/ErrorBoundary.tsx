import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Trash2 } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here you could send the error to an analytics service
  }

  private handleReset = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    if (window.confirm('This will clear all local settings and saved ROMs. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F1] dark:bg-[#0A0908] flex items-center justify-center p-6 selection:bg-[#FDE694] selection:text-[#121212]">
          <div className="max-w-2xl w-full">
            <SpotlightCard className="p-12 border border-[#EBE4CF] dark:border-[#1F1E18] bg-gradient-to-b from-white/95 to-white/80 dark:from-[#0F0E0C]/95 dark:to-[#0F0E0C]/80 text-center shadow-2xl shadow-black/5">
              <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-3xl mb-8 border border-red-500/20">
                <AlertTriangle size={48} strokeWidth={1.5} />
              </div>
              
              <h1 className="text-4xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tighter mb-4 leading-none">
                SYSTEM <span className="text-red-500">INTERRUPTION</span>
              </h1>
              
              <p className="text-[#787567] dark:text-[#BDB8A4] text-lg font-medium mb-10 max-w-md mx-auto leading-relaxed">
                The application encountered an unexpected runtime exception. All security protocols remain active.
              </p>

              {this.state.error && (
                <div className="mb-10 p-4 bg-[#F9F6E5] dark:bg-[#151410] rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] text-left overflow-hidden">
                  <p className="text-[10px] font-black tracking-widest text-[#787567] dark:text-[#BDB8A4] uppercase mb-2">Technical Details</p>
                  <code className="text-xs font-mono text-red-500 break-all leading-tight block max-h-32 overflow-y-auto custom-scrollbar">
                    {this.state.error.message || this.state.error.toString()}
                  </code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={this.handleReload}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#121212] dark:bg-[#F4EFE6] text-white dark:text-[#121212] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                  <RefreshCcw size={18} />
                  RELOAD SYSTEM
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-[#151410] text-[#121212] dark:text-[#F4EFE6] font-black rounded-2xl border border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#F9F6E5] dark:hover:bg-[#1F1E18] active:scale-[0.98] transition-all"
                >
                  <Home size={18} />
                  RETURN HOME
                </button>
              </div>

              <button
                onClick={this.handleHardReset}
                className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline mx-auto"
              >
                <Trash2 size={12} />
                Perform Hard Reset
              </button>
              
              <div className="mt-12 pt-8 border-t border-[#EBE4CF] dark:border-[#1F1E18]">
                <p className="text-[10px] font-bold text-[#787567] dark:text-[#BDB8A4] tracking-[0.2em] uppercase">
                  SKY OS Error Recovery Protocol v2.5
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
