import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Settings, 
  Plus, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn, INITIAL_DATA, type SQCDPData } from './lib/utils';

// --- Components ---

const GaugeChart = ({ score, category }: { score: number; category: string }) => {
  // Generate 31 segments for a month-view gauge as seen in the screenshot
  const segments = Array.from({ length: 31 }, (_, i) => ({
    value: 1,
    color: i < 15 ? (i % 5 === 0 ? '#EF4444' : '#10B981') : '#E2E8F0'
  }));

  return (
    <div className="relative w-full aspect-square max-w-[180px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="#fff"
            strokeWidth={1}
            startAngle={90}
            endAngle={450}
          >
            {segments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] text-slate-400 font-bold mb-1 opacity-50">1 2 3 ... 31</div>
        <span className="text-5xl font-serif font-bold text-slate-800 leading-none">
          {category.charAt(0)}
        </span>
      </div>
    </div>
  );
};

const MetricCard = ({ data }: { data: SQCDPData }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="data-card flex flex-col gap-4 border-t-2"
      style={{ borderTopColor: 
        data.category === 'SAFETY' ? '#EF4444' : 
        data.category === 'QUALITY' ? '#2563EB' :
        data.category === 'COST' ? '#F59E0B' :
        data.category === 'DELIVERY' ? '#10B981' : '#8B5CF6'
      }}
    >
      <div className="flex justify-center items-center pb-2">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-700 uppercase">
          {data.category}
        </h3>
      </div>

      <div className="py-2">
        <GaugeChart score={data.score} category={data.category} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.stats.slice(0, 2).map((stat, i) => (
          <div key={i} className={cn(
            "flex flex-col items-center p-2 rounded-sm",
            i === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          )}>
             <span className="text-[14px] font-bold">{stat.value}</span>
             <span className="text-[8px] font-bold uppercase tracking-tighter opacity-70">
               {stat.label}
             </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 text-center">
        <div className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
          {data.stats[2]?.value}
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
          {data.stats[2]?.label}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [data, setData] = useState<SQCDPData[]>(INITIAL_DATA);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{message: string, category: string} | null>(null);

  useEffect(() => {
    // 1. Immediately request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification("Notifications Enabled", {
            body: "Welcome to Digital Factory. You will receive live metrics updates.",
            icon: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png'
          });
        }
      });
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // 2. SSE Setup
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setLastUpdate({ message: update.message, category: update.category });
      
      // Update local state randomly to show "real-time" changes
      setData(prev => prev.map(item => {
        if (item.category === update.category) {
          return {
            ...item,
            score: Math.min(100, Math.max(0, item.score + (Math.random() > 0.5 ? 5 : -5)))
          };
        }
        return item;
      }));

      // Browser Notification
      if (Notification.permission === 'granted') {
        new Notification(`Factory Update: ${update.category}`, {
          body: update.message,
          icon: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
          badge: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
          tag: update.category, // Replace previous notification of same category
          silent: false,
          requireInteraction: false
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const requestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification("Notifications Enabled", {
          body: "You will now receive real-time updates from the shop floor."
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#1e293b] text-white px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#f97316] p-1 rounded-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight">DIGITAL FACTORY</span>
        </div>
        
        <nav className="flex items-center gap-4 ml-8 text-[11px] font-semibold text-slate-300">
           <button className="hover:text-white transition-colors">DASHBOARD</button>
           <button className="hover:text-white transition-colors">REPORTS</button>
           <button className="hover:text-white transition-colors">INCIDENTS</button>
           <button className="hover:text-white transition-colors">TEAMS</button>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button 
            onClick={requestNotificationPermission}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-sm transition-all flex items-center gap-2 uppercase tracking-wide",
              notificationsEnabled 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                : "bg-white text-slate-900 hover:bg-slate-100"
            )}
          >
            <Bell className={cn("w-3 h-3", notificationsEnabled && "fill-current")} />
            {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
          </button>
          
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
             <Bell className="w-4 h-4 text-slate-400" />
             <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
               LM
             </div>
             <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white border-b border-[#E0E4E8] px-6 py-3 flex items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-2">
           <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded-sm" />
           <h1 className="font-serif font-bold text-lg text-slate-800">Tier 1 Dashboard</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm cursor-pointer hover:bg-slate-100">
             <Calendar className="w-3.5 h-3.5 text-slate-500" />
             <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">May, 2026</span>
          </div>
          <button className="bg-[#1e293b] text-white px-4 py-1.5 text-[11px] font-bold rounded-sm hover:bg-slate-800 transition-colors uppercase tracking-widest">
            Add Action
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6">
        {/* Real-time Ticker */}
        <AnimatePresence mode="wait">
          {lastUpdate && (
            <motion.div 
              key={lastUpdate.category + lastUpdate.message}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border-l-4 border-l-[#f97316] p-4 mb-4 flex items-center gap-4 shadow-sm">
                <AlertCircle className="w-5 h-5 text-[#f97316]" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Live Update: {lastUpdate.category}</div>
                  <div className="text-sm font-medium text-slate-700">{lastUpdate.message}</div>
                </div>
                <button 
                  onClick={() => setLastUpdate(null)}
                  className="ml-auto text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.map((item) => (
            <div key={item.category}>
              <MetricCard data={item} />
            </div>
          ))}
        </div>

        {/* Bottom Section - Calendar and Detailed Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Calendar View Container */}
          <div className="data-card lg:col-span-1">
            <div className="border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calendar View</h3>
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                <div key={d} className="text-[8px] font-bold text-slate-400 text-center py-1">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square rounded-sm border border-slate-100 flex items-center justify-center text-[9px] font-bold",
                    i % 10 === 0 ? "bg-red-500 text-white" : (i % 7 === 0 ? "bg-emerald-500 text-white" : "text-slate-400")
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-slate-500 uppercase">No Incident</span>
              </div>
            </div>
          </div>

          {/* Metric Bar Charts */}
          <div className="data-card lg:col-span-1">
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metric Count / Bar</h3>
            </div>
            <div className="flex items-end justify-between h-[120px] gap-2 px-2">
              <div className="w-1/3 bg-red-500/20 border-t-2 border-red-500 rounded-t-sm" style={{ height: '30%' }} />
              <div className="w-1/3 bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm" style={{ height: '80%' }} />
              <div className="w-1/3 bg-blue-500/20 border-t-2 border-blue-500 rounded-t-sm" style={{ height: '50%' }} />
            </div>
            <div className="mt-4 grid grid-cols-3 text-[9px] font-bold text-slate-400 text-center">
              <span>LOW</span>
              <span>MED</span>
              <span>HIGH</span>
            </div>
          </div>

          {/* Issue/Action Trend */}
          <div className="data-card lg:col-span-1">
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issue / Action Trend</h3>
            </div>
            <div className="relative h-[120px] w-full overflow-hidden">
               <svg className="w-full h-full" viewBox="0 0 100 50">
                 <path d="M0,45 Q25,5 50,45 T100,25" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                 <path d="M0,40 Q30,45 60,10 T100,5" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
               </svg>
            </div>
            <div className="mt-4 flex justify-between text-[9px] font-bold text-slate-400">
               <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-blue-600" /> ISSUES</div>
               <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500" /> ACTIONS</div>
            </div>
          </div>

          {/* OEE Chart */}
          <div className="data-card lg:col-span-1">
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OEE Distribution</h3>
            </div>
            <div className="flex items-end justify-between h-[120px] gap-1 px-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-full rounded-t-sm",
                    i < 3 ? "bg-red-400" : (i < 6 ? "bg-yellow-400" : "bg-emerald-400")
                  )} 
                  style={{ height: `${Math.random() * 80 + 20}%` }} 
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Availability: 92%</span>
            </div>
          </div>

          {/* Critical Issues */}
          <div className="data-card lg:col-span-1">
            <div className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical Issues</h3>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-700">PRD-{1000 + i}</span>
                     <span className="text-[8px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-sm">CRITICAL</span>
                   </div>
                   <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="bg-red-500 h-full" style={{ width: `${Math.random() * 50 + 20}%` }} />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0E4E8] px-6 py-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div>&copy; 2026 DIGITAL FACTORY SAAS</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600">Documentation</a>
          <a href="#" className="hover:text-slate-600">Support</a>
          <a href="#" className="hover:text-slate-600">API Status</a>
        </div>
      </footer>
    </div>
  );
}
