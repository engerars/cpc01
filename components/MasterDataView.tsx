
import React, { useState } from 'react';
import { Building2, Users, FileText, Plus, Edit3, Trash2, X, Check } from 'lucide-react';
import { Project, Vendor, Contract } from '../types';

interface Props {
  projects: Project[];
  vendors: Vendor[];
  contracts: Contract[];
  onUpdateProjects: (data: Project[]) => void;
  onUpdateVendors: (data: Vendor[]) => void;
  onUpdateContracts: (data: Contract[]) => void;
}

const MasterDataView: React.FC<Props> = ({ 
  projects, vendors, contracts, 
  onUpdateProjects, onUpdateVendors, onUpdateContracts 
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'vendors' | 'contracts'>('projects');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>({});

  // Common delete handler with safeguard
  const handleDelete = (type: 'p' | 'v' | 'c', id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa? Thao tác này không thể hoàn tác.')) return;
    
    if (type === 'p') {
      if (contracts.some(c => c.projectId === id)) return alert('Không thể xóa dự án đang có hợp đồng liên kết.');
      onUpdateProjects(projects.filter(p => p.id !== id));
    } else if (type === 'v') {
      if (contracts.some(c => c.vendorId === id)) return alert('Không thể xóa nhà cung cấp đang có hợp đồng liên kết.');
      onUpdateVendors(vendors.filter(v => v.id !== id));
    } else {
      onUpdateContracts(contracts.filter(c => c.id !== id));
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditValue(item);
  };

  const menu = [
    { id: 'projects', name: 'Dự án', icon: Building2 },
    { id: 'vendors', name: 'Nhà cung cấp', icon: Users },
    { id: 'contracts', name: 'Hợp đồng', icon: FileText },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Danh mục hệ thống</h2>
        <p className="text-slate-500 text-sm">Thiết lập dữ liệu nền tảng cho quản lý hồ sơ</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
        {/* Sub-nav */}
        <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/30 p-4">
          <div className="space-y-1">
            {menu.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setEditingId(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeTab === item.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* PROJECTS SECTION */}
          {activeTab === 'projects' && (
            <div className="max-w-2xl">
              <div className="flex gap-3 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <input 
                  type="text" 
                  value={editingId === 'new_p' ? editValue.name : ''}
                  onChange={(e) => { setEditingId('new_p'); setEditValue({ name: e.target.value }); }}
                  placeholder="Tên dự án mới..."
                  className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm"
                />
                <button 
                  onClick={() => {
                    if (!editValue.name) return;
                    onUpdateProjects([...projects, { id: Date.now().toString(), name: editValue.name }]);
                    setEditingId(null); setEditValue({});
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Thêm
                </button>
              </div>

              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="group p-4 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                    {editingId === p.id ? (
                      <div className="flex gap-2 w-full">
                        <input 
                          autoFocus
                          value={editValue.name} 
                          onChange={e => setEditValue({...editValue, name: e.target.value})}
                          className="flex-1 p-2 border rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <button onClick={() => {
                          onUpdateProjects(projects.map(i => i.id === p.id ? editValue : i));
                          setEditingId(null);
                        }} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg"><Check size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 bg-slate-100 rounded-lg"><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700">{p.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 size={16}/></button>
                          <button onClick={() => handleDelete('p', p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VENDORS SECTION */}
          {activeTab === 'vendors' && (
            <div className="max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <input 
                  placeholder="Tên đầy đủ..."
                  className="md:col-span-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm"
                  id="v-name"
                />
                <input 
                  placeholder="Tên viết tắt..."
                  className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm"
                  id="v-short"
                />
                <button 
                  onClick={() => {
                    const name = (document.getElementById('v-name') as HTMLInputElement).value;
                    const short = (document.getElementById('v-short') as HTMLInputElement).value;
                    if (!name || !short) return;
                    onUpdateVendors([...vendors, { id: Date.now().toString(), name, shortName: short }]);
                    (document.getElementById('v-name') as HTMLInputElement).value = '';
                    (document.getElementById('v-short') as HTMLInputElement).value = '';
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Thêm
                </button>
              </div>

              <div className="space-y-3">
                {vendors.map(v => (
                  <div key={v.id} className="group p-4 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                    {editingId === v.id ? (
                      <div className="flex gap-2 w-full">
                        <input value={editValue.name} onChange={e => setEditValue({...editValue, name: e.target.value})} className="flex-1 p-2 border rounded-lg font-bold text-sm" />
                        <input value={editValue.shortName} onChange={e => setEditValue({...editValue, shortName: e.target.value})} className="w-32 p-2 border rounded-lg font-bold text-sm" />
                        <button onClick={() => {
                          onUpdateVendors(vendors.map(i => i.id === v.id ? editValue : i));
                          setEditingId(null);
                        }} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg"><Check size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 bg-slate-100 rounded-lg"><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{v.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{v.shortName}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(v)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 size={16}/></button>
                          <button onClick={() => handleDelete('v', v.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTRACTS SECTION */}
          {activeTab === 'contracts' && (
            <div className="max-w-4xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newC: Contract = {
                  id: Date.now().toString(),
                  code: fd.get('code') as string,
                  contents: fd.get('contents') as string,
                  projectId: fd.get('projectId') as string,
                  vendorId: fd.get('vendorId') as string,
                };
                onUpdateContracts([...contracts, newC]);
                e.currentTarget.reset();
              }} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <input name="code" placeholder="Mã HĐ..." required className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm" />
                <select name="projectId" required className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm">
                  <option value="">Chọn Dự án</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="vendorId" required className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm">
                  <option value="">Chọn NCC</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.shortName}</option>)}
                </select>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">Thêm HĐ</button>
                <input name="contents" placeholder="Nội dung chính..." required className="md:col-span-4 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 font-medium text-sm" />
              </form>

              <div className="space-y-3">
                {contracts.map(c => {
                  const p = projects.find(i => i.id === c.projectId);
                  const v = vendors.find(i => i.id === c.vendorId);
                  return (
                    <div key={c.id} className="group p-5 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã HĐ</div>
                          <div className="font-black text-indigo-600 uppercase">{c.code}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dự án</div>
                          <div className="font-bold text-slate-700 truncate">{p?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhà thầu</div>
                          <div className="font-bold text-slate-700">{v?.shortName || 'N/A'}</div>
                        </div>
                        <div className="hidden md:block">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung</div>
                          <div className="text-xs text-slate-500 italic truncate">{c.contents}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button onClick={() => handleDelete('c', c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDataView;
