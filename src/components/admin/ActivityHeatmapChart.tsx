import React, { useMemo } from 'react';
import { SpotlightCard } from '../SpotlightCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Calendar } from 'lucide-react';
import { RomItem } from '../../../shared/types';

interface ActivityHeatmapChartProps {
  roms: RomItem[];
  className?: string;
}

export const ActivityHeatmapChart: React.FC<ActivityHeatmapChartProps> = ({ roms, className = '' }) => {
  // Generate past 30 days data based on ROM creation/update timestamps
  const chartData = useMemo(() => {
    const daysMap = new Map<string, { date: string; label: string; count: number; updates: number }>();
    const now = new Date();

    // Initialize past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap.set(dateKey, { date: dateKey, label, count: 0, updates: 0 });
    }

    // Tally ROM creations and updates
    roms.forEach(rom => {
      const rawDate = rom.updatedAt || rom.createdAt;
      if (rawDate) {
        const dateKey = rawDate.split('T')[0];
        if (daysMap.has(dateKey)) {
          const entry = daysMap.get(dateKey)!;
          entry.count += 1;
        }
      }
    });

    return Array.from(daysMap.values());
  }, [roms]);

  const totalUpdatesPastMonth = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <SpotlightCard className={`p-6 border border-[#EBE4CF] dark:border-[#2C2A22] bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-[#38bdf8]" />
            <h3 className="text-lg font-bold text-[#121212] dark:text-[#F4EFE6] tracking-tight">
              Activity Frequency
            </h3>
          </div>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
            ROM releases and updates recorded over the past 30 days
          </p>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 bg-white dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#36342A] rounded-xl text-xs font-semibold text-[#121212] dark:text-[#F4EFE6]">
          <Calendar size={14} className="text-[#38bdf8]" />
          <span>{totalUpdatesPastMonth} Updates This Month</span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#36342A" opacity={0.3} vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#787567" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              interval={4}
            />
            <YAxis 
              stroke="#787567" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#12110D] border border-[#36342A] p-3 rounded-xl shadow-xl text-xs text-[#F4EFE6]">
                      <p className="font-bold text-[#FDE694] mb-1">{data.label}</p>
                      <p>{data.count} ROM release{data.count === 1 ? '' : 's'} & updates</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#38bdf8" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SpotlightCard>
  );
};
