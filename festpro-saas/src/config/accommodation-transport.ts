export const ROOM_TYPES = [
  { value: "dormitory", label: "Dormitory", color: "bg-blue-100 text-blue-700", icon: "Layers" },
  { value: "standard", label: "Standard Room", color: "bg-green-100 text-green-700", icon: "Bed" },
  { value: "vip", label: "VIP Room", color: "bg-amber-100 text-amber-700", icon: "Crown" },
  { value: "judge", label: "Judge Room", color: "bg-purple-100 text-purple-700", icon: "Scale" },
  { value: "volunteer", label: "Volunteer Room", color: "bg-teal-100 text-teal-700", icon: "Users" },
  { value: "staff", label: "Staff Room", color: "bg-cyan-100 text-cyan-700", icon: "Briefcase" },
  { value: "medical", label: "Medical Room", color: "bg-red-100 text-red-700", icon: "Heart" },
  { value: "guest", label: "Guest Room", color: "bg-indigo-100 text-indigo-700", icon: "UserPlus" },
] as const

export const ALLOCATION_STATUSES = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "checked_in", label: "Checked In", color: "bg-green-100 text-green-700" },
  { value: "checked_out", label: "Checked Out", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "no_show", label: "No Show", color: "bg-amber-100 text-amber-700" },
] as const

export const BOOKING_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
] as const

export const VEHICLE_CATEGORIES = [
  { value: "bus", label: "Bus", color: "bg-blue-100 text-blue-700" },
  { value: "van", label: "Van", color: "bg-teal-100 text-teal-700" },
  { value: "car", label: "Car", color: "bg-green-100 text-green-700" },
  { value: "mini_bus", label: "Mini Bus", color: "bg-indigo-100 text-indigo-700" },
  { value: "ambulance", label: "Ambulance", color: "bg-red-100 text-red-700" },
  { value: "utility", label: "Utility Vehicle", color: "bg-amber-100 text-amber-700" },
] as const

export const VEHICLE_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "in_use", label: "In Use", color: "bg-blue-100 text-blue-700" },
  { value: "under_maintenance", label: "Under Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "out_of_service", label: "Out of Service", color: "bg-red-100 text-red-700" },
  { value: "retired", label: "Retired", color: "bg-gray-100 text-gray-600" },
] as const

export const DRIVER_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "on_trip", label: "On Trip", color: "bg-blue-100 text-blue-700" },
  { value: "off_duty", label: "Off Duty", color: "bg-gray-100 text-gray-600" },
  { value: "sick", label: "Sick", color: "bg-red-100 text-red-700" },
  { value: "vacation", label: "Vacation", color: "bg-amber-100 text-amber-700" },
] as const

export const TRIP_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "delayed", label: "Delayed", color: "bg-amber-100 text-amber-700" },
] as const

export const MAINTENANCE_TYPES = [
  { value: "routine", label: "Routine", color: "bg-blue-100 text-blue-700" },
  { value: "repair", label: "Repair", color: "bg-amber-100 text-amber-700" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-700" },
  { value: "inspection", label: "Inspection", color: "bg-teal-100 text-teal-700" },
  { value: "insurance", label: "Insurance", color: "bg-purple-100 text-purple-700" },
] as const

export const TRANSPORT_REQUEST_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "assigned", label: "Assigned", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const TRANSPORT_REQUEST_PURPOSES = [
  { value: "artist_transfer", label: "Artist Transfer" },
  { value: "staff_transfer", label: "Staff Transfer" },
  { value: "equipment_transport", label: "Equipment Transport" },
  { value: "vip_transport", label: "VIP Transport" },
  { value: "medical_transport", label: "Medical Transport" },
  { value: "shuttle_service", label: "Shuttle Service" },
  { value: "venue_hopping", label: "Venue Hopping" },
  { value: "other", label: "Other" },
] as const

export const ROOM_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "occupied", label: "Occupied", color: "bg-blue-100 text-blue-700" },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "reserved", label: "Reserved", color: "bg-purple-100 text-purple-700" },
  { value: "cleaning", label: "Cleaning", color: "bg-cyan-100 text-cyan-700" },
] as const

export const OCCUPANT_TYPES = [
  { value: "participant", label: "Participant" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "guest", label: "Guest" },
  { value: "vip", label: "VIP" },
  { value: "media", label: "Media" },
  { value: "staff", label: "Staff" },
] as const

export const CHECK_IN_METHODS = [
  { value: "manual", label: "Manual" },
  { value: "qr", label: "QR Code" },
  { value: "id_card", label: "ID Card" },
  { value: "rfid", label: "RFID" },
] as const

export const ROOM_MAINTENANCE_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
] as const

export const ROOM_MAINTENANCE_STATUSES = [
  { value: "reported", label: "Reported", color: "bg-amber-100 text-amber-700" },
  { value: "assigned", label: "Assigned", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-100 text-purple-700" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const FUEL_TYPES = [
  { value: "diesel", label: "Diesel" },
  { value: "petrol", label: "Petrol" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
] as const

export const VEHICLE_MAINTENANCE_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const
