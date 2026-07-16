"use client";
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRobot } from '@/hooks/useRobot';

interface LinkRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LinkRobotModal({ isOpen, onClose }: LinkRobotModalProps) {
  const { linkRobot, isLoading, error: robotError } = useRobot();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Robot code is required');
      return;
    }
    setError('');
    const res = await linkRobot(code, name || undefined);
    if (res) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        setName('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-secondaryBg border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-foreground mb-2">Link AquaBuddy Robot</h3>
        <p className="text-foreground/60 font-light text-xs mb-6">Enter the unique 8-character activation code printed on the hardware decal.</p>

        {success ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center font-medium">
            Robot linked successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || robotError) && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                {error || robotError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Robot Code *</label>
              <input
                type="text"
                placeholder="AQB-XXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all text-sm uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Robot Custom Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Backyard Extractor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-70 transition-colors text-sm mt-6 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Device'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
