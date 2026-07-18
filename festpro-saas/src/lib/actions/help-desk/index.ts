"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  HelpDesk, HelpDeskStaff, SupportCategory, SupportPriority, SupportStatus,
  SupportTicket, TicketComment, TicketAttachment, TicketHistory, TicketAssignment,
  TicketSla, TicketEscalation, KnowledgeBaseCategory, KnowledgeArticle, FaqItem,
  VisitorCategoryEnum as VisitorCategoryType, Visitor, VisitorGroup, VisitorPass,
  VisitorCheckin, VisitorCheckoutLog, VisitorHost, MeetingLog,
  LostItem, FoundItem, ClaimRequest, ClaimVerification, ItemHandoverLog,
  FeedbackForm, FeedbackResponse, ServiceRating, Module16DashboardData,
} from "@/types/help-desk"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  if (festivalId) {
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival_id: festivalId } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id } as const
}

function generateTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

function generatePassNumber(): string {
  return `PASS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`
}

function generateQRCode(): string {
  return crypto.randomBytes(32).toString("hex")
}

function addHistory(admin: any, orgId: string, ticketId: string, action: string, fieldName?: string | null, oldVal?: string | null, newVal?: string | null, performedBy?: string | null, notes?: string | null) {
  return admin.from("ticket_history").insert({
    organization_id: orgId, ticket_id: ticketId, action, field_name: fieldName || null,
    old_value: oldVal || null, new_value: newVal || null, performed_by: performedBy || null, notes: notes || null,
  })
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getHelpDeskDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: tt }, { count: ot }, { count: rt }, { count: et },
    { count: tv }, { count: cit }, { count: vv },
    { count: tli }, { count: tfi }, { count: ci }, { count: pc },
    { count: td }, { count: ts },
  ] = await Promise.all([
    admin.from("support_tickets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("support_tickets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["new", "open", "assigned", "in_progress", "reopened"]),
    admin.from("support_tickets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["resolved", "closed"]),
    admin.from("ticket_escalations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).is("resolved_at", null),
    admin.from("visitors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("visitor_checkins").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).gte("check_in_time", `${today}T00:00:00`),
    admin.from("visitors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_vip", true),
    admin.from("lost_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("found_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("lost_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "claimed"),
    admin.from("claim_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "pending"),
    admin.from("help_desks").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("help_desk_staff").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
  ])
  return {
    data: {
      total_tickets: tt || 0, open_tickets: ot || 0, resolved_tickets: rt || 0, escalated_tickets: et || 0,
      total_visitors: tv || 0, checked_in_today: cit || 0, vip_visitors: vv || 0,
      total_lost_items: tli || 0, total_found_items: tfi || 0, claimed_items: ci || 0,
      pending_claims: pc || 0, total_desks: td || 0, total_staff: ts || 0,
      avg_resolution_time: 0, avg_rating: 0, total_feedback: 0,
    } as Module16DashboardData,
  }
}

// ============================================================
// HELP DESKS
// ============================================================

export async function getHelpDesks(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("help_desks").select("*").eq("festival_id", festivalId).order("desk_name")
  if (error) return { error: error.message }
  return { data: data as HelpDesk[] }
}

export async function createHelpDesk(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("help_desks").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    desk_code: form.desk_code, desk_name: form.desk_name, location: form.location || null,
    department: form.department || null, contact_number: form.contact_number || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as HelpDesk }
}

export async function updateHelpDesk(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("help_desks").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as HelpDesk }
}

export async function toggleHelpDesk(id: string, isActive: boolean) {
  const admin = createAdminClient()
  const { error } = await admin.from("help_desks").update({ is_active: isActive }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

export async function deleteHelpDesk(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("help_desks").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// HELP DESK STAFF
// ============================================================

export async function getHelpDeskStaff(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("help_desk_staff").select("*, help_desks(desk_name, desk_code)").eq("festival_id", festivalId)
  if (error) return { error: error.message }
  return { data }
}

export async function assignStaffToDesk(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("help_desk_staff").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    desk_id: form.desk_id, user_id: form.user_id, staff_role: form.staff_role || "agent",
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data }
}

export async function removeDeskStaff(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("help_desk_staff").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// SUPPORT TICKETS
// ============================================================

export async function getTickets(festivalId: string, status?: string, categoryId?: string, priorityId?: string) {
  const admin = createAdminClient()
  let query = admin.from("support_tickets").select("*, support_categories(name), support_priorities(name, color)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  if (categoryId) query = query.eq("category_id", categoryId)
  if (priorityId) query = query.eq("priority_id", priorityId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getTicket(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("support_tickets").select("*, support_categories(name), support_priorities(name, color, priority_level)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createTicket(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const ticketNumber = generateTicketNumber()
  const { data, error } = await admin.from("support_tickets").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    desk_id: form.desk_id || null, ticket_number: ticketNumber,
    subject: form.subject, description: form.description || null,
    category_id: form.category_id || null, priority_id: form.priority_id || null,
    status: "new", source: form.source || "desk",
    submitted_by: auth.user.id, submitter_name: form.submitter_name || null,
    submitter_email: form.submitter_email || null, submitter_phone: form.submitter_phone || null,
    tags: form.tags || [], is_internal: form.is_internal || false,
  }).select().single()
  if (error) return { error: error.message }
  await addHistory(admin, auth.organization_id, data.id, "created", undefined, undefined, undefined, auth.user.id, "Ticket created")
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as SupportTicket }
}

export async function updateTicketStatus(id: string, status: string, resolutionNotes?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: prev } = await admin.from("support_tickets").select("status, organization_id").eq("id", id).single()
  if (!prev) return { error: "Ticket not found" }
  const updates: any = { status }
  if (status === "resolved" || status === "closed") updates.resolved_at = new Date().toISOString()
  if (status === "closed") updates.closed_at = new Date().toISOString()
  if (status === "reopened") updates.reopened_at = new Date().toISOString()
  if (resolutionNotes) updates.resolution_notes = resolutionNotes
  const { data, error } = await admin.from("support_tickets").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  await addHistory(admin, prev.organization_id, id, "status_changed", "status", prev.status, status, auth?.id, resolutionNotes || null)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as SupportTicket }
}

export async function assignTicket(id: string, assignedTo: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: prev } = await admin.from("support_tickets").select("assigned_to, organization_id").eq("id", id).single()
  if (!prev) return { error: "Ticket not found" }
  const { data, error } = await admin.from("support_tickets").update({
    assigned_to: assignedTo, status: "assigned", assigned_at: new Date().toISOString(),
  }).eq("id", id).select().single()
  if (error) return { error: error.message }
  await admin.from("ticket_assignments").insert({
    organization_id: prev.organization_id, ticket_id: id,
    assigned_by: auth?.id, assigned_to: assignedTo,
  })
  await addHistory(admin, prev.organization_id, id, "assigned", "assigned_to", prev.assigned_to, assignedTo, auth?.id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as SupportTicket }
}

export async function transferTicket(id: string, newAssignee: string, reason?: string) {
  const admin = createAdminClient()
  const { data: prev } = await admin.from("support_tickets").select("assigned_to, organization_id").eq("id", id).single()
  if (!prev) return { error: "Ticket not found" }
  const auth = await getAuth()
  const { data, error } = await admin.from("support_tickets").update({
    assigned_to: newAssignee, status: "assigned", assigned_at: new Date().toISOString(),
  }).eq("id", id).select().single()
  if (error) return { error: error.message }
  await admin.from("ticket_assignments").insert({
    organization_id: prev.organization_id, ticket_id: id,
    assigned_by: auth?.id, assigned_to: newAssignee, reason: reason || null,
  })
  await addHistory(admin, prev.organization_id, id, "transferred", "assigned_to", prev.assigned_to, newAssignee, auth?.id, reason || null)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as SupportTicket }
}

export async function mergeTickets(primaryId: string, secondaryIds: string[]) {
  const admin = createAdminClient()
  for (const sid of secondaryIds) {
    const { error } = await admin.from("support_tickets").update({ status: "cancelled", metadata: { merged_into: primaryId } }).eq("id", sid)
    if (error) return { error: error.message }
  }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

export async function escalateTicket(id: string, level: string, escalatedTo?: string, reason?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: prev } = await admin.from("support_tickets").select("assigned_to, organization_id, festival_id").eq("id", id).single()
  if (!prev) return { error: "Ticket not found" }
  const { data, error } = await admin.from("ticket_escalations").insert({
    organization_id: prev.organization_id, festival_id: prev.festival_id,
    ticket_id: id, escalation_level: level, escalated_by: auth?.id,
    escalated_to: escalatedTo || null, reason: reason || null,
    previous_assignee: prev.assigned_to,
  }).select().single()
  if (error) return { error: error.message }
  await addHistory(admin, prev.organization_id, id, "escalated", "escalation_level", undefined, level, auth?.id, reason || null)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data }
}

export async function deleteTicket(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("support_tickets").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// TICKET COMMENTS
// ============================================================

export async function getTicketComments(ticketId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ticket_comments").select("*").eq("ticket_id", ticketId).order("created_at")
  if (error) return { error: error.message }
  return { data: data as TicketComment[] }
}

export async function addTicketComment(ticketId: string, senderName: string, comment: string, isInternal = false) {
  const auth = await getAuth()
  if (!auth) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: ticket } = await admin.from("support_tickets").select("organization_id, festival_id").eq("id", ticketId).single()
  if (!ticket) return { error: "Ticket not found" }
  const { data, error } = await admin.from("ticket_comments").insert({
    organization_id: ticket.organization_id, ticket_id: ticketId,
    sender_id: auth.id, sender_name: senderName, comment, is_internal: isInternal,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as TicketComment }
}

// ============================================================
// TICKET ATTACHMENTS
// ============================================================

export async function getTicketAttachments(ticketId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ticket_attachments").select("*").eq("ticket_id", ticketId)
  if (error) return { error: error.message }
  return { data: data as TicketAttachment[] }
}

export async function addTicketAttachment(ticketId: string, fileName: string, fileUrl: string, fileSize?: number, mimeType?: string) {
  const auth = await getAuth()
  if (!auth) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: ticket } = await admin.from("support_tickets").select("organization_id").eq("id", ticketId).single()
  if (!ticket) return { error: "Ticket not found" }
  const { data, error } = await admin.from("ticket_attachments").insert({
    organization_id: ticket.organization_id, ticket_id: ticketId,
    file_name: fileName, file_url: fileUrl, file_size: fileSize || null,
    mime_type: mimeType || null, uploaded_by: auth.id,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as TicketAttachment }
}

// ============================================================
// TICKET HISTORY
// ============================================================

export async function getTicketHistory(ticketId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ticket_history").select("*").eq("ticket_id", ticketId).order("created_at")
  if (error) return { error: error.message }
  return { data: data as TicketHistory[] }
}

// ============================================================
// KNOWLEDGE BASE
// ============================================================

export async function getKnowledgeCategories(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("knowledge_base_categories").select("*").eq("festival_id", festivalId).order("sort_order")
  if (error) return { error: error.message }
  return { data: data as KnowledgeBaseCategory[] }
}

export async function getKnowledgeArticles(festivalId: string, categoryId?: string) {
  const admin = createAdminClient()
  let query = admin.from("knowledge_articles").select("*, knowledge_base_categories(name)").eq("festival_id", festivalId).eq("is_published", true).order("sort_order")
  if (categoryId) query = query.eq("category_id", categoryId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createKnowledgeArticle(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("knowledge_articles").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, title: form.title, content: form.content || null,
    tags: form.tags || [], is_published: form.is_published ?? true, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as KnowledgeArticle }
}

export async function deleteKnowledgeArticle(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("knowledge_articles").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// FAQ
// ============================================================

export async function getFaqItems(festivalId: string, categoryId?: string) {
  const admin = createAdminClient()
  let query = admin.from("faq_items").select("*, knowledge_base_categories(name)").eq("festival_id", festivalId).eq("is_published", true).order("sort_order")
  if (categoryId) query = query.eq("category_id", categoryId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createFaqItem(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("faq_items").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, question: form.question, answer: form.answer,
    tags: form.tags || [], created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as FaqItem }
}

export async function deleteFaqItem(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("faq_items").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VISITORS
// ============================================================

export async function getVisitors(festivalId: string, category?: string, search?: string) {
  const admin = createAdminClient()
  let query = admin.from("visitors").select("*, visitor_categories(name, pass_color)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (category) query = query.eq("visitor_category", category)
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getVisitor(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitors").select("*, visitor_categories(name, pass_color)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createVisitor(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitors").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, visitor_category: form.visitor_category || "general",
    first_name: form.first_name, last_name: form.last_name,
    email: form.email || null, phone: form.phone || null,
    photo_url: form.photo_url || null, address: form.address || null,
    city: form.city || null, state: form.state || null,
    id_proof_type: form.id_proof_type || null, id_proof_number: form.id_proof_number || null,
    company_name: form.company_name || null, designation: form.designation || null,
    purpose_of_visit: form.purpose_of_visit || null,
    host_name: form.host_name || null, host_department: form.host_department || null, host_contact: form.host_contact || null,
    is_vip: form.is_vip || false, notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as Visitor }
}

export async function updateVisitor(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitors").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Visitor }
}

export async function blacklistVisitor(id: string, blacklisted: boolean) {
  const admin = createAdminClient()
  const { error } = await admin.from("visitors").update({ is_blacklisted: blacklisted }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

export async function deleteVisitor(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("visitors").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VISITOR PASSES
// ============================================================

export async function getVisitorPasses(festivalId: string, visitorId?: string) {
  const admin = createAdminClient()
  let query = admin.from("visitor_passes").select("*, visitors(first_name, last_name, visitor_category)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (visitorId) query = query.eq("visitor_id", visitorId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function generateVisitorPass(visitorId: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: visitor } = await admin.from("visitors").select("organization_id, festival_id, visitor_category, first_name, last_name").eq("id", visitorId).single()
  if (!visitor) return { error: "Visitor not found" }
  const passNumber = generatePassNumber()
  const qrCode = generateQRCode()
  const { data, error } = await admin.from("visitor_passes").insert({
    organization_id: visitor.organization_id, festival_id: visitor.festival_id,
    visitor_id: visitorId, pass_number: passNumber, pass_type: visitor.visitor_category,
    qr_code: qrCode, qr_code_url: `/api/qr/${passNumber}`,
    issued_by: auth?.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as VisitorPass }
}

export async function deactivateVisitorPass(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("visitor_passes").update({ is_active: false }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VISITOR CHECK-INS
// ============================================================

export async function getVisitorCheckins(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitor_checkins").select("*, visitors(first_name, last_name, visitor_category, photo_url), help_desks(desk_name)").eq("festival_id", festivalId).order("check_in_time", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function checkInVisitor(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: visitor } = await admin.from("visitors").select("total_visits").eq("id", form.visitor_id).single()
  const { data, error } = await admin.from("visitor_checkins").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    visitor_id: form.visitor_id, pass_id: form.pass_id || null,
    group_id: form.group_id || null, check_in_method: form.check_in_method || "manual",
    checked_in_by: auth.user.id, desk_id: form.desk_id || null,
    badge_issued: form.badge_issued || false, badge_number: form.badge_number || null,
    vehicle_number: form.vehicle_number || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("visitors").update({ total_visits: (visitor?.total_visits || 0) + 1, last_visit_date: new Date().toISOString() }).eq("id", form.visitor_id)
  if (form.pass_id) {
    await admin.from("visitor_passes").update({ is_used: true, used_at: new Date().toISOString() }).eq("id", form.pass_id)
  }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as VisitorCheckin }
}

export async function checkOutVisitor(checkinId: string, notes?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: checkin } = await admin.from("visitor_checkins").select("organization_id, festival_id, visitor_id").eq("id", checkinId).single()
  if (!checkin) return { error: "Checkin not found" }
  const { data, error } = await admin.from("visitor_checkout_logs").insert({
    organization_id: checkin.organization_id, festival_id: checkin.festival_id,
    checkin_id: checkinId, visitor_id: checkin.visitor_id,
    checked_out_by: auth?.id, notes: notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data }
}

// ============================================================
// VISITOR GROUPS
// ============================================================

export async function getVisitorGroups(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitor_groups").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as VisitorGroup[] }
}

export async function createVisitorGroup(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitor_groups").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    group_name: form.group_name, group_type: form.group_type || "general",
    member_count: form.member_count || 0, contact_person: form.contact_person || null,
    contact_phone: form.contact_phone || null, contact_email: form.contact_email || null,
    organization_name: form.organization_name || null, purpose: form.purpose || null,
    expected_checkin: form.expected_checkin || null, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as VisitorGroup }
}

export async function deleteVisitorGroup(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("visitor_groups").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VISITOR HOSTS
// ============================================================

export async function getVisitorHosts(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitor_hosts").select("*").eq("festival_id", festivalId).order("name")
  if (error) return { error: error.message }
  return { data: data as VisitorHost[] }
}

export async function createVisitorHost(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("visitor_hosts").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    name: form.name, email: form.email || null, phone: form.phone || null,
    department: form.department || null, designation: form.designation || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as VisitorHost }
}

export async function deleteVisitorHost(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("visitor_hosts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MEETING LOGS
// ============================================================

export async function getMeetingLogs(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meeting_logs").select("*, visitors(first_name, last_name), visitor_hosts(name)").eq("festival_id", festivalId).order("meeting_time", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createMeetingLog(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("meeting_logs").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    visitor_id: form.visitor_id || null, host_id: form.host_id || null,
    subject: form.subject, description: form.description || null,
    meeting_time: form.meeting_time || null, duration_minutes: form.duration_minutes || null,
    location: form.location || null, notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as MeetingLog }
}

// ============================================================
// LOST ITEMS
// ============================================================

export async function getLostItems(festivalId: string, status?: string, category?: string) {
  const admin = createAdminClient()
  let query = admin.from("lost_items").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as LostItem[] }
}

export async function getLostItem(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("lost_items").select("*").eq("id", id).single()
  if (error) return { error: error.message }
  return { data: data as LostItem }
}

export async function createLostItem(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("lost_items").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    item_name: form.item_name, description: form.description || null,
    category: form.category || "other", color: form.color || null,
    brand: form.brand || null, model: form.model || null, serial_number: form.serial_number || null,
    distinctive_features: form.distinctive_features || null,
    lost_location: form.lost_location || null, lost_date: form.lost_date || null,
    reported_by: auth.user.id, reporter_name: form.reporter_name || null,
    reporter_phone: form.reporter_phone || null, reporter_email: form.reporter_email || null,
    is_valuable: form.is_valuable || false, estimated_value: form.estimated_value || null,
    storage_location: form.storage_location || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as LostItem }
}

export async function updateLostItemStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "claimed") updates.claimed_at = new Date().toISOString()
  if (status === "disposed") updates.disposed_at = new Date().toISOString()
  const { data, error } = await admin.from("lost_items").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as LostItem }
}

export async function deleteLostItem(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("lost_items").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// FOUND ITEMS
// ============================================================

export async function getFoundItems(festivalId: string, status?: string, category?: string) {
  const admin = createAdminClient()
  let query = admin.from("found_items").select("*, lost_items(item_name)").eq("festival_id", festivalId).order("found_at", { ascending: false })
  if (status) query = query.eq("status", status)
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createFoundItem(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("found_items").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    item_name: form.item_name, description: form.description || null,
    category: form.category || "other", color: form.color || null,
    brand: form.brand || null, model: form.model || null, serial_number: form.serial_number || null,
    distinctive_features: form.distinctive_features || null,
    found_location: form.found_location, found_by: auth.user.id,
    finder_name: form.finder_name || null, finder_phone: form.finder_phone || null, finder_email: form.finder_email || null,
    is_valuable: form.is_valuable || false, estimated_value: form.estimated_value || null,
    storage_location: form.storage_location || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as FoundItem }
}

export async function updateFoundItemStatus(id: string, status: string, matchedLostItemId?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "returned") updates.returned_at = new Date().toISOString()
  if (status === "disposed") updates.disposed_at = new Date().toISOString()
  if (matchedLostItemId) updates.matched_lost_item_id = matchedLostItemId
  const { data, error } = await admin.from("found_items").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as FoundItem }
}

export async function deleteFoundItem(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("found_items").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// CLAIM REQUESTS
// ============================================================

export async function getClaimRequests(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("claim_requests").select("*, lost_items(item_name), found_items(item_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createClaimRequest(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("claim_requests").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    lost_item_id: form.lost_item_id || null, found_item_id: form.found_item_id || null,
    claimant_name: form.claimant_name, claimant_email: form.claimant_email || null,
    claimant_phone: form.claimant_phone || null, description: form.description,
    id_proof_type: form.id_proof_type || null, id_proof_number: form.id_proof_number || null,
    proof_of_ownership: form.proof_of_ownership || [], created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as ClaimRequest }
}

export async function updateClaimStatus(id: string, status: string, notes?: string, rejectionReason?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "verified" || status === "under_review") { updates.verified_by = auth?.id; updates.verified_at = new Date().toISOString(); updates.verification_notes = notes || null }
  if (status === "approved") { updates.approved_by = auth?.id; updates.approved_at = new Date().toISOString() }
  if (status === "rejected") updates.rejection_reason = rejectionReason || null
  if (status === "collected") { updates.collected_at = new Date().toISOString(); updates.collected_by_name = notes || null }
  const { data, error } = await admin.from("claim_requests").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  if (status === "collected" && data?.lost_item_id) {
    await admin.from("lost_items").update({ status: "claimed", claimed_at: new Date().toISOString() }).eq("id", data.lost_item_id)
  }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as ClaimRequest }
}

export async function addClaimVerification(claimId: string, verificationType: string, method: string, notes?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: claim } = await admin.from("claim_requests").select("organization_id, festival_id").eq("id", claimId).single()
  if (!claim) return { error: "Claim not found" }
  const { data, error } = await admin.from("claim_verifications").insert({
    organization_id: claim.organization_id, festival_id: claim.festival_id,
    claim_id: claimId, verification_type: verificationType,
    verified_by: auth?.id, is_verified: true, verification_method: method, notes: notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as ClaimVerification }
}

// ============================================================
// FEEDBACK
// ============================================================

export async function getFeedbackForms(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("feedback_forms").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as FeedbackForm[] }
}

export async function createFeedbackForm(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("feedback_forms").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    title: form.title, description: form.description || null,
    form_type: form.form_type || "general", questions: form.questions || [],
    valid_from: form.valid_from || new Date().toISOString(),
    valid_until: form.valid_until || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/help-desk`)
  return { data: data as FeedbackForm }
}

export async function submitFeedbackResponse(formId: string, responses: any, festivalId: string, respondent?: any) {
  const auth = await checkOrgAccess(festivalId)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("feedback_responses").insert({
    organization_id: auth.organization_id, festival_id: festivalId,
    form_id: formId, respondent_name: respondent?.name || null,
    respondent_email: respondent?.email || null, respondent_phone: respondent?.phone || null,
    responses,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as FeedbackResponse }
}

export async function getFeedbackResponses(festivalId: string, formId?: string) {
  const admin = createAdminClient()
  let query = admin.from("feedback_responses").select("*, feedback_forms(title, form_type)").eq("festival_id", festivalId).order("submitted_at", { ascending: false })
  if (formId) query = query.eq("form_id", formId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// SERVICE RATINGS
// ============================================================

export async function getServiceRatings(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("service_ratings").select("*, support_tickets(ticket_number)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function submitServiceRating(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("service_ratings").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    ticket_id: form.ticket_id || null, desk_id: form.desk_id || null,
    rating: form.rating, category: form.category || null,
    comment: form.comment || null, visitor_name: form.visitor_name || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as ServiceRating }
}

// ============================================================
// SUPPORT CATEGORIES / PRIORITIES / STATUSES (lookup seed)
// ============================================================

export async function getSupportCategories() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("support_categories").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as SupportCategory[] }
}

export async function getSupportPriorities() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("support_priorities").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as SupportPriority[] }
}

export async function getSupportStatuses() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("support_statuses").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as SupportStatus[] }
}

// ============================================================
// SEARCH
// ============================================================

export async function searchHelpDesk(festivalId: string, query: string) {
  const admin = createAdminClient()
  const [tickets, visitors, lost, found] = await Promise.all([
    admin.from("support_tickets").select("ticket_number, subject, status").eq("festival_id", festivalId).or(`ticket_number.ilike.%${query}%,subject.ilike.%${query}%,submitter_name.ilike.%${query}%`).limit(10),
    admin.from("visitors").select("id, first_name, last_name, visitor_category, email, phone").eq("festival_id", festivalId).or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`).limit(10),
    admin.from("lost_items").select("id, item_name, status, category").eq("festival_id", festivalId).or(`item_name.ilike.%${query}%,description.ilike.%${query}%`).limit(10),
    admin.from("found_items").select("id, item_name, status, category").eq("festival_id", festivalId).or(`item_name.ilike.%${query}%,description.ilike.%${query}%`).limit(10),
  ])
  return { tickets: tickets.data || [], visitors: visitors.data || [], lost_items: lost.data || [], found_items: found.data || [] }
}

// ============================================================
// SLA MANAGEMENT
// ============================================================

export async function getSlaRules(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ticket_sla").select("*, support_categories(name)").eq("festival_id", festivalId)
  if (error) return { error: error.message }
  return { data }
}

export async function createSlaRule(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("ticket_sla").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, priority: form.priority,
    response_time_minutes: form.response_time_minutes, resolution_time_minutes: form.resolution_time_minutes,
    escalation_minutes: form.escalation_minutes || [120, 240, 480],
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as TicketSla }
}

// ============================================================
// ANALYTICS
// ============================================================

export async function getTicketAnalytics(festivalId: string) {
  const admin = createAdminClient()
  const [statusDist, priorityDist, categoryDist, dailyTrend] = await Promise.all([
    admin.from("support_tickets").select("status").eq("festival_id", festivalId),
    admin.from("support_tickets").select("priority_id").eq("festival_id", festivalId),
    admin.from("support_tickets").select("category_id").eq("festival_id", festivalId),
    admin.from("support_tickets").select("created_at").eq("festival_id", festivalId).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
  ])
  return { statusDistribution: statusDist.data, priorityDistribution: priorityDist.data, categoryDistribution: categoryDist.data, dailyTrend: dailyTrend.data }
}

export async function getVisitorAnalytics(festivalId: string) {
  const admin = createAdminClient()
  const [categoryDist, hourlyTrend] = await Promise.all([
    admin.from("visitors").select("visitor_category").eq("festival_id", festivalId),
    admin.from("visitor_checkins").select("check_in_time").eq("festival_id", festivalId).gte("check_in_time", new Date(Date.now() - 7 * 86400000).toISOString()),
  ])
  return { categoryDistribution: categoryDist.data, checkinTrend: hourlyTrend.data }
}
