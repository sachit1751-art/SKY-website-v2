import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldAlert, UserPlus, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'admin_request' | 'security_alert' | 'general';
  timestamp: Date;
}

interface AdminNotificationBannerProps {
  className?: string;
}

export const AdminNotificationBanner: React.FC<AdminNotificationBannerProps> = ({ className = '' }) => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastChecked, setLastChecked] = useState<number>(Date.now());

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;

    // Initial check for recent pending admins or logs
    const checkForUpdates = async () => {
      try {
        const now = Date.now();
        // Check for new pending admins if superadmin
        if (isSuperAdmin) {
          const { data: pendingAdmins, error: adminErr } = await supabase
            .from('admins')
            .select('*')
            .eq('approval_status', 'pending')
            .order('created_at', { ascending: false })
            .limit(3);

          if (!adminErr && pendingAdmins && pendingAdmins.length > 0) {
            const latest = pendingAdmins[0];
            const createdTime = new Date(latest.created_at || now).getTime();
            // If created within the last 60 seconds or since last check
            if (createdTime > lastChecked - 30000) {
              const notifId = `admin-req-${latest.id}`;
              setNotifications(prev => {
                if (prev.some(n => n.id === notifId)) return prev;
                const newItem: NotificationItem = {
                  id: notifId,
                  title: 'New Maintainer Request',
                  message: `${latest.name || latest.email || 'A new user'} has requested admin/maintainer approval.`,
                  type: 'admin_request',
                  timestamp: new Date()
                };
                showToast({
                  title: newItem.title,
                  type: 'info'
                });
                return [newItem, ...prev].slice(0, 5);
              });
            }
          }
        }

        // Check recent logs
        const { data: recentLogs, error: logErr } = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!logErr && recentLogs && recentLogs.length > 0) {
          const latestLog = recentLogs[0];
          const logTime = new Date(latestLog.created_at || now).getTime();
          if (logTime > lastChecked - 30000) {
            const logId = `log-${latestLog.id}`;
            setNotifications(prev => {
              if (prev.some(n => n.id === logId)) return prev;
              const newItem: NotificationItem = {
                id: logId,
                title: 'Security / System Event',
                message: latestLog.action || 'New administrative action recorded',
                type: 'security_alert',
                timestamp: new Date()
              };
              return [newItem, ...prev].slice(0, 5);
            });
          }
        }

        setLastChecked(now);
      } catch (err) {
        console.warn('Background notification poll error:', err);
      }
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 30000);

    // Set up Supabase Realtime Channel
    let channel: any = null;
    try {
      channel = supabase
        .channel('admin-realtime-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'admins' },
          (payload: any) => {
            const newAdmin = payload.new;
            if (newAdmin && newAdmin.approval_status === 'pending' && isSuperAdmin) {
              const notifId = `rt-admin-${newAdmin.id}`;
              const newItem: NotificationItem = {
                id: notifId,
                title: 'New Maintainer Application',
                message: `${newAdmin.name || newAdmin.email || 'A user'} applied for maintainer access.`,
                type: 'admin_request',
                timestamp: new Date()
              };
              setNotifications(prev => [newItem, ...prev].slice(0, 5));
              showToast({ title: newItem.title, type: 'info' });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'admin_logs' },
          (payload: any) => {
            const newLog = payload.new;
            if (newLog) {
              const notifId = `rt-log-${newLog.id}`;
              const newItem: NotificationItem = {
                id: notifId,
                title: 'System Activity Alert',
                message: newLog.action || 'New audit log entry recorded.',
                type: 'security_alert',
                timestamp: new Date()
              };
              setNotifications(prev => [newItem, ...prev].slice(0, 5));
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn('Realtime subscription unavailable:', realtimeErr);
    }

    return () => {
      clearInterval(interval);
      if (channel && typeof channel.unsubscribe === 'function') {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [isAdmin, isSuperAdmin, lastChecked, showToast]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`space-y-3 mb-6 ${className}`}>
      {notifications.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-amber-500/5 to-transparent border border-sky-500/20 dark:border-sky-500/30 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {item.type === 'admin_request' ? <UserPlus size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                  {item.title}
                </h4>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                {item.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => dismissNotification(item.id)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Dismiss notification"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
