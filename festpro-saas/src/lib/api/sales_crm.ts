"use server"

import { createClient } from '@/lib/supabase/server'

// -------------- LEADS -------------- //

export async function createCrmLead(data: any) {
  const supabase = await createClient()

  // 1. Create or find Customer Company
  let companyId = null
  if (data.organization_name) {
    const { data: comp } = await supabase
      .from('customer_companies')
      .insert({ name: data.organization_name })
      .select('id')
      .single()
    if (comp) companyId = comp.id
  }

  // 2. Create or find Contact
  let contactId = null
  if (data.email) {
    const { data: cont } = await supabase
      .from('customer_contacts')
      .insert({
        company_id: companyId,
        first_name: data.contact_person || 'Unknown',
        email: data.email,
        phone: data.phone
      })
      .select('id')
      .single()
    if (cont) contactId = cont.id
  }

  // 3. Create Lead
  const { data: lead, error } = await supabase
    .from('crm_leads')
    .insert({
      title: `${data.organization_name || 'New'} - ${data.plan_interested || 'Inquiry'}`,
      company_id: companyId,
      contact_id: contactId,
      source: 'Website',
      status: 'New'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 4. Add to timeline
  if (companyId) {
    await supabase.from('customer_timeline').insert({
      company_id: companyId,
      event_type: 'Lead Created',
      description: 'Lead generated from Website Form'
    })
  }

  return lead
}

export async function fetchLeads() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_leads')
    .select(`
      *,
      customer_companies(name),
      customer_contacts(first_name, last_name, email, phone),
      sales_agents(id)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_leads')
    .update({ status: newStatus })
    .eq('id', leadId)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

// -------------- DEMOS -------------- //

export async function bookCrmDemo(leadId: string, date: string, mode: string, notes: string) {
  const supabase = await createClient()

  const { data: demo, error } = await supabase
    .from('crm_demo_bookings')
    .insert({
      lead_id: leadId,
      scheduled_at: date,
      meeting_mode: mode,
      notes: notes
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Update lead status
  await updateLeadStatus(leadId, 'Demo Scheduled')

  return demo
}

export async function fetchDemos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_demo_bookings')
    .select('*, crm_leads(title, customer_companies(name))')
    .order('scheduled_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// -------------- QUOTATIONS & INVOICES -------------- //

export async function createQuotation(leadId: string, companyId: string, amount: number) {
  const supabase = await createClient()

  // Format QUO-YYYY-XXXX
  const quoteNumber = `QUO-2026-${Math.random().toString().slice(2, 6)}`

  const { data: quote, error } = await supabase
    .from('quotations')
    .insert({
      quote_number: quoteNumber,
      lead_id: leadId,
      company_id: companyId,
      total: amount,
      status: 'Sent'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await updateLeadStatus(leadId, 'Quotation Sent')

  return quote
}

export async function createInvoiceFromQuote(quoteId: string, companyId: string, amount: number) {
  const supabase = await createClient()

  const invNumber = `INV-2026-${Math.random().toString().slice(2, 6)}`
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 15)

  const { data: invoice, error } = await supabase
    .from('sales_invoices')
    .insert({
      invoice_number: invNumber,
      quotation_id: quoteId,
      company_id: companyId,
      amount: amount,
      due_date: dueDate.toISOString(),
      status: 'Pending'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return invoice
}

// -------------- PAYMENTS -------------- //

export async function submitManualPayment(invoiceId: string, amount: number, method: string, proofUrl: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('manual_payments')
    .insert({
      invoice_id: invoiceId,
      amount,
      payment_method: method,
      proof_url: proofUrl,
      status: 'Verification Pending'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchPendingPayments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('manual_payments')
    .select('*, sales_invoices(invoice_number, company_id)')
    .eq('status', 'Verification Pending')

  if (error) throw new Error(error.message)
  return data
}

export async function verifyPayment(paymentId: string) {
  const supabase = await createClient()

  // 1. Verify Payment
  const { data: payment, error } = await supabase
    .from('manual_payments')
    .update({ status: 'Verified', verified_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select('*, sales_invoices(id, company_id)')
    .single()

  if (error) throw new Error(error.message)

  // 2. Mark Invoice Paid
  if (payment.invoice_id) {
    await supabase
      .from('sales_invoices')
      .update({ status: 'Paid' })
      .eq('id', payment.invoice_id)
  }

  return payment
}

// -------------- TIMELINE -------------- //

export async function fetchCustomerTimeline(companyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_timeline')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
