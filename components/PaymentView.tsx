
import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Search, Download } from 'lucide-react';
import { FlattenedTracking, Payment } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  records: FlattenedTracking[];
  onUpdatePayments: (payments: Payment[]) => void;
}

const PaymentView: React.FC<Props> = ({ records, onUpdatePayments }) => {
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState('');

  const allPayments = useMemo(() => {
    const list: any[] = [];
    records.forEach(r => {
      r.pays.forEach(p => {
        list.push({
          ...p,
          projectName: r.projectName,
          cpc: r.cpc,
          vendorShort: r.vendorShort,
          contractCode: r.contractCode,
          contents: r.contents,
          month: p.date.substring(0, 7)
        });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const filteredPayments = allPayments.filter(p => 
    p.month === monthFilter &&
    (p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.cpc.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.vendorShort.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Chi trả hàng tháng</h2>
          <p className="text-slate-500 text-sm">Theo dõi dòng tiền chi ra</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm">
            <Calendar size={16} className="text-indigo-600" />
            <input 
              type="month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="outline-none text-sm font-bold bg-transparent cursor-pointer"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-medium w-48 md:w-64" 
            />
          </div>
          <button className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Thanh toán trong tháng {monthFilter}
          </div>
          <div className="text-sm font-black text-emerald-600">
            Tổng cộng: {formatCurrency(filteredPayments.reduce((s, p) => s + p.amount, 0))}
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Ngày chi</th>
                <th className="p-4">Dự án</th>
                <th className="p-4">Mã CPC</th>
                <th className="p-4">Nhà cung cấp</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4">Nguồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 font-bold">{p.date}</td>
                  <td className="p-4 font-bold text-slate-800">{p.projectName}</td>
                  <td className="p-4">
                    <div className="font-black text-indigo-600">{p.cpc}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-600">{p.vendorShort}</td>
                  <td className="p-4 text-right font-black text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black uppercase">
                      {p.source || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                    Không có giao dịch thanh toán nào trong tháng này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
