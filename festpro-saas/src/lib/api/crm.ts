import { createClient } from '@/lib/supabase/server'
import { SalesLead, DemoBooking } from '@/types/crm'

export async function createLead(data: {
  organization_name: string,
  contact_person: string,
  email: string,
  phone: string,
  plan_interested?: string,
  expected_launch_date?: string,
  notes?: string
}) {
  const supabase = await createClient()

  const { data: lead, error } = await supabase
    .from('sales_leads')
    .insert({
      organization_name: data.organization_name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      plan_interested: data.plan_interested,
      expected_launch_date: data.expected_launch_date,
      notes: data.notes,
      status: 'New Lead'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return lead
}

export async function bookDemo(leadId: string, date: string) {
  const supabase = await createClient()

  const { data: demo, error } = await supabase
    .from('demo_bookings')
    .insert({
      lead_id: leadId,
      scheduled_at: date,
      status: 'Scheduled'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return demo
}

export async function addCustomerNote(leadId: string, note: string, authorId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customer_notes')
    .insert({
      lead_id: leadId,
      note: note,
      author_id: authorId
    })

  if (error) throw new Error(error.message)
}
