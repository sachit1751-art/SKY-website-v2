import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SpotlightCard } from '../SpotlightCard';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
}

export const RecentActivityWidget: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return;
      }

      const logs = (data || []).map(log => ({
        id: log.id,
        adminId: log.admin_uid,
        action: log.action,
        targetId: '',
        timestamp: log.created_at
      }));
      setActivities(logs);
    };

    fetchLogs();
    
    // Set up a lightweight polling interval to emulate the real-time feedback loop safely
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return null;

  return (
    <SpotlightCard className="p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] shadow-xs">
      <h2 className="font-black text-lg mb-4 text-[#121212] dark:text-[#F4EFE6]">Recent Activity</h2>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-[#FAF3DD]/50 dark:bg-[#1F1E18]/50 p-3 rounded-full mb-3">
            <ShieldAlert size={24} className="text-[#BDB8A4]" />
          </div>
          <p className="text-sm font-medium text-[#121212] dark:text-[#F4EFE6]">No activity found</p>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-1">
            System changes will appear here once recorded.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.map(activity => (
            <li key={activity.id} className="flex gap-3 text-sm">
              <ShieldAlert size={16} className="text-[#FDE694] mt-0.5" />
              <div>
                <p className="text-[#121212] dark:text-[#F4EFE6] font-medium">
                  {activity.action}
                </p>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SpotlightCard>
  );
};
