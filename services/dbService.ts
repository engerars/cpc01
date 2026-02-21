
import { Project, Vendor, Contract, TrackingRecord, Payment } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'cpc_projects',
  VENDORS: 'cpc_vendors',
  CONTRACTS: 'cpc_contracts',
  TRACKING: 'cpc_tracking',
  PAYMENTS: 'cpc_payments',
};

const get = <T,>(key: string, defaultValue: T[]): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const save = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  getProjects: () => get<Project>(STORAGE_KEYS.PROJECTS, [
    { id: 'p1', name: 'Chung cư Blue Sky' },
    { id: 'p2', name: 'Nhà máy Green Tech' }
  ]),
  saveProjects: (data: Project[]) => save(STORAGE_KEYS.PROJECTS, data),

  getVendors: () => get<Vendor>(STORAGE_KEYS.VENDORS, [
    { id: 'v1', name: 'Công ty TNHH Xây dựng Hưng Thịnh', shortName: 'Hưng Thịnh' },
    { id: 'v2', name: 'Tập đoàn Hòa Phát Group', shortName: 'Hòa Phát' }
  ]),
  saveVendors: (data: Vendor[]) => save(STORAGE_KEYS.VENDORS, data),

  getContracts: () => get<Contract>(STORAGE_KEYS.CONTRACTS, [
    { id: 'c1', code: 'HD-2024-001', contents: 'Cung cấp thép xây dựng', projectId: 'p1', vendorId: 'v2' }
  ]),
  saveContracts: (data: Contract[]) => save(STORAGE_KEYS.CONTRACTS, data),

  getTracking: () => get<TrackingRecord>(STORAGE_KEYS.TRACKING, []),
  saveTracking: (data: TrackingRecord[]) => save(STORAGE_KEYS.TRACKING, data),

  getPayments: () => get<Payment>(STORAGE_KEYS.PAYMENTS, []),
  savePayments: (data: Payment[]) => save(STORAGE_KEYS.PAYMENTS, data),
};
