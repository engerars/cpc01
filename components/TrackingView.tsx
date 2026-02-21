
import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, X, CreditCard, Calendar, Wallet
} from 'lucide-react';
import { Project, Vendor, Contract, TrackingRecord, FlattenedTracking, Payment } from '../types';
import { formatCurrency } from '../constants';

interface Props {
  records: FlattenedTracking[];
  projects: Project[];
  vendors: Vendor[];
  contracts: Contract[];
  onUpdateTracking: (records: TrackingRecord[]) => void;
  onUpdatePayments: (payments: Payment[]) => void;
}

const TrackingView: React.FC<Props> = ({ records, projects, vendors, contracts, onUpdateTracking, onUpdatePayments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<TrackingRecord> | null>(null);
  const [activeRecordForPayment, setActiveRecordForPayment] = useState<FlattenedTracking | null>(null);

  const filteredRecords = records.filter(r => 
    r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.contents.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Xóa hồ sơ này sẽ xóa toàn bộ lịch sử thanh toán liên quan. Tiếp tục?')) {
      onUpdateTracking(records.filter(r => r.id !== id));
      // Payments deletion is handled by App.tsx cleanup if needed or manually here
      const currentPayments = JSON.parse(localStorage.getItem('cpc_payments') || '[]');
      onUpdatePayments(currentPayments.filter((p: Payment) => p.trackingId !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: TrackingRecord = {
      id: editingRecord?.id || Date.now().toString(),
      contractId: formData.get('contractId') as string,
      cpc: formData.get('cpc') as string,
      contents: formData.get('contents') as string,
      amount: Number(formData.get('amount')),
      paymentDue: formData.get('paymentDue') as string,
      lineTracking: formData.get('lineTracking') as string,
      notes: formData.get('notes') as string,
      status: (editingRecord?.status || 'Pending') as any
    };

    if (editingRecord?.id) {
      onUpdateTracking(records.map(r => r.id === editingRecord.id ? newRecord : r));
    } else {
      onUpdateTracking([...records, newRecord]);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRecordForPayment) return;
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      trackingId: activeRecordForPayment.id,
      date: formData.get('date') as string,
      amount: amount,
      source: formData.get('source') as string,
    };

    const currentPayments = JSON.parse(localStorage.getItem('cpc_payments') || '[]');
    onUpdatePayments([...currentPayments, newPayment]);
    setIsPaymentModalOpen(false);
    setActiveRecordForPayment(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Hồ sơ CPC</h2>
          <p className="text-slate-500 text-sm font-medium">Quản lý và theo dõi tiến độ giải ngân</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên dự án, NCC, mã CPC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-sm transition-all shadow-sm" 
            />
          </div>
          <button 
            onClick={() => { setEditingRecord({}); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> Tạo hồ sơ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-4">Dự án</th>
                <th className="p-4">CPC / HĐ</th>
                <th className="p-4">Nhà cung cấp</th>
                <th className="p-4 text-right">Giá trị HĐ</th>
                <th className="p-4 text-center">Hạn TT</th>
                <th className="p-4 text-right text-indigo-600">Đã TT</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 leading-tight">{item.projectName}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{item.contents}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-indigo-600 uppercase text-xs">{item.cpc}</div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{item.contractCode}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-600">{item.vendorShort}</div>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">{formatCurrency(item.amount)}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black border border-red-100 uppercase">
                      <Calendar size={10} /> {item.paymentDue}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-black text-emerald-600">{formatCurrency(item.totalPaid)}</div>
                    <div className="text-[9px] text-slate-400 font-bold italic">
                      {Math.round((item.totalPaid/item.amount)*100)}%
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                      item.status === 'Paid' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-50' 
                        : (item.status === 'Partial' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500')
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setActiveRecordForPayment(item); setIsPaymentModalOpen(true); }}
                        title="Ghi nhận thanh toán"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <CreditCard size={16} />
                      </button>
                      <button 
                        onClick={() => { setEditingRecord(item); setIsModalOpen(true); }}
                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-slate-300">
                    <Search className="mx-auto mb-3 opacity-20" size={48} />
                    <p className="font-bold text-sm">Không tìm thấy hồ sơ phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Record CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl border border-white/20 animate-slideUp overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {editingRecord?.id ? 'Chỉnh sửa hồ sơ' : 'Thiết lập hồ sơ mới'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hồ sơ thanh toán CPC</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hợp đồng liên kết</label>
                <select name="contractId" defaultValue={editingRecord?.contractId || ''} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm appearance-none">
                  <option value="">Chọn hợp đồng...</option>
                  {contracts.map(c => {
                    const v = vendors.find(v => v.id === c.vendorId);
                    return <option key={c.id} value={c.id}>{c.code} - {v?.shortName}</option>
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã CPC</label>
                <input name="cpc" defaultValue={editingRecord?.cpc || ''} required placeholder="CPC-..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-sm text-indigo-600 uppercase" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chi trả</label>
                <input name="contents" defaultValue={editingRecord?.contents || ''} required placeholder="VD: Tạm ứng đợt 1, Thanh toán khối lượng hoàn thành..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Giá trị thanh toán (VNĐ)</label>
                <input name="amount" type="number" defaultValue={editingRecord?.amount || ''} required className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-sm text-indigo-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Hạn thanh toán cuối</label>
                <input name="paymentDue" type="date" defaultValue={editingRecord?.paymentDue || ''} required className="w-full p-4 bg-red-50/50 border border-red-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 font-black text-sm text-red-600" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú thêm</label>
                <textarea name="notes" defaultValue={editingRecord?.notes || ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm" rows={2}></textarea>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Đóng</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Xác nhận Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && activeRecordForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-white/20 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Chi trả thực tế</h3>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Ghi nhận giao dịch</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ thanh toán</div>
              <div className="font-bold text-slate-800">{activeRecordForPayment.cpc}</div>
              <div className="text-xs text-slate-500 italic mt-1">{activeRecordForPayment.vendorName}</div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số tiền chi (VNĐ)</label>
                <input 
                  name="amount" 
                  type="number" 
                  defaultValue={activeRecordForPayment.amount - activeRecordForPayment.totalPaid}
                  required 
                  className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 font-black text-lg text-emerald-700" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày thực hiện</label>
                <input 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nguồn tiền / Tài khoản</label>
                <select name="source" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                  <option value="Vietcombank">Vietcombank - Chính</option>
                  <option value="BIDV">BIDV - Phụ</option>
                  <option value="Cash">Tiền mặt</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all mt-4 flex items-center justify-center gap-2">
                <Wallet size={18} /> Xác nhận Chi trả
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingView;
