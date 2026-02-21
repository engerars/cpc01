
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  TableProperties, 
  CreditCard, 
  Settings, 
  Plus,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { db } from './services/dbService';
import { Project, Vendor, Contract, TrackingRecord, Payment, FlattenedTracking } from './types';
import TrackingView from './components/TrackingView';
import PaymentView from './components/PaymentView';
import MasterDataView from './components/MasterDataView';
import DashboardView from './components/DashboardView';

type Tab = 'dashboard' | 'tracking' | 'payment' | 'master';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('tracking');
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tracking, setTracking] = useState<TrackingRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Load Initial Data
  useEffect(() => {
    setProjects(db.getProjects());
    setVendors(db.getVendors());
    setContracts(db.getContracts());
    setTracking(db.getTracking());
    setPayments(db.getPayments());
  }, []);

  // Save changes automatically
  useEffect(() => { db.saveProjects(projects); }, [projects]);
  useEffect(() => { db.saveVendors(vendors); }, [vendors]);
  useEffect(() => { db.saveContracts(contracts); }, [contracts]);
  useEffect(() => { db.saveTracking(tracking); }, [tracking]);
  useEffect(() => { db.savePayments(payments); }, [payments]);

  // Flattened Data for Views
  const flattenedRecords: FlattenedTracking[] = useMemo(() => {
    return tracking.map(t => {
      const contract = contracts.find(c => c.id === t.contractId);
      const project = projects.find(p => p.id === contract?.projectId);
      const vendor = vendors.find(v => v.id === contract?.vendorId);
      const recordPayments = payments.filter(p => p.trackingId === t.id);
      const totalPaid = recordPayments.reduce((acc, curr) => acc + curr.amount, 0);
      
      return {
        ...t,
        projectName: project?.name || 'Không xác định',
        vendorName: vendor?.name || 'Không xác định',
        vendorShort: vendor?.shortName || 'N/A',
        contractCode: contract?.code || 'N/A',
        totalPaid,
        status: totalPaid >= t.amount ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Pending'),
        pays: recordPayments
      };
    });
  }, [tracking, contracts, projects, vendors, payments]);

  const navigation = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tracking', name: 'Hồ sơ CPC', icon: TableProperties },
    { id: 'payment', name: 'Lịch sử Chi', icon: CreditCard },
    { id: 'master', name: 'Danh mục', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 z-40">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">CPC PRO</h1>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Management System</span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hệ thống sẵn sàng</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">Dữ liệu được lưu trữ an toàn trên trình duyệt của bạn.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              records={flattenedRecords} 
              payments={payments}
            />
          )}
          {activeTab === 'tracking' && (
            <TrackingView 
              records={flattenedRecords} 
              projects={projects}
              vendors={vendors}
              contracts={contracts}
              onUpdateTracking={setTracking}
              onUpdatePayments={setPayments}
            />
          )}
          {activeTab === 'payment' && (
            <PaymentView 
              records={flattenedRecords} 
              onUpdatePayments={setPayments}
            />
          )}
          {activeTab === 'master' && (
            <MasterDataView 
              projects={projects}
              vendors={vendors}
              contracts={contracts}
              onUpdateProjects={setProjects}
              onUpdateVendors={setVendors}
              onUpdateContracts={setContracts}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
