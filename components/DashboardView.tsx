
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Sparkles, TrendingUp, Wallet, Clock, CheckCircle } from 'lucide-react';
import { FlattenedTracking, Payment } from '../types';
import { formatCurrency } from '../constants';
import { analyzeFinancials } from '../services/geminiService';

interface Props {
  records: FlattenedTracking[];
  payments: Payment[];
}

const DashboardView: React.FC<Props> = ({ records, payments }) => {
  const [aiInsight, setAiInsight] = useState<string>('Đang phân tích dữ liệu...');

  useEffect(() => {
    const fetchInsight = async () => {
      if (records.length > 0) {
        const insight = await analyzeFinancials(records);
        setAiInsight(insight || 'Không có đủ dữ liệu để phân tích.');
      } else {
        setAiInsight('Hãy thêm hồ sơ để bắt đầu phân tích.');
      }
    };
    fetchInsight();
  }, [records]);

  const stats = [
    { label: 'Tổng giá trị', value: records.reduce((s, r) => s + r.amount, 0), icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Đã thanh toán', value: records.reduce((s, r) => s + r.totalPaid, 0), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Còn nợ', value: records.reduce((s, r) => s + (r.amount - r.totalPaid), 0), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const projectData = Array.from(new Set(records.map(r => r.projectName))).map(p => ({
    name: p,
    amount: records.filter(r => r.projectName === p).reduce((s, r) => s + r.amount, 0),
    paid: records.filter(r => r.projectName === p).reduce((s, r) => s + r.totalPaid, 0),
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Tổng quan tài chính</h2>
        <p className="text-slate-500 text-sm">Số liệu thống kê thời gian thực</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-xl font-black text-slate-900`}>{formatCurrency(stat.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" /> Phân bổ theo dự án
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tổng tiền" barSize={40} />
                <Bar dataKey="paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Đã chi" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-indigo-300" />
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-100">AI FINANCIAL INSIGHTS</h3>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed italic opacity-90">
                "{aiInsight}"
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/50 flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Powered by Gemini 3</span>
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
