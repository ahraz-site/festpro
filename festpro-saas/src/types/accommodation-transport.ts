export type RoomTypeEnum = "dormitory" | "standard" | "vip" | "judge" | "volunteer" | "staff" | "medical" | "guest"
export type AllocationStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"
export type VehicleCategoryEnum = "bus" | "van" | "car" | "mini_bus" | "ambulance" | "utility"
export type VehicleStatus = "available" | "in_use" | "under_maintenance" | "out_of_service" | "retired"
export type DriverStatus = "available" | "on_trip" | "off_duty" | "sick" | "vacation"
export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed"
export type MaintenanceType = "routine" | "repair" | "emergency" | "inspection" | "insurance"
export type TransportRequestStatus = "pending" | "approved" | "rejected" | "assigned" | "completed" | "cancelled"

export interface AccommodationLocation {
  id: string; organization_id: string; festival_id: string
  name: string; location_code: string; address: string | null; city: string | null; state: string | null; pincode: string | null
  contact_person: string | null; contact_phone: string | null
  total_buildings: number; total_rooms: number; total_beds: number; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface AccommodationBuilding {
  id: string; organization_id: string; festival_id: string; location_id: string
  building_name: string; building_code: string; total_floors: number; total_rooms: number; total_beds: number
  building_type: string | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface BuildingFloor {
  id: string; organization_id: string; festival_id: string; building_id: string
  floor_number: number; floor_name: string | null; total_rooms: number; total_beds: number
  is_active: boolean; notes: string | null; created_at: string
}

export interface RoomType {
  id: string; organization_id: string; name: string; room_type: RoomTypeEnum
  description: string | null; max_occupancy: number; default_bed_count: number
  has_attached_bathroom: boolean; amenities: any; icon: string | null; sort_order: number; is_active: boolean
  created_at: string
}

export interface Room {
  id: string; organization_id: string; festival_id: string; building_id: string; floor_id: string | null; room_type_id: string | null
  room_number: string; room_name: string | null; capacity: number; current_occupancy: number
  total_beds: number; available_beds: number; floor_area: number | null
  is_accessible: boolean; is_active: boolean; status: string; notes: string | null; qr_code: string | null
  created_at: string; updated_at: string
}

export interface Bed {
  id: string; organization_id: string; festival_id: string; room_id: string
  bed_number: string; bed_type: string | null; is_available: boolean; is_reserved: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface RoomFacility {
  id: string; organization_id: string; room_id: string
  facility_name: string; facility_type: string | null; quantity: number; is_working: boolean; notes: string | null
  created_at: string
}

export interface RoomMaintenance {
  id: string; organization_id: string; festival_id: string; room_id: string
  issue: string; description: string | null; priority: string; status: string
  reported_by: string | null; assigned_to: string | null; resolved_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface RoomAllocation {
  id: string; organization_id: string; festival_id: string; room_id: string
  occupant_type: string; occupant_id: string | null; occupant_name: string; occupant_email: string | null; occupant_phone: string | null
  allocation_type: string; status: AllocationStatus
  check_in_at: string | null; check_out_at: string | null; expected_check_in: string | null; expected_check_out: string | null
  notes: string | null; created_by: string | null
  created_at: string; updated_at: string
}

export interface BedAllocation {
  id: string; organization_id: string; festival_id: string; bed_id: string; allocation_id: string
  occupant_name: string; occupant_type: string | null; occupant_id: string | null
  is_active: boolean; allocated_at: string; released_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface RoomChangeRequest {
  id: string; organization_id: string; festival_id: string; allocation_id: string; from_room_id: string; to_room_id: string | null
  reason: string; status: string; requested_by: string | null; approved_by: string | null; approved_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface Checkin {
  id: string; organization_id: string; festival_id: string; allocation_id: string; room_id: string
  occupant_name: string; occupant_type: string | null; occupant_id: string | null
  check_in_method: string; qr_code: string | null
  id_proof_type: string | null; id_proof_number: string | null; id_proof_photo: string | null; photo_url: string | null
  checked_in_by: string | null; checked_in_at: string; notes: string | null; created_at: string
}

export interface Checkout {
  id: string; organization_id: string; festival_id: string; allocation_id: string; checkin_id: string | null; room_id: string
  occupant_name: string; occupant_type: string | null; occupant_id: string | null
  check_out_method: string; checked_out_by: string | null; checked_out_at: string
  room_condition: string | null; keys_returned: boolean; notes: string | null; created_at: string
}

export interface OccupancyLog {
  id: string; organization_id: string; festival_id: string; room_id: string
  occupancy_count: number; logged_at: string; logged_by: string | null
}

export interface TransportHub {
  id: string; organization_id: string; festival_id: string
  hub_name: string; hub_code: string; location: string | null; latitude: number | null; longitude: number | null
  contact_person: string | null; contact_phone: string | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface Route {
  id: string; organization_id: string; festival_id: string
  route_name: string; route_code: string; from_hub_id: string | null; to_hub_id: string | null
  distance_km: number | null; estimated_duration_minutes: number | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface RouteStop {
  id: string; organization_id: string; route_id: string
  stop_name: string; stop_order: number; latitude: number | null; longitude: number | null
  estimated_arrival_time: string | null; notes: string | null; created_at: string
}

export interface VehicleCategory {
  id: string; organization_id: string; name: string; category: VehicleCategoryEnum
  description: string | null; seating_capacity: number; baggage_capacity: string | null; icon: string | null; is_active: boolean
  created_at: string
}

export interface Vehicle {
  id: string; organization_id: string; festival_id: string; category_id: string | null
  vehicle_number: string; registration_number: string; chassis_number: string | null; engine_number: string | null
  make: string | null; model: string | null; year: number | null; color: string | null
  seating_capacity: number; fuel_type: string; ownership_type: string
  insurance_expiry: string | null; fitness_expiry: string | null; permit_expiry: string | null; pollution_expiry: string | null
  status: VehicleStatus; current_km_reading: number; last_service_km: number; last_service_date: string | null
  qr_code: string | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface VehicleDocument {
  id: string; organization_id: string; vehicle_id: string
  document_type: string; document_name: string; file_url: string; document_number: string | null
  expiry_date: string | null; is_verified: boolean; notes: string | null; uploaded_by: string | null; created_at: string
}

export interface Driver {
  id: string; organization_id: string; festival_id: string
  driver_code: string; first_name: string; last_name: string; phone: string; alternate_phone: string | null; email: string | null
  address: string | null; city: string | null; state: string | null
  license_number: string; license_expiry: string | null; license_type: string | null
  emergency_contact_name: string | null; emergency_contact_phone: string | null; blood_group: string | null; photo_url: string | null
  status: DriverStatus; total_trips: number; rating: number; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface DriverDocument {
  id: string; organization_id: string; driver_id: string
  document_type: string; document_name: string; file_url: string; document_number: string | null
  expiry_date: string | null; is_verified: boolean; notes: string | null; uploaded_by: string | null; created_at: string
}

export interface DriverAssignment {
  id: string; organization_id: string; festival_id: string; driver_id: string; vehicle_id: string
  assigned_at: string; unassigned_at: string | null; is_active: boolean; notes: string | null; created_at: string
}

export interface TripSchedule {
  id: string; organization_id: string; festival_id: string; route_id: string | null
  trip_name: string; trip_type: string; scheduled_date: string; departure_time: string; estimated_arrival_time: string | null
  actual_departure_time: string | null; actual_arrival_time: string | null
  status: TripStatus; max_passengers: number; current_passengers: number; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface TripAssignment {
  id: string; organization_id: string; festival_id: string; trip_id: string; vehicle_id: string; driver_id: string
  assigned_at: string; notes: string | null; created_at: string
}

export interface TripLog {
  id: string; organization_id: string; festival_id: string; trip_id: string
  log_type: string; description: string | null; odometer_reading: number | null
  location: string | null; latitude: number | null; longitude: number | null
  logged_by: string | null; logged_at: string
}

export interface FuelLog {
  id: string; organization_id: string; festival_id: string; vehicle_id: string; trip_id: string | null; driver_id: string | null
  fuel_type: string; quantity_liters: number; cost_per_liter: number; total_cost: number
  odometer_reading: number | null; fuel_station: string | null; receipt_url: string | null
  refilled_by: string | null; refilled_at: string; notes: string | null; created_at: string
}

export interface VehicleMaintenance {
  id: string; organization_id: string; festival_id: string; vehicle_id: string
  maintenance_type: MaintenanceType; title: string; description: string | null
  scheduled_date: string | null; completed_date: string | null; odometer_at_service: number | null
  cost: number; vendor_name: string | null; invoice_number: string | null; invoice_url: string | null
  next_service_date: string | null; next_service_km: number | null; status: string; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface TransportRequest {
  id: string; organization_id: string; festival_id: string
  request_number: string; requester_type: string; requester_id: string | null
  requester_name: string; requester_phone: string | null; requester_email: string | null
  pickup_location: string; drop_location: string; pickup_time: string
  num_passengers: number; vehicle_type: string | null; purpose: string | null
  status: TransportRequestStatus
  assigned_vehicle_id: string | null; assigned_driver_id: string | null
  approved_by: string | null; approved_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface TransportBooking {
  id: string; organization_id: string; festival_id: string; request_id: string | null; trip_id: string | null
  booking_number: string; passenger_name: string; passenger_type: string | null; passenger_id: string | null; passenger_phone: string | null
  pickup_point: string | null; drop_point: string | null; booking_status: BookingStatus; qr_code: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface PickupPoint {
  id: string; organization_id: string; festival_id: string
  name: string; location: string | null; latitude: number | null; longitude: number | null
  contact_person: string | null; contact_phone: string | null; is_active: boolean; notes: string | null; created_at: string
}

export interface DropPoint {
  id: string; organization_id: string; festival_id: string
  name: string; location: string | null; latitude: number | null; longitude: number | null
  contact_person: string | null; contact_phone: string | null; is_active: boolean; notes: string | null; created_at: string
}

export interface GpsTrackingLog {
  id: string; organization_id: string; festival_id: string; vehicle_id: string; trip_id: string | null
  latitude: number; longitude: number; altitude: number | null; speed: number | null; heading: number | null; accuracy: number | null
  logged_at: string
}

export interface Module18DashboardData {
  total_locations: number; total_buildings: number; total_rooms: number; total_beds: number
  available_rooms: number; occupied_rooms: number; occupancy_rate: number
  total_allocations: number; checked_in: number; checked_out: number
  total_vehicles: number; available_vehicles: number; in_use_vehicles: number
  total_drivers: number; available_drivers: number; on_trip_drivers: number
  total_trips: number; active_trips: number; completed_trips: number
  pending_transport_requests: number; total_fuel_cost: number; pending_maintenance: number
}
