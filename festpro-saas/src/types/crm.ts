export type LeadStatus = 'New Lead' | 'Contacted' | 'Demo Scheduled' | 'Negotiation' | 'Won' | 'Lost';

export interface SalesLead {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string | null;
  phone: string;
  plan_interested: string | null;
  expected_launch_date: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemoBooking {
  id: string;
  lead_id: string;
  scheduled_at: string;
  meeting_link: string | null;
  status: string;
  created_at: string;
}

export interface Quotation {
  id: string;
  lead_id: string;
  amount: number;
  valid_until: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  lead_id: string;
  amount: number;
  due_date: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  lead_id: string;
  note: string;
  author_id: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  action: string;
  description: string | null;
  created_at: string;
}
