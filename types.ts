
export interface Project {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  shortName: string;
}

export interface Contract {
  id: string;
  code: string;
  contents: string;
  projectId: string;
  vendorId: string;
}

export interface Payment {
  id: string;
  trackingId: string;
  date: string;
  amount: number;
  source: string;
}

export interface TrackingRecord {
  id: string;
  contractId: string;
  cpc: string;
  contents: string;
  amount: number;
  paymentDue: string;
  lineTracking: string;
  notes: string;
  status: 'Pending' | 'Partial' | 'Paid';
}

export interface FlattenedTracking extends TrackingRecord {
  projectName: string;
  vendorName: string;
  vendorShort: string;
  contractCode: string;
  totalPaid: number;
  pays: Payment[];
}
