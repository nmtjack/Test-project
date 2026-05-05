"use client";

/* eslint-disable @next/next/no-img-element */

import { Bell, CalendarDays, Clock3, Hotel, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { demoBookings, demoGuests, demoRooms, today, type RoomStatus } from "@/lib/module1-demo";

const kioskStatusStyles: Record<RoomStatus, string> = {
  Available: "bg-white text-black border-white",
  Occupied: "bg-black text-white border-white",
  Dirty: "bg-neutral-300 text-black border-neutral-300",
  Maintenance: "bg-neutral-600 text-white border-neutral-600",
  Blocked: "bg-neutral-800 text-white border-neutral-800",
};

export default function KioskPage() {
  const [selectedRoomId, setSelectedRoomId] = useState(demoRooms[1].id);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(new Date("2026-04-28T14:20:00"));
  const selectedRoom = demoRooms.find((room) => room.id === selectedRoomId) ?? demoRooms[0];
  const activeBooking = demoBookings.find((booking) => booking.roomId === selectedRoom.id && booking.status === "Active");
  const activeGuest = activeBooking ? demoGuests.find((guest) => guest.id === activeBooking.guestId) : undefined;
  const arrivals = demoBookings.filter((booking) => booking.checkIn === today);
  const departures = demoBookings.filter((booking) => booking.checkOut === today);
  const match = useMemo(() => {
    if (!query.trim()) return undefined;
    return demoBookings.find((booking) => {
      const guest = demoGuests.find((item) => item.id === booking.guestId);
      return booking.id.toLowerCase().includes(query.toLowerCase()) || guest?.phone.includes(query);
    });
  }, [query]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow((current) => new Date(current.getTime() + 1000)), 1000);
    const refresh = window.setInterval(() => window.location.reload(), 30_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(refresh);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-white/20 bg-black p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center border border-white bg-white text-black">
            <Hotel size={34} />
          </span>
          <div>
            <p className="maison-eyebrow text-sm font-black text-white/70">Maison Harbor House</p>
            <h1 className="maison-title text-5xl font-semibold tracking-tight">Room Status Board</h1>
          </div>
        </div>
        <div className="flex items-center gap-5 text-right">
          <div>
            <p className="flex items-center justify-end gap-2 text-lg font-bold text-slate-300"><CalendarDays size={22} /> Tuesday, Apr 28, 2026</p>
            <p className="mt-1 flex items-center justify-end gap-2 text-3xl font-black"><Clock3 size={28} /> {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          </div>
          <Link href="/" className="bg-white px-5 py-4 text-lg font-black text-black">Admin</Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-5">
        {demoRooms.map((room) => {
          const booking = demoBookings.find((item) => item.roomId === room.id && item.status === "Active");
          const guest = booking ? demoGuests.find((item) => item.id === booking.guestId) : undefined;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={cn("min-h-48 border p-5 text-left shadow-xl transition hover:scale-[1.01]", kioskStatusStyles[room.status], selectedRoomId === room.id && "ring-4 ring-white")}
            >
              <p className="text-5xl font-black">{room.number}</p>
              <p className="mt-2 text-xl font-bold">{room.type} · Floor {room.floor}</p>
              <p className="mt-5 inline-flex rounded-lg bg-black/15 px-3 py-2 text-lg font-black">{room.status}</p>
              {guest && <p className="mt-4 text-lg font-bold">{guest.fullName} · Out {booking?.checkOut}</p>}
            </button>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="border border-white/20 bg-white/5 p-6">
          <p className="maison-eyebrow text-xs font-bold text-white/70">Selected room</p>
          <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
            <img src={selectedRoom.images[0]?.path} alt={selectedRoom.name} className="maison-image h-56 w-full object-cover" />
            <div>
              <h2 className="text-4xl font-black">Room {selectedRoom.number} · {selectedRoom.name}</h2>
              <p className="mt-3 text-xl text-slate-300">{selectedRoom.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[...selectedRoom.amenities, ...selectedRoom.customAmenities].map((amenity) => (
                  <span key={amenity} className="rounded-lg bg-white/10 px-4 py-2 text-lg font-bold">{amenity}</span>
                ))}
              </div>
              {activeGuest && <p className="mt-5 text-2xl font-black text-white">Current guest: {activeGuest.fullName} · Check-out {activeBooking?.checkOut}</p>}
            </div>
          </div>
        </div>

        <div className="border border-white/20 bg-white/5 p-6">
          <p className="maison-eyebrow mb-4 text-xs font-bold text-white/70">Guest self check-in</p>
          <label className="relative block">
            <Search className="absolute left-4 top-4 text-slate-400" size={24} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Booking ID or phone number" className="h-16 w-full border border-white/20 bg-black pl-12 pr-4 text-xl font-bold outline-none focus:border-white" />
          </label>
          <div className="mt-4 border border-white/10 bg-black p-4">
            {match ? (
              <>
                <p className="text-2xl font-black">{match.id}</p>
                <p className="mt-2 text-lg text-slate-300">{demoGuests.find((guest) => guest.id === match.guestId)?.fullName} · Room {demoRooms.find((room) => room.id === match.roomId)?.number}</p>
                <label className="mt-4 flex items-center gap-3 text-lg"><input type="checkbox" /> Identity confirmed</label>
              </>
            ) : (
              <p className="text-lg text-slate-400">Enter a booking ID or phone to show booking summary.</p>
            )}
          </div>
          <button className="mt-4 flex h-16 w-full items-center justify-center gap-3 bg-white text-xl font-black text-black">
            <Bell size={26} />
            Notify Front Desk
          </button>
        </div>
      </section>

      <footer className="mt-6 overflow-hidden border border-white/20 bg-white/5 p-4 text-xl font-black">
        <div className="animate-pulse whitespace-nowrap">
          Arrivals today: {arrivals.map((booking) => `${demoGuests.find((guest) => guest.id === booking.guestId)?.fullName} (${booking.id})`).join(" · ")} · Departures today: {departures.map((booking) => `${demoGuests.find((guest) => guest.id === booking.guestId)?.fullName} (${booking.id})`).join(" · ") || "None"}
        </div>
      </footer>
    </main>
  );
}
