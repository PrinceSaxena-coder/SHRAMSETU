import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Check,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Lock,
  MapPin,
  Sparkles,
  Zap,
  CheckCircle2,
  BriefcaseBusiness,
} from "lucide-react";

const SLOT_BOOKINGS_KEY = "ss_worker_gig_slots";

/* =========================================================
   SLOT CONFIGURATION
   24 HOURS = 12 SLOTS
   EACH SLOT = 2 HOURS
========================================================= */

const TIME_SLOTS = [
  {
    id: "00-02",
    start: "12:00 AM",
    end: "2:00 AM",
    earning: 300,
  },
  {
    id: "02-04",
    start: "2:00 AM",
    end: "4:00 AM",
    earning: 300,
  },
  {
    id: "04-06",
    start: "4:00 AM",
    end: "6:00 AM",
    earning: 350,
  },
  {
    id: "06-08",
    start: "6:00 AM",
    end: "8:00 AM",
    earning: 400,
  },
  {
    id: "08-10",
    start: "8:00 AM",
    end: "10:00 AM",
    earning: 500,
  },
  {
    id: "10-12",
    start: "10:00 AM",
    end: "12:00 PM",
    earning: 550,
  },
  {
    id: "12-14",
    start: "12:00 PM",
    end: "2:00 PM",
    earning: 500,
  },
  {
    id: "14-16",
    start: "2:00 PM",
    end: "4:00 PM",
    earning: 450,
  },
  {
    id: "16-18",
    start: "4:00 PM",
    end: "6:00 PM",
    earning: 600,
  },
  {
    id: "18-20",
    start: "6:00 PM",
    end: "8:00 PM",
    earning: 700,
  },
  {
    id: "20-22",
    start: "8:00 PM",
    end: "10:00 PM",
    earning: 650,
  },
  {
    id: "22-24",
    start: "10:00 PM",
    end: "12:00 AM",
    earning: 500,
  },
];

/* =========================================================
   GENERATE NEXT 7 DAYS
========================================================= */

function generateDays() {
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    days.push({
      id: date.toISOString().split("T")[0],
      date,
      day: date.toLocaleDateString("en-IN", {
        weekday: "short",
      }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("en-IN", {
        month: "short",
      }),
    });
  }

  return days;
}

/* =========================================================
   DEMO BOOKED SLOTS
   These can later come from backend/API
========================================================= */

const DEMO_BOOKED_SLOTS = {
  // Example:
  // "2026-09-08": ["08-10", "18-20"],
};

/* =========================================================
   LOCAL STORAGE
========================================================= */

function getStoredBookings() {
  try {
    const stored = localStorage.getItem(SLOT_BOOKINGS_KEY);

    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Gigs() {
  const days = useMemo(() => generateDays(), []);

  const [selectedDay, setSelectedDay] = useState(days[0]);

  const [bookings, setBookings] = useState(
    getStoredBookings
  );

  const [selectedSlots, setSelectedSlots] = useState([]);

  const [bookingConfirmed, setBookingConfirmed] =
    useState(false);

  /* =========================================================
     GET BOOKED SLOTS FOR SELECTED DAY
  ========================================================= */

  const bookedSlots = [
    ...(DEMO_BOOKED_SLOTS[selectedDay.id] || []),
    ...(bookings[selectedDay.id] || []),
  ];

  /* =========================================================
     CHECK WHETHER SLOT IS BOOKED
  ========================================================= */

  const isBooked = (slotId) => {
    return bookedSlots.includes(slotId);
  };

  /* =========================================================
     SELECT / UNSELECT SLOT
  ========================================================= */

  const toggleSlot = (slot) => {
    if (isBooked(slot.id)) {
      return;
    }

    setBookingConfirmed(false);

    setSelectedSlots((previous) => {
      const alreadySelected = previous.some(
        (item) => item.id === slot.id
      );

      if (alreadySelected) {
        return previous.filter(
          (item) => item.id !== slot.id
        );
      }

      return [...previous, slot];
    });
  };

  /* =========================================================
     CONFIRM BOOKING
  ========================================================= */

  const confirmBooking = () => {
    if (selectedSlots.length === 0) {
      return;
    }

    const selectedIds = selectedSlots.map(
      (slot) => slot.id
    );

    const updatedBookings = {
      ...bookings,
      [selectedDay.id]: [
        ...(bookings[selectedDay.id] || []),
        ...selectedIds,
      ],
    };

    localStorage.setItem(
      SLOT_BOOKINGS_KEY,
      JSON.stringify(updatedBookings)
    );

    setBookings(updatedBookings);
    setSelectedSlots([]);
    setBookingConfirmed(true);
  };

  /* =========================================================
     TOTAL EARNINGS
  ========================================================= */

  const selectedEarnings = selectedSlots.reduce(
    (total, slot) => total + slot.earning,
    0
  );

  /* =========================================================
     TOTAL HOURS
  ========================================================= */

  const selectedHours = selectedSlots.length * 2;

  /* =========================================================
     DAY EARNING
  ========================================================= */

  const bookedEarnings = bookedSlots.reduce(
    (total, slotId) => {
      const slot = TIME_SLOTS.find(
        (item) => item.id === slotId
      );

      return total + (slot?.earning || 0);
    },
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <BriefcaseBusiness
                  size={18}
                  className="text-blue-600"
                />

                <p className="text-sm font-medium text-slate-500">
                  Worker Gigs
                </p>

              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">
                Book your working slots
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Choose when you want to receive gig requests.
              </p>

            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">

              <Zap
                size={16}
                className="text-emerald-600"
              />

              <span className="text-xs font-semibold text-emerald-700">
                24/7 Slots Available
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">

              <CalendarDays
                size={19}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Choose your working hours
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Each slot is 2 hours. Select one or multiple
                slots based on your availability.
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            DATE SELECTOR
        =================================================== */}

        <section className="mb-6">

          <div className="flex items-center justify-between mb-3">

            <div>

              <h2 className="font-bold text-slate-900">
                Select a day
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Slots are available throughout the day.
              </p>

            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
              <ChevronLeft size={15} />
              Swipe / scroll
              <ChevronRight size={15} />
            </div>

          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

            {days.map((day) => {

              const active =
                selectedDay.id === day.id;

              const dayBookings =
                [
                  ...(DEMO_BOOKED_SLOTS[day.id] || []),
                  ...(bookings[day.id] || []),
                ];

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedSlots([]);
                    setBookingConfirmed(false);
                  }}
                  className={`min-w-[88px] rounded-2xl border p-3 transition ${
                    active
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >

                  <p
                    className={`text-xs font-semibold ${
                      active
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {day.day}
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {day.dayNumber}
                  </p>

                  <p
                    className={`text-[11px] mt-1 ${
                      active
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {day.month}
                  </p>

                  {dayBookings.length > 0 && (
                    <span
                      className={`block text-[9px] mt-2 ${
                        active
                          ? "text-emerald-300"
                          : "text-emerald-600"
                      }`}
                    >
                      {dayBookings.length} booked
                    </span>
                  )}

                </button>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            SELECTED DAY SUMMARY
        =================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <CalendarDays
                  size={17}
                  className="text-blue-600"
                />

                <h2 className="font-bold">
                  {selectedDay.day},{" "}
                  {selectedDay.dayNumber}{" "}
                  {selectedDay.month}
                </h2>

              </div>

              <p className="text-xs text-slate-500 mt-1">
                12 working slots · 24 hours
              </p>

            </div>

            <div className="flex gap-4">

              <div>

                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                  Booked
                </p>

                <p className="font-bold text-slate-900">
                  {bookedSlots.length} slots
                </p>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                  Earnings
                </p>

                <p className="font-bold text-emerald-600">
                  ₹{bookedEarnings}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SLOT GRID
        =================================================== */}

        <section className="mb-6">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-lg font-bold">
                Available slots
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Every slot is 2 hours
              </p>

            </div>

            <div className="flex items-center gap-3 text-[10px] sm:text-xs">

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available
              </div>

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Selected
              </div>

              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                Booked
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {TIME_SLOTS.map((slot) => {

              const booked = isBooked(slot.id);

              const selected =
                selectedSlots.some(
                  (item) => item.id === slot.id
                );

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={booked}
                  onClick={() => toggleSlot(slot)}
                  className={`text-left rounded-2xl border p-4 transition ${
                    booked
                      ? "bg-slate-100 border-slate-200 cursor-not-allowed"
                      : selected
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                      : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-start gap-3">

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          booked
                            ? "bg-slate-200"
                            : selected
                            ? "bg-white/15"
                            : "bg-emerald-50"
                        }`}
                      >

                        {booked ? (
                          <Lock
                            size={17}
                            className="text-slate-400"
                          />
                        ) : (
                          <Clock3
                            size={18}
                            className={
                              selected
                                ? "text-white"
                                : "text-emerald-600"
                            }
                          />
                        )}

                      </div>

                      <div>

                        <p
                          className={`font-bold text-sm ${
                            booked
                              ? "text-slate-400"
                              : ""
                          }`}
                        >
                          {slot.start}
                        </p>

                        <p
                          className={`text-xs mt-1 ${
                            selected
                              ? "text-blue-100"
                              : booked
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          to {slot.end}
                        </p>

                      </div>

                    </div>

                    {selected && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">

                        <Check
                          size={14}
                          className="text-blue-600"
                        />

                      </div>
                    )}

                    {booked && (
                      <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-500 text-[9px] font-bold">
                        BOOKED
                      </span>
                    )}

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <span
                      className={`text-xs ${
                        selected
                          ? "text-blue-100"
                          : booked
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      2 hours
                    </span>

                    <span
                      className={`flex items-center gap-1 font-bold text-sm ${
                        selected
                          ? "text-white"
                          : booked
                          ? "text-slate-400"
                          : "text-emerald-600"
                      }`}
                    >
                      <IndianRupee size={14} />
                      {slot.earning}
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            INCENTIVE / OFFER
        =================================================== */}

        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 text-white mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">

                <Sparkles size={21} />

              </div>

              <div>

                <p className="text-xs text-blue-100 font-semibold uppercase tracking-wide">
                  Today's Worker Offer
                </p>

                <h2 className="text-lg font-bold mt-1">
                  Earn extra ₹100
                </h2>

                <p className="text-sm text-blue-100 mt-1">
                  Complete 4 booked slots today to unlock
                  your bonus.
                </p>

              </div>

            </div>

            <div className="sm:text-right">

              <p className="text-xs text-blue-100">
                Bonus
              </p>

              <p className="text-2xl font-bold">
                +₹100
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            BOOKING SUMMARY
        =================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 sticky bottom-3 shadow-xl">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div>

              <p className="text-xs text-slate-500 font-medium">
                Selected for{" "}
                {selectedDay.day},{" "}
                {selectedDay.dayNumber}{" "}
                {selectedDay.month}
              </p>

              <div className="flex items-end gap-3 mt-1">

                <h2 className="text-2xl font-bold">
                  {selectedSlots.length} slots
                </h2>

                <p className="text-sm text-slate-500 mb-1">
                  · {selectedHours} hours
                </p>

              </div>

              <p className="text-sm text-emerald-600 font-semibold mt-1">
                Estimated earning: ₹{selectedEarnings}
              </p>

            </div>

            <button
              type="button"
              disabled={selectedSlots.length === 0}
              onClick={confirmBooking}
              className={`w-full lg:w-auto px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                selectedSlots.length > 0
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >

              <CheckCircle2 size={18} />

              Confirm Slots

            </button>

          </div>

          {bookingConfirmed && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">

              <CheckCircle2
                size={17}
                className="text-emerald-600"
              />

              <p className="text-sm font-semibold text-emerald-700">
                Your working slots have been booked successfully.
              </p>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}