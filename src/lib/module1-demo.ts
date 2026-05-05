export type RoomStatus = "Available" | "Occupied" | "Dirty" | "Maintenance" | "Blocked";
export type BookingStatus = "Upcoming" | "Active" | "Checked-out" | "Cancelled" | "No-show";
export type DepositStatus = "Unpaid" | "Partial" | "Paid";
export type PaymentMethod = "Cash" | "Card" | "Transfer";
export type BookingSource = "Walk-in" | "Phone" | "Booking.com" | "Agoda" | "Airbnb" | "Direct website";

export type RoomImage = {
  id: string;
  path: string;
  alt: string;
  isCover: boolean;
};

export type BlockedDate = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type HousekeepingLog = {
  id: string;
  roomId: string;
  fromStatus?: RoomStatus;
  toStatus: RoomStatus;
  note: string;
  createdAt: string;
};

export type Room = {
  id: string;
  number: string;
  name: string;
  type: "Standard" | "Deluxe" | "Suite" | "Villa" | "Dormitory";
  floor: number;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  weekendPrice?: number;
  bedType: "Single" | "Twin" | "Double" | "King" | "Queen";
  sizeSqm: number;
  description: string;
  status: RoomStatus;
  isActive: boolean;
  amenities: string[];
  customAmenities: string[];
  images: RoomImage[];
  blockedDates: BlockedDate[];
  wifiPassword: string;
  housekeepingNote: string;
};

export type Guest = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  nationality: string;
  idType: "Passport" | "National ID" | "Driver License";
  idNumber: string;
  dateOfBirth: string;
  notes: string;
  specialRequests: string;
};

export type Booking = {
  id: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  source: BookingSource;
  otaReference?: string;
  status: BookingStatus;
  roomRate: number;
  depositAmount: number;
  depositMethod?: PaymentMethod;
  depositStatus: DepositStatus;
  staffNotes: string;
};

export type PosOrder = {
  id: string;
  bookingId: string;
  status: "Open" | "Sent to Kitchen" | "Served" | "Closed";
  total: number;
};

export const amenityOptions = [
  "WiFi",
  "AC",
  "TV",
  "Mini Bar",
  "Bathtub",
  "Balcony",
  "Sea View",
  "City View",
  "Safe",
  "Hairdryer",
  "Kettle",
  "Workspace",
  "Parking",
];

export const today = "2026-04-28";

export const demoRooms: Room[] = [
  {
    id: "room-1",
    number: "101",
    name: "Garden King",
    type: "Standard",
    floor: 1,
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 120,
    weekendPrice: 145,
    bedType: "King",
    sizeSqm: 28,
    description: "Quiet garden-facing room with a work desk and walk-in shower.",
    status: "Available",
    isActive: true,
    amenities: ["WiFi", "AC", "TV", "Workspace", "Kettle"],
    customAmenities: ["Late checkout eligible"],
    images: [
      { id: "img-101-a", path: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80", alt: "Garden King bed", isCover: true },
      { id: "img-101-b", path: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80", alt: "Garden King bathroom", isCover: false },
    ],
    blockedDates: [],
    wifiPassword: "Garden101",
    housekeepingNote: "",
  },
  {
    id: "room-2",
    number: "204",
    name: "Ocean View Suite",
    type: "Suite",
    floor: 2,
    maxAdults: 3,
    maxChildren: 2,
    basePrice: 260,
    weekendPrice: 310,
    bedType: "King",
    sizeSqm: 52,
    description: "Large suite with separate lounge, balcony, bathtub, and sea view.",
    status: "Occupied",
    isActive: true,
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Bathtub", "Balcony", "Sea View", "Safe"],
    customAmenities: ["Anniversary setup"],
    images: [
      { id: "img-204-a", path: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80", alt: "Ocean View Suite", isCover: true },
      { id: "img-204-b", path: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80", alt: "Suite lounge", isCover: false },
    ],
    blockedDates: [{ id: "block-204-1", startDate: "2026-05-10", endDate: "2026-05-13", reason: "Owner use" }],
    wifiPassword: "Ocean204",
    housekeepingNote: "Extra towels requested.",
  },
  {
    id: "room-3",
    number: "305",
    name: "City Deluxe Twin",
    type: "Deluxe",
    floor: 3,
    maxAdults: 2,
    maxChildren: 0,
    basePrice: 175,
    bedType: "Twin",
    sizeSqm: 34,
    description: "Upper-floor twin room with city view and luggage bench.",
    status: "Dirty",
    isActive: true,
    amenities: ["WiFi", "AC", "TV", "City View", "Safe", "Hairdryer"],
    customAmenities: [],
    images: [{ id: "img-305-a", path: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80", alt: "City Deluxe Twin", isCover: true }],
    blockedDates: [],
    wifiPassword: "City305",
    housekeepingNote: "Needs minibar restock.",
  },
  {
    id: "room-4",
    number: "401",
    name: "Rooftop Villa",
    type: "Villa",
    floor: 4,
    maxAdults: 4,
    maxChildren: 2,
    basePrice: 420,
    weekendPrice: 520,
    bedType: "King",
    sizeSqm: 86,
    description: "Private villa with terrace, parking, kitchenette, and premium view.",
    status: "Maintenance",
    isActive: false,
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Balcony", "Sea View", "Parking"],
    customAmenities: ["Private terrace"],
    images: [{ id: "img-401-a", path: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80", alt: "Rooftop Villa", isCover: true }],
    blockedDates: [{ id: "block-401-1", startDate: "2026-04-27", endDate: "2026-05-08", reason: "Renovation" }],
    wifiPassword: "Villa401",
    housekeepingNote: "AC compressor replacement.",
  },
  {
    id: "room-5",
    number: "112",
    name: "Dormitory Pod Room",
    type: "Dormitory",
    floor: 1,
    maxAdults: 6,
    maxChildren: 0,
    basePrice: 38,
    bedType: "Single",
    sizeSqm: 40,
    description: "Six-bed dormitory with lockers and shared bathroom access.",
    status: "Blocked",
    isActive: true,
    amenities: ["WiFi", "AC", "Safe"],
    customAmenities: ["Locker"],
    images: [{ id: "img-112-a", path: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80", alt: "Dormitory room", isCover: true }],
    blockedDates: [{ id: "block-112-1", startDate: "2026-04-28", endDate: "2026-04-30", reason: "Deep cleaning" }],
    wifiPassword: "Dorm112",
    housekeepingNote: "Deep clean in progress.",
  },
];

export const demoGuests: Guest[] = [
  {
    id: "guest-1",
    fullName: "Maya Chen",
    phone: "+1 555 0127",
    email: "maya.chen@example.com",
    nationality: "Singapore",
    idType: "Passport",
    idNumber: "E1234567",
    dateOfBirth: "1989-07-14",
    notes: "Prefers quiet rooms away from elevator.",
    specialRequests: "Non-smoking, extra pillows.",
  },
  {
    id: "guest-2",
    fullName: "Daniel Ortiz",
    phone: "+1 555 0192",
    email: "daniel.ortiz@example.com",
    nationality: "Mexico",
    idType: "Driver License",
    idNumber: "D-778812",
    dateOfBirth: "1991-02-02",
    notes: "Returning direct guest.",
    specialRequests: "Late arrival.",
  },
  {
    id: "guest-3",
    fullName: "Ava Patel",
    phone: "+44 7700 900123",
    email: "ava.patel@example.co.uk",
    nationality: "United Kingdom",
    idType: "Passport",
    idNumber: "P9988123",
    dateOfBirth: "1984-11-20",
    notes: "Company account.",
    specialRequests: "Invoice to company.",
  },
];

export const demoBookings: Booking[] = [
  {
    id: "BK-260428-0001",
    roomId: "room-2",
    guestId: "guest-1",
    checkIn: "2026-04-28",
    checkOut: "2026-05-01",
    adults: 2,
    children: 1,
    source: "Booking.com",
    otaReference: "BDC-889120",
    status: "Active",
    roomRate: 260,
    depositAmount: 300,
    depositMethod: "Card",
    depositStatus: "Partial",
    staffNotes: "Verify passport at desk.",
  },
  {
    id: "BK-260428-0002",
    roomId: "room-1",
    guestId: "guest-2",
    checkIn: "2026-04-28",
    checkOut: "2026-04-30",
    adults: 1,
    children: 0,
    source: "Phone",
    status: "Upcoming",
    roomRate: 120,
    depositAmount: 120,
    depositMethod: "Transfer",
    depositStatus: "Paid",
    staffNotes: "Arrives after 18:00.",
  },
  {
    id: "BK-260501-0003",
    roomId: "room-3",
    guestId: "guest-3",
    checkIn: "2026-05-01",
    checkOut: "2026-05-03",
    adults: 2,
    children: 0,
    source: "Direct website",
    status: "Upcoming",
    roomRate: 175,
    depositAmount: 0,
    depositStatus: "Unpaid",
    staffNotes: "Company invoice.",
  },
];

export const demoPosOrders: PosOrder[] = [
  { id: "ORD-9001", bookingId: "BK-260428-0001", status: "Open", total: 68 },
  { id: "ORD-9004", bookingId: "BK-260428-0001", status: "Served", total: 42 },
];

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function nights(checkIn: string, checkOut: string) {
  return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));
}

export function dateRange(start: string, days: number) {
  const first = new Date(`${start}T00:00:00`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

export function bookingTotal(booking: Booking) {
  return nights(booking.checkIn, booking.checkOut) * booking.roomRate;
}
