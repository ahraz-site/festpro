"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  AccommodationLocation, AccommodationBuilding, BuildingFloor, RoomType, Room, Bed,
  RoomFacility, RoomMaintenance, RoomAllocation, BedAllocation, RoomChangeRequest,
  Checkin, Checkout, OccupancyLog, TransportHub, Route, RouteStop, VehicleCategory,
  Vehicle, VehicleDocument, Driver, DriverDocument, DriverAssignment, TripSchedule,
  TripAssignment, TripLog, FuelLog, VehicleMaintenance, TransportRequest,
  TransportBooking, PickupPoint, DropPoint, GpsTrackingLog, Module18DashboardData,
} from "@/types/accommodation-transport"

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

function generateNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

function generateQR(): string {
  return crypto.randomBytes(16).toString("hex")
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getAccommodationTransportDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: tl }, { count: tbld }, { count: tr }, { count: tbed },
    ar, ocr, { count: talloc }, { count: ci }, { count: co },
    { count: tv }, { count: av }, { count: iuv },
    { count: tdr }, { count: adr }, { count: otd },
    { count: ttr }, { count: act }, { count: ctr }, fc,
    { count: ptr }, { count: pm },
  ] = await Promise.all([
    admin.from("accommodation_locations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("accommodation_buildings").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("rooms").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("beds").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("rooms").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "available"),
    admin.from("rooms").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).neq("status", "available"),
    admin.from("room_allocations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("checkins").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("checkouts").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("vehicles").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("vehicles").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "available"),
    admin.from("vehicles").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "in_use"),
    admin.from("drivers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("drivers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "available"),
    admin.from("drivers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "on_trip"),
    admin.from("trip_schedules").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("trip_schedules").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["scheduled", "in_progress"]),
    admin.from("trip_schedules").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "completed"),
    admin.from("fuel_logs").select("total_cost").eq("festival_id", festivalId),
    admin.from("transport_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "pending"),
    admin.from("vehicle_maintenance").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["scheduled", "in_progress"]),
  ])
  const totalFuel = fc.data?.reduce((s: number, r: any) => s + Number(r.total_cost), 0) || 0
  const totalRooms = tr || 1
  return {
    data: {
      total_locations: tl || 0, total_buildings: tbld || 0, total_rooms: tr || 0, total_beds: tbed || 0,
      available_rooms: ar.count || 0, occupied_rooms: ocr.count || 0,
      occupancy_rate: Math.round(((ocr.count || 0) / totalRooms) * 100),
      total_allocations: talloc || 0, checked_in: ci || 0, checked_out: co || 0,
      total_vehicles: tv || 0, available_vehicles: av || 0, in_use_vehicles: iuv || 0,
      total_drivers: tdr || 0, available_drivers: adr || 0, on_trip_drivers: otd || 0,
      total_trips: ttr || 0, active_trips: act || 0, completed_trips: ctr || 0,
      pending_transport_requests: ptr || 0, total_fuel_cost: totalFuel, pending_maintenance: pm || 0,
    } as Module18DashboardData,
  }
}

// ============================================================
// ACCOMMODATION LOCATIONS
// ============================================================

export async function getAccommodationLocations(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_locations").select("*").eq("festival_id", festivalId).order("name")
  if (error) return { error: error.message }
  return { data: data as AccommodationLocation[] }
}

export async function getAccommodationLocation(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_locations").select("*").eq("id", id).single()
  if (error) return { error: error.message }
  return { data: data as AccommodationLocation }
}

export async function createAccommodationLocation(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_locations").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    name: form.name, location_code: form.location_code, address: form.address || null,
    city: form.city || null, state: form.state || null, pincode: form.pincode || null,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as AccommodationLocation }
}

export async function updateAccommodationLocation(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_locations").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AccommodationLocation }
}

export async function deleteAccommodationLocation(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("accommodation_locations").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ACCOMMODATION BUILDINGS
// ============================================================

export async function getAccommodationBuildings(locationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_buildings").select("*").eq("location_id", locationId).order("building_name")
  if (error) return { error: error.message }
  return { data: data as AccommodationBuilding[] }
}

export async function createAccommodationBuilding(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("accommodation_buildings").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    location_id: form.location_id, building_name: form.building_name,
    building_code: form.building_code, total_floors: form.total_floors || 1,
    building_type: form.building_type || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AccommodationBuilding }
}

export async function deleteAccommodationBuilding(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("accommodation_buildings").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ROOMS
// ============================================================

export async function getRooms(festivalId: string, buildingId?: string, status?: string, floorId?: string) {
  const admin = createAdminClient()
  let query = admin.from("rooms").select("*, room_types(name, room_type), accommodation_buildings(building_name), building_floors(floor_number, floor_name)").eq("festival_id", festivalId).order("room_number")
  if (buildingId) query = query.eq("building_id", buildingId)
  if (status) query = query.eq("status", status)
  if (floorId) query = query.eq("floor_id", floorId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getRoom(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("rooms").select("*, room_types(*), accommodation_buildings(*), building_floors(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createRoom(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("rooms").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    building_id: form.building_id, floor_id: form.floor_id || null,
    room_type_id: form.room_type_id || null, room_number: form.room_number,
    room_name: form.room_name || null, capacity: form.capacity || 1,
    total_beds: form.total_beds || 1, floor_area: form.floor_area || null,
    is_accessible: form.is_accessible || false, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as Room }
}

export async function updateRoom(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("rooms").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Room }
}

export async function deleteRoom(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("rooms").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// BEDS
// ============================================================

export async function getBeds(roomId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("beds").select("*").eq("room_id", roomId).order("bed_number")
  if (error) return { error: error.message }
  return { data: data as Bed[] }
}

export async function createBed(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("beds").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    room_id: form.room_id, bed_number: form.bed_number, bed_type: form.bed_type || "single",
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Bed }
}

export async function deleteBed(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("beds").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ROOM TYPES
// ============================================================

export async function getRoomTypes() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("room_types").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as RoomType[] }
}

// ============================================================
// BUILDING FLOORS
// ============================================================

export async function getBuildingFloors(buildingId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("building_floors").select("*").eq("building_id", buildingId).order("floor_number")
  if (error) return { error: error.message }
  return { data: data as BuildingFloor[] }
}

// ============================================================
// ROOM ALLOCATIONS
// ============================================================

export async function getRoomAllocations(festivalId: string, status?: string, buildingId?: string) {
  const admin = createAdminClient()
  let query = admin.from("room_allocations").select("*, rooms(room_number, building_id, accommodation_buildings(building_name))").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  if (buildingId) query = query.eq("rooms.building_id", buildingId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getRoomAllocation(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("room_allocations").select("*, rooms(*), bed_allocations(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createRoomAllocation(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: room } = await admin.from("rooms").select("current_occupancy, capacity").eq("id", form.room_id).single()
  if (room && room.current_occupancy >= room.capacity) return { error: "Room is at full capacity" }
  const { data, error } = await admin.from("room_allocations").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    room_id: form.room_id, occupant_type: form.occupant_type,
    occupant_id: form.occupant_id || null, occupant_name: form.occupant_name,
    occupant_email: form.occupant_email || null, occupant_phone: form.occupant_phone || null,
    allocation_type: form.allocation_type || "manual",
    expected_check_in: form.expected_check_in || null,
    expected_check_out: form.expected_check_out || null,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("rooms").update({ current_occupancy: (room?.current_occupancy || 0) + 1, status: "occupied" }).eq("id", form.room_id)
  await admin.from("occupancy_logs").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    room_id: form.room_id, occupancy_count: (room?.current_occupancy || 0) + 1, logged_by: auth.user.id,
  })
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as RoomAllocation }
}

export async function updateRoomAllocationStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("room_allocations").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as RoomAllocation }
}

export async function deleteRoomAllocation(id: string) {
  const admin = createAdminClient()
  const { data: alloc } = await admin.from("room_allocations").select("room_id, organization_id, festival_id").eq("id", id).single()
  if (!alloc) return { error: "Allocation not found" }
  const { data: room } = await admin.from("rooms").select("current_occupancy").eq("id", alloc.room_id).single()
  await admin.from("rooms").update({ current_occupancy: Math.max(0, (room?.current_occupancy || 1) - 1) }).eq("id", alloc.room_id)
  const { error } = await admin.from("room_allocations").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// BED ALLOCATIONS
// ============================================================

export async function createBedAllocation(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: bed } = await admin.from("beds").select("id").eq("id", form.bed_id).eq("is_available", true).single()
  if (!bed) return { error: "Bed is not available" }
  const { data, error } = await admin.from("bed_allocations").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    bed_id: form.bed_id, allocation_id: form.allocation_id,
    occupant_name: form.occupant_name, occupant_type: form.occupant_type || null,
    occupant_id: form.occupant_id || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("beds").update({ is_available: false, is_reserved: true }).eq("id", form.bed_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as BedAllocation }
}

export async function releaseBed(id: string) {
  const admin = createAdminClient()
  const { data: ba } = await admin.from("bed_allocations").select("bed_id").eq("id", id).single()
  if (!ba) return { error: "Bed allocation not found" }
  await admin.from("bed_allocations").update({ is_active: false, released_at: new Date().toISOString() }).eq("id", id)
  await admin.from("beds").update({ is_available: true, is_reserved: false }).eq("id", ba.bed_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// CHECK-IN / CHECK-OUT
// ============================================================

export async function getCheckins(festivalId: string, allocationId?: string) {
  const admin = createAdminClient()
  let query = admin.from("checkins").select("*, rooms(room_number), room_allocations(occupant_type, occupant_name)").eq("festival_id", festivalId).order("checked_in_at", { ascending: false })
  if (allocationId) query = query.eq("allocation_id", allocationId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function checkIn(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("checkins").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    allocation_id: form.allocation_id, room_id: form.room_id,
    occupant_name: form.occupant_name, occupant_type: form.occupant_type || null,
    occupant_id: form.occupant_id || null,
    check_in_method: form.check_in_method || "manual",
    qr_code: form.qr_code || generateQR(),
    id_proof_type: form.id_proof_type || null, id_proof_number: form.id_proof_number || null,
    photo_url: form.photo_url || null,
    checked_in_by: auth.user.id, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("room_allocations").update({ status: "checked_in", check_in_at: new Date().toISOString() }).eq("id", form.allocation_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as Checkin }
}

export async function checkOut(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("checkouts").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    allocation_id: form.allocation_id, checkin_id: form.checkin_id || null,
    room_id: form.room_id, occupant_name: form.occupant_name,
    occupant_type: form.occupant_type || null, occupant_id: form.occupant_id || null,
    check_out_method: form.check_out_method || "manual",
    checked_out_by: auth.user.id, room_condition: form.room_condition || null,
    keys_returned: form.keys_returned ?? true, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("room_allocations").update({ status: "checked_out", check_out_at: new Date().toISOString() }).eq("id", form.allocation_id)
  const { data: room } = await admin.from("rooms").select("current_occupancy").eq("id", form.room_id).single()
  await admin.from("rooms").update({ current_occupancy: Math.max(0, (room?.current_occupancy || 1) - 1) }).eq("id", form.room_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as Checkout }
}

// ============================================================
// ROOM MAINTENANCE
// ============================================================

export async function getRoomMaintenance(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("room_maintenance").select("*, rooms(room_number, accommodation_buildings(building_name))").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createRoomMaintenance(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("room_maintenance").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    room_id: form.room_id, issue: form.issue, description: form.description || null,
    priority: form.priority || "normal", reported_by: auth.user.id,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/accommodation`)
  return { data: data as RoomMaintenance }
}

// ============================================================
// TRANSPORT HUBS
// ============================================================

export async function getTransportHubs(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("transport_hubs").select("*").eq("festival_id", festivalId).order("hub_name")
  if (error) return { error: error.message }
  return { data: data as TransportHub[] }
}

export async function createTransportHub(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("transport_hubs").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    hub_name: form.hub_name, hub_code: form.hub_code, location: form.location || null,
    latitude: form.latitude || null, longitude: form.longitude || null,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as TransportHub }
}

// ============================================================
// ROUTES
// ============================================================

export async function getRoutes(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("routes").select("*, from_hub:from_hub_id(hub_name), to_hub:to_hub_id(hub_name)").eq("festival_id", festivalId).order("route_name")
  if (error) return { error: error.message }
  return { data }
}

export async function createRoute(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("routes").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    route_name: form.route_name, route_code: form.route_code,
    from_hub_id: form.from_hub_id || null, to_hub_id: form.to_hub_id || null,
    distance_km: form.distance_km || null, estimated_duration_minutes: form.estimated_duration_minutes || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as Route }
}

// ============================================================
// VEHICLES
// ============================================================

export async function getVehicles(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("vehicles").select("*, vehicle_categories(name, category)").eq("festival_id", festivalId).order("vehicle_number")
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getVehicle(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vehicles").select("*, vehicle_categories(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createVehicle(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("vehicles").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, vehicle_number: form.vehicle_number,
    registration_number: form.registration_number, chassis_number: form.chassis_number || null,
    engine_number: form.engine_number || null, make: form.make || null, model: form.model || null,
    year: form.year || null, color: form.color || null, seating_capacity: form.seating_capacity || 1,
    fuel_type: form.fuel_type || "diesel", ownership_type: form.ownership_type || "owned",
    insurance_expiry: form.insurance_expiry || null, fitness_expiry: form.fitness_expiry || null,
    permit_expiry: form.permit_expiry || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as Vehicle }
}

export async function updateVehicle(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vehicles").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Vehicle }
}

export async function deleteVehicle(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("vehicles").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VEHICLE CATEGORIES
// ============================================================

export async function getVehicleCategories() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vehicle_categories").select("*").order("name")
  if (error) return { error: error.message }
  return { data: data as VehicleCategory[] }
}

// ============================================================
// DRIVERS
// ============================================================

export async function getDrivers(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("drivers").select("*").eq("festival_id", festivalId).order("first_name")
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as Driver[] }
}

export async function getDriver(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("drivers").select("*, driver_assignments(*, vehicles(vehicle_number))").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createDriver(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const driverCode = generateNumber("DRV")
  const { data, error } = await admin.from("drivers").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    driver_code: driverCode, first_name: form.first_name, last_name: form.last_name,
    phone: form.phone, alternate_phone: form.alternate_phone || null, email: form.email || null,
    address: form.address || null, city: form.city || null, state: form.state || null,
    license_number: form.license_number, license_expiry: form.license_expiry || null,
    license_type: form.license_type || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone || null,
    blood_group: form.blood_group || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as Driver }
}

export async function updateDriver(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("drivers").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Driver }
}

export async function deleteDriver(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("drivers").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ROUTES
// ============================================================

export async function getTransportRoutes(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("routes").select("*, from_hub:from_hub_id(*), to_hub:to_hub_id(*)").eq("festival_id", festivalId).order("route_name")
  if (error) return { error: error.message }
  return { data }
}

export async function getTransportRoute(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("routes").select("*, from_hub:from_hub_id(*), to_hub:to_hub_id(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// DRIVER ASSIGNMENTS
// ============================================================

export async function assignDriverToVehicle(driverId: string, vehicleId: string, festivalId: string) {
  const auth = await checkOrgAccess(festivalId)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  await admin.from("driver_assignments").update({ is_active: false, unassigned_at: new Date().toISOString() }).eq("driver_id", driverId).eq("is_active", true)
  const { data, error } = await admin.from("driver_assignments").insert({
    organization_id: auth.organization_id, festival_id: festivalId,
    driver_id: driverId, vehicle_id: vehicleId,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as DriverAssignment }
}

// ============================================================
// TRIP SCHEDULES
// ============================================================

export async function getTripSchedules(festivalId: string, status?: string, date?: string) {
  const admin = createAdminClient()
  let query = admin.from("trip_schedules").select("*, routes(route_name), trip_assignments(*, drivers(first_name, last_name, phone), vehicles(vehicle_number, registration_number))").eq("festival_id", festivalId).order("departure_time", { ascending: false })
  if (status) query = query.eq("status", status)
  if (date) query = query.eq("scheduled_date", date)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getTripSchedule(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("trip_schedules").select("*, routes(*), trip_assignments(*, drivers(*), vehicles(*))").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createTripSchedule(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("trip_schedules").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    route_id: form.route_id || null, trip_name: form.trip_name,
    trip_type: form.trip_type || "regular", scheduled_date: form.scheduled_date,
    departure_time: form.departure_time, estimated_arrival_time: form.estimated_arrival_time || null,
    max_passengers: form.max_passengers || 1, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as TripSchedule }
}

export async function updateTripStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "in_progress") updates.actual_departure_time = new Date().toISOString()
  if (status === "completed") updates.actual_arrival_time = new Date().toISOString()
  const { data, error } = await admin.from("trip_schedules").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as TripSchedule }
}

export async function assignTrip(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("trip_assignments").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    trip_id: form.trip_id, vehicle_id: form.vehicle_id, driver_id: form.driver_id,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("vehicles").update({ status: "in_use" }).eq("id", form.vehicle_id)
  await admin.from("drivers").update({ status: "on_trip" }).eq("id", form.driver_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as TripAssignment }
}

export async function completeTrip(tripId: string, vehicleId: string, driverId: string, endKm?: number) {
  const admin = createAdminClient()
  await admin.from("trip_schedules").update({ status: "completed", actual_arrival_time: new Date().toISOString() }).eq("id", tripId)
  await admin.from("vehicles").update({ status: "available", current_km_reading: endKm }).eq("id", vehicleId)
  await admin.from("drivers").update({ status: "available", total_trips: admin.rpc("increment") }).eq("id", driverId)
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// TRANSPORT REQUESTS
// ============================================================

export async function getTransportRequests(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("transport_requests").select("*, vehicles(vehicle_number), drivers(first_name, last_name, phone)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createTransportRequest(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const requestNumber = generateNumber("TR")
  const { data, error } = await admin.from("transport_requests").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    request_number: requestNumber, requester_type: form.requester_type,
    requester_id: form.requester_id || null, requester_name: form.requester_name,
    requester_phone: form.requester_phone || null, requester_email: form.requester_email || null,
    pickup_location: form.pickup_location, drop_location: form.drop_location,
    pickup_time: form.pickup_time, num_passengers: form.num_passengers || 1,
    vehicle_type: form.vehicle_type || null, purpose: form.purpose || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as TransportRequest }
}

export async function updateTransportRequestStatus(id: string, status: string, vehicleId?: string, driverId?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "approved" || status === "assigned") { updates.approved_by = auth?.id; updates.approved_at = new Date().toISOString() }
  if (vehicleId) updates.assigned_vehicle_id = vehicleId
  if (driverId) updates.assigned_driver_id = driverId
  const { data, error } = await admin.from("transport_requests").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as TransportRequest }
}

// ============================================================
// FUEL LOGS
// ============================================================

export async function getFuelLogs(vehicleId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("fuel_logs").select("*, drivers(first_name, last_name)").eq("vehicle_id", vehicleId).order("refilled_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createFuelLog(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("fuel_logs").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    vehicle_id: form.vehicle_id, trip_id: form.trip_id || null,
    driver_id: form.driver_id || null, fuel_type: form.fuel_type || "diesel",
    quantity_liters: form.quantity_liters, cost_per_liter: form.cost_per_liter,
    odometer_reading: form.odometer_reading || null, fuel_station: form.fuel_station || null,
    notes: form.notes || null, refilled_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as FuelLog }
}

// ============================================================
// VEHICLE MAINTENANCE
// ============================================================

export async function getVehicleMaintenance(festivalId: string, vehicleId?: string) {
  const admin = createAdminClient()
  let query = admin.from("vehicle_maintenance").select("*, vehicles(vehicle_number, registration_number)").eq("festival_id", festivalId).order("scheduled_date", { ascending: false })
  if (vehicleId) query = query.eq("vehicle_id", vehicleId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createVehicleMaintenance(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("vehicle_maintenance").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    vehicle_id: form.vehicle_id, maintenance_type: form.maintenance_type || "routine",
    title: form.title, description: form.description || null,
    scheduled_date: form.scheduled_date || null, cost: form.cost || 0,
    vendor_name: form.vendor_name || null, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("vehicles").update({ status: "under_maintenance" }).eq("id", form.vehicle_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/transport`)
  return { data: data as VehicleMaintenance }
}

export async function completeVehicleMaintenance(id: string, cost?: number, completedDate?: string) {
  const admin = createAdminClient()
  const { data: maint } = await admin.from("vehicle_maintenance").select("vehicle_id").eq("id", id).single()
  if (!maint) return { error: "Maintenance record not found" }
  await admin.from("vehicle_maintenance").update({
    status: "completed", completed_date: completedDate || new Date().toISOString().split("T")[0],
    cost: cost || 0,
  }).eq("id", id)
  await admin.from("vehicles").update({ status: "available" }).eq("id", maint.vehicle_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// TRANSPORT BOOKINGS
// ============================================================

export async function createTransportBooking(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const bookingNumber = generateNumber("BK")
  const { data, error } = await admin.from("transport_bookings").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    request_id: form.request_id || null, trip_id: form.trip_id || null,
    booking_number: bookingNumber, passenger_name: form.passenger_name,
    passenger_type: form.passenger_type || null, passenger_id: form.passenger_id || null,
    passenger_phone: form.passenger_phone || null,
    pickup_point: form.pickup_point || null, drop_point: form.drop_point || null,
    qr_code: generateQR(), created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as TransportBooking }
}

// ============================================================
// GPS TRACKING
// ============================================================

export async function logGpsLocation(form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("gps_tracking_logs").insert({
    organization_id: form.organization_id, festival_id: form.festival_id,
    vehicle_id: form.vehicle_id, trip_id: form.trip_id || null,
    latitude: form.latitude, longitude: form.longitude,
    altitude: form.altitude || null, speed: form.speed || null,
    heading: form.heading || null, accuracy: form.accuracy || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as GpsTrackingLog }
}

export async function getVehicleGpsHistory(vehicleId: string, tripId?: string, limit = 100) {
  const admin = createAdminClient()
  let query = admin.from("gps_tracking_logs").select("*").eq("vehicle_id", vehicleId).order("logged_at", { ascending: false }).limit(limit)
  if (tripId) query = query.eq("trip_id", tripId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as GpsTrackingLog[] }
}
