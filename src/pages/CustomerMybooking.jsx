import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Headphones,
  IndianRupee,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  QrCode,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { listBookings, listNotifications } from "../api";

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) => {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN")}`;
};

const getBookingStatus = (booking) => {
  const status = String(booking?.status || "").toLowerCase();

  if (status === "completed") return "Completed";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "in_progress") return "Service Started";
  if (status === "accepted") return "Worker Assigned";
  if (status === "pending") return "Requested";

  if (status.includes("completed")) return "Completed";
  if (status.includes("cancel")) return "Cancelled";
  if (status.includes("progress") || status.includes("started") || status.includes("service")) {
    return "Service Started";
  }
  if (status.includes("accept")) return "Worker Assigned";
  if (status.includes("way") || status.includes("travel")) return "On The Way";

  return "Requested";
};

const isActiveBooking = (booking) => {
  const status = getBookingStatus(booking);

  return [
    "Requested",
    "Worker Assigned",
    "On The Way",
    "Arrived",
    "Service Started",
  ].includes(status);
};

const isPreviousBooking = (booking) => {
  const status = getBookingStatus(booking);

  return status === "Completed" || status === "Cancelled";
};

const normalizeWorker = (worker, index) => {
  const safeWorker = worker || {};
  const locationValue =
    typeof safeWorker.location === "string"
      ? safeWorker.location
      : safeWorker.address ||
        safeWorker.city ||
        "Jaipur";

  return {
    ...safeWorker,
    id:
      safeWorker.id ||
      safeWorker._id ||
      `worker-${index + 1}`,
    name:
      safeWorker.name ||
      safeWorker.fullName ||
      "Verified Worker",
    skill:
      safeWorker.skill ||
      safeWorker.primarySkill ||
      safeWorker.category ||
      "Home Services",
    rating: Number(safeWorker.rating) || 4.7,
    experience:
      safeWorker.experience ||
      safeWorker.experienceYears ||
      "3+ years",
    location: locationValue,
    verified: safeWorker.verified !== false,
    phone: safeWorker.phone || "",
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CustomerMyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("active");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrMode, setQrMode] = useState("check-in");

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        "Hi! I'm your ShramSetu Assistant. I can help you with your booking, worker status, ETA and previous services.",
    },
  ]);

  const [ratingBooking, setRatingBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [copied, setCopied] = useState(false);

  /* -------------------------------------------------------
     LOAD BOOKINGS
  ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        const [bookingResult, notificationResult] =
          await Promise.all([
            listBookings(),
            listNotifications(),
          ]);

        if (!cancelled) {
          setBookings(
            Array.isArray(bookingResult)
              ? bookingResult
              : []
          );

          setNotifications(
            Array.isArray(notificationResult)
              ? notificationResult
              : []
          );

          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load customer bookings:",
          error
        );

        if (!cancelled) {
          setBookings([]);
          setNotifications([]);
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------------------------------
     BOOKING GROUPS
  ------------------------------------------------------- */

  const activeBookings = useMemo(
    () => bookings.filter(isActiveBooking),
    [bookings]
  );

  const previousBookings = useMemo(
    () => bookings.filter(isPreviousBooking),
    [bookings]
  );

  const upcomingBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const status = getBookingStatus(booking);

        return (
          status === "Worker Assigned" ||
          status === "Requested"
        );
      }),
    [bookings]
  );

  const currentBooking =
    activeBookings[0] || upcomingBookings[0] || null;

  const previousWorkers = useMemo(() => {
    const names = [];

    previousBookings.forEach((booking) => {
      const workerName =
        booking.workerName ||
        booking.worker ||
        booking.worker?.name;

      if (
        workerName &&
        !names.some((item) => item.name === workerName)
      ) {
        names.push({
          name: workerName,
          service: booking.service || "Home Service",
          rating: booking.workerRating || 4.7,
        });
      }
    });

    return names.slice(0, 4);
  }, [previousBookings]);

  /* -------------------------------------------------------
     WORKER INFORMATION
  ------------------------------------------------------- */

  const getWorkerForBooking = (booking) => {
    if (!booking) return null;

    const bookingWorkerId =
      booking.workerId ||
      booking.worker?._id ||
      booking.worker?.id;

    const bookingWorkerName =
      booking.workerName ||
      (typeof booking.worker === "string"
        ? booking.worker
        : booking.worker?.name);

    if (booking.worker && typeof booking.worker === "object") {
      return normalizeWorker(booking.worker, 0);
    }

    return normalizeWorker(
      {
        id: bookingWorkerId,
        name: bookingWorkerName || "Assigned Worker",
        skill:
          booking.service ||
          booking.category ||
          "Home Service",
        rating: booking.workerRating || 4.7,
        experience: booking.experience || "3+ years",
        location: booking.location || "Nearby",
        verified: true,
      },
      0
    );
  };

  /* -------------------------------------------------------
     MOCK TRACKING
  ------------------------------------------------------- */

  const getTrackingData = (booking) => {
    const status = getBookingStatus(booking);

    if (status === "Requested") {
      return {
        step: 1,
        label: "Finding a worker",
        description:
          "We're finding a verified worker near you.",
        eta: "Matching now",
        distance: "--",
      };
    }

    if (status === "Worker Assigned") {
      return {
        step: 2,
        label: "Worker assigned",
        description:
          "Your verified worker has been assigned.",
        eta: "Preparing to travel",
        distance: "--",
      };
    }

    if (status === "On The Way") {
      return {
        step: 3,
        label: "Worker is on the way",
        description:
          "Your worker is travelling to your location.",
        eta: "8 min",
        distance: "1.8 km",
      };
    }

    if (status === "Arrived") {
      return {
        step: 4,
        label: "Worker has arrived",
        description:
          "Your worker is at the service location.",
        eta: "Arrived",
        distance: "0 km",
      };
    }

    if (status === "Service Started") {
      return {
        step: 5,
        label: "Service in progress",
        description:
          "Your service is currently being completed.",
        eta: "In progress",
        distance: "At location",
      };
    }

    return {
      step: 1,
      label: status,
      description: "",
      eta: "--",
      distance: "--",
    };
  };

  /* -------------------------------------------------------
     QR
  ------------------------------------------------------- */

  const openQR = (booking, mode) => {
    setSelectedBooking(booking);
    setQrMode(mode);
    setShowQR(true);
  };

  const generateQRValue = (booking, mode) => {
    const bookingId =
      booking?.id ||
      booking?._id ||
      booking?.bookingId ||
      "SS-DEMO";

    return `SHRAMSETU|${bookingId}|${mode}|CUSTOMER`;
  };

  /* -------------------------------------------------------
     CHATBOT
  ------------------------------------------------------- */

  const getChatResponse = (message) => {
    const text = message.toLowerCase();

    if (
      text.includes("where") ||
      text.includes("worker") ||
      text.includes("track")
    ) {
      if (currentBooking) {
        const worker = getWorkerForBooking(currentBooking);
        const tracking = getTrackingData(currentBooking);

        return `${worker?.name || "Your worker"} is currently ${
          tracking.label.toLowerCase()
        }. Estimated arrival: ${tracking.eta}. Distance: ${tracking.distance}.`;
      }

      return "You currently don't have an active booking.";
    }

    if (
      text.includes("previous") ||
      text.includes("old worker") ||
      text.includes("last worker")
    ) {
      if (previousWorkers.length > 0) {
        return `Your previous worker was ${previousWorkers[0].name} for ${previousWorkers[0].service}.`;
      }

      return "I don't have any previous worker information yet.";
    }

    if (
      text.includes("current") ||
      text.includes("booking")
    ) {
      if (currentBooking) {
        const worker = getWorkerForBooking(currentBooking);

        return `Your current booking is for ${
          currentBooking.service || "home service"
        } with ${worker?.name || "your assigned worker"}. Status: ${getBookingStatus(
          currentBooking
        )}.`;
      }

      return "You don't have an active booking right now.";
    }

    if (
      text.includes("payment") ||
      text.includes("price") ||
      text.includes("amount")
    ) {
      if (currentBooking) {
        return `Your booking amount is ${formatAmount(
          currentBooking.amount
        )}.`;
      }

      return "I couldn't find an active booking amount.";
    }

    if (
      text.includes("qr") ||
      text.includes("verify")
    ) {
      return "Use the booking QR before starting the service and again after the service is completed.";
    }

    return "I can help with your current booking, worker location, ETA, payment, QR verification and previous services.";
  };

  const sendMessage = (messageOverride = null) => {
    const message =
      messageOverride !== null
        ? messageOverride
        : chatInput.trim();

    if (!message) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: getChatResponse(message),
    };

    setChatMessages((prev) => [
      ...prev,
      userMessage,
      botMessage,
    ]);

    setChatInput("");
  };

  /* -------------------------------------------------------
     RATING
  ------------------------------------------------------- */

  const submitRating = () => {
    if (!ratingBooking) return;

    console.log("Frontend demo rating:", {
      bookingId:
        ratingBooking.id ||
        ratingBooking._id ||
        ratingBooking.bookingId,
      rating,
      review,
    });

    setBookings((prev) =>
      prev.map((booking) => {
        const bookingId =
          booking.id ||
          booking._id ||
          booking.bookingId;

        const targetId =
          ratingBooking.id ||
          ratingBooking._id ||
          ratingBooking.bookingId;

        if (String(bookingId) !== String(targetId)) {
          return booking;
        }

        return {
          ...booking,
          customerRating: rating,
          customerReview: review,
        };
      })
    );

    setRatingBooking(null);
    setRating(5);
    setReview("");
  };

  /* -------------------------------------------------------
     COPY BOOKING ID
  ------------------------------------------------------- */

  const copyBookingId = async (booking) => {
    const id =
      booking?.id ||
      booking?._id ||
      booking?.bookingId ||
      "SS-DEMO";

    try {
      await navigator.clipboard.writeText(String(id));

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Unable to copy booking ID:", error);
    }
  };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="bg-navy-700 text-white">
        <div className="container-app py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-coop-400">
                <CalendarDays size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Customer Portal
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold md:text-4xl">
                My Bookings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Track your current service, manage upcoming bookings
                and access your complete service history.
              </p>
            </div>

            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-coop-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-coop-600"
            >
              <Zap size={17} />
              Book a New Service
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="container-app py-8">
        {/* -------------------------------------------------
            QUICK STATS
        ------------------------------------------------- */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MiniStat
            icon={<Zap size={20} />}
            label="Active"
            value={activeBookings.length}
          />

          <MiniStat
            icon={<CalendarDays size={20} />}
            label="Upcoming"
            value={upcomingBookings.length}
          />

          <MiniStat
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={
              previousBookings.filter(
                (b) => getBookingStatus(b) === "Completed"
              ).length
            }
          />

          <MiniStat
            icon={<IndianRupee size={20} />}
            label="Total Spent"
            value={formatAmount(
              bookings.reduce(
                (sum, booking) =>
                  sum + (Number(booking.amount) || 0),
                0
              )
            )}
          />
        </div>

        {/* -------------------------------------------------
            ACTIVE BOOKING
        ------------------------------------------------- */}

        {currentBooking && (
          <ActiveBookingCard
            booking={currentBooking}
            worker={getWorkerForBooking(currentBooking)}
            tracking={getTrackingData(currentBooking)}
            onTrack={() =>
              document
                .getElementById("live-tracking-map")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            onCheckIn={() =>
              openQR(currentBooking, "check-in")
            }
            onCheckOut={() =>
              openQR(currentBooking, "check-out")
            }
            onCopy={() => copyBookingId(currentBooking)}
            copied={copied}
          />
        )}

        {/* -------------------------------------------------
            TABS
        ------------------------------------------------- */}

        <div className="mt-10 border-b border-slate-200">
          <div className="flex gap-7 overflow-x-auto">
            <TabButton
              active={activeTab === "active"}
              onClick={() => setActiveTab("active")}
            >
              Active
              {activeBookings.length > 0 && (
                <Badge>{activeBookings.length}</Badge>
              )}
            </TabButton>

            <TabButton
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
              {upcomingBookings.length > 0 && (
                <Badge>{upcomingBookings.length}</Badge>
              )}
            </TabButton>

            <TabButton
              active={activeTab === "previous"}
              onClick={() => setActiveTab("previous")}
            >
              Previous
            </TabButton>
          </div>
        </div>

        {/* -------------------------------------------------
            BOOKING LIST
        ------------------------------------------------- */}

        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : activeTab === "active" ? (
            <BookingList
              bookings={activeBookings}
              emptyTitle="No active services"
              emptyDescription="You don't have a service in progress right now."
              onView={(booking) =>
                setSelectedBooking(booking)
              }
              onRate={(booking) =>
                setRatingBooking(booking)
              }
            />
          ) : activeTab === "upcoming" ? (
            <BookingList
              bookings={upcomingBookings}
              emptyTitle="No upcoming bookings"
              emptyDescription="Your scheduled services will appear here."
              onView={(booking) =>
                setSelectedBooking(booking)
              }
              onRate={(booking) =>
                setRatingBooking(booking)
              }
            />
          ) : (
            <BookingList
              bookings={previousBookings}
              emptyTitle="No previous bookings"
              emptyDescription="Completed services will appear here."
              onView={(booking) =>
                setSelectedBooking(booking)
              }
              onRate={(booking) =>
                setRatingBooking(booking)
              }
            />
          )}
        </div>

        {/* -------------------------------------------------
            PREVIOUS WORKERS
        ------------------------------------------------- */}

        {previousWorkers.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-coop-600">
                  Your Service Network
                </p>

                <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
                  Previous Workers
                </h2>
              </div>

              <span className="text-sm text-slate-500">
                Trusted professionals you've worked with
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {previousWorkers.map((worker, index) => (
                <PreviousWorkerCard
                  key={`${worker.name}-${index}`}
                  worker={worker}
                  onBookAgain={() =>
                    navigate("/services")
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* -------------------------------------------------
            TRUST STRIP
        ------------------------------------------------- */}

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <TrustItem
              icon={<ShieldCheck size={22} />}
              title="Verified Workers"
              description="Every professional is verified before joining the network."
            />

            <TrustItem
              icon={<QrCode size={22} />}
              title="Secure Service Verification"
              description="Use booking-specific QR or OTP verification before and after service."
            />

            <TrustItem
              icon={<Headphones size={22} />}
              title="ShramSetu Assistance"
              description="Get help with your booking through the floating assistant."
            />
          </div>
        </section>
      </main>

      {/* ===================================================
          FLOATING CHATBOT
      =================================================== */}

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-white shadow-xl transition hover:scale-105 hover:bg-navy-800"
          aria-label="Open ShramSetu Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {showChat && (
        <Chatbot
          messages={chatMessages}
          input={chatInput}
          setInput={setChatInput}
          onSend={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* ===================================================
          BOOKING DETAIL MODAL
      =================================================== */}

      {selectedBooking && !showQR && (
        <BookingDetailModal
          booking={selectedBooking}
          worker={getWorkerForBooking(selectedBooking)}
          tracking={getTrackingData(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          onCheckIn={() =>
            openQR(selectedBooking, "check-in")
          }
          onCheckOut={() =>
            openQR(selectedBooking, "check-out")
          }
          onRate={() => {
            setRatingBooking(selectedBooking);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* ===================================================
          QR MODAL
      =================================================== */}

      {showQR && selectedBooking && (
        <QRModal
          booking={selectedBooking}
          mode={qrMode}
          value={generateQRValue(
            selectedBooking,
            qrMode
          )}
          onClose={() => {
            setShowQR(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* ===================================================
          RATING MODAL
      =================================================== */}

      {ratingBooking && (
        <RatingModal
          booking={ratingBooking}
          rating={rating}
          setRating={setRating}
          review={review}
          setReview={setReview}
          onClose={() => setRatingBooking(null)}
          onSubmit={submitRating}
        />
      )}
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
        {icon}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ACTIVE BOOKING
========================================================= */

function ActiveBookingCard({
  booking,
  worker,
  tracking,
  onTrack,
  onCheckIn,
  onCheckOut,
  onCopy,
  copied,
}) {
  const bookingId =
    booking.id ||
    booking._id ||
    booking.bookingId ||
    "SS-DEMO";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-6 text-white md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-coop-400" />
              LIVE SERVICE
            </div>

            <h2 className="font-display text-2xl font-bold">
              {booking.service || "Home Service"}
            </h2>

            <p className="mt-2 text-sm text-white/70">
              {tracking.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(booking.date)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} />
                {booking.time || "Scheduled slot"}
              </span>

              <button
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <Copy size={13} />
                {copied
                  ? "Copied"
                  : `#${bookingId}`}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur">
              <p className="text-xs text-white/60">
                ETA
              </p>

              <p className="mt-1 text-xl font-bold">
                {tracking.eta}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur">
              <p className="text-xs text-white/60">
                Distance
              </p>

              <p className="mt-1 text-xl font-bold">
                {tracking.distance}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Worker */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <WorkerAvatar worker={worker} size="lg" />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {worker?.name}
                </h3>

                {worker?.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-coop-50 px-2 py-1 text-[11px] font-bold text-coop-700">
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {worker?.skill}
              </p>

              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Star
                    size={13}
                    className="fill-current text-amber-500"
                  />
                  {worker?.rating}
                </span>

                <span>
                  {worker?.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-coop-300 hover:text-coop-600">
              <Phone size={18} />
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-coop-300 hover:text-coop-600">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Progress */}

        <div className="mt-8">
          <BookingProgress currentStep={tracking.step} />
        </div>

        {/* Live Tracking */}

        <TrackingMapPlaceholder
          booking={booking}
          worker={worker}
          tracking={tracking}
        />

        {/* Address */}

        <div className="mt-7 rounded-2xl bg-slate-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-coop-600 shadow-sm">
              <MapPin size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Service Location
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {booking.address ||
                  "Service address provided during booking"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onTrack}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
          >
            <Navigation size={17} />
            Track Worker
          </button>

          <button
            onClick={onCheckIn}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-coop-300 bg-coop-50 px-4 py-3 text-sm font-bold text-coop-700 transition hover:bg-coop-100"
          >
            <QrCode size={17} />
            Verify Service
          </button>

          <button
            onClick={onCheckOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <CheckCircle2 size={17} />
            Complete Service
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LIVE TRACKING MAP PLACEHOLDER

   IMPORTANT:
   This is frontend-only UI. Your partner can replace only
   this component with the real Leaflet/Google/Mapbox/OSM
   implementation and connect live worker coordinates.
========================================================= */

function TrackingMapPlaceholder({ booking, worker, tracking }) {
  return (
    <div
      id="live-tracking-map"
      className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
            <Navigation size={19} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Live Worker Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Follow your verified worker to the service location
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-coop-50 px-3 py-1.5 text-xs font-bold text-coop-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-coop-500" />
          Live
        </span>
      </div>

      <div className="relative h-[350px] overflow-hidden bg-[#e9eef0]">
        {/* Decorative map blocks — replace this entire map body later. */}
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-[4%] top-[8%] h-20 w-32 rounded-xl bg-white/80" />
          <div className="absolute right-[7%] top-[12%] h-24 w-40 rounded-xl bg-white/75" />
          <div className="absolute left-[14%] bottom-[10%] h-24 w-36 rounded-xl bg-white/70" />
          <div className="absolute right-[23%] bottom-[14%] h-20 w-32 rounded-xl bg-white/80" />
          <div className="absolute left-[44%] top-[12%] h-16 w-24 rounded-full bg-coop-100/80" />
          <div className="absolute right-[4%] bottom-[7%] h-24 w-32 rounded-full bg-coop-100/70" />
        </div>

        {/* Roads */}
        <div className="absolute left-[13%] top-[-10%] h-[120%] w-2 rotate-[18deg] rounded-full bg-white shadow-sm" />
        <div className="absolute left-[47%] top-[-10%] h-[120%] w-2 rotate-[-13deg] rounded-full bg-white shadow-sm" />
        <div className="absolute right-[19%] top-[-10%] h-[120%] w-2 rotate-[25deg] rounded-full bg-white shadow-sm" />
        <div className="absolute left-[-5%] top-[38%] h-2 w-[110%] rotate-[8deg] rounded-full bg-white shadow-sm" />
        <div className="absolute left-[-5%] top-[72%] h-2 w-[110%] rotate-[-5deg] rounded-full bg-white shadow-sm" />

        {/* Suggested route */}
        <div className="absolute left-[27%] top-[47%] h-1.5 w-[43%] rotate-[-10deg] rounded-full bg-navy-700 shadow-sm" />
        <div className="absolute left-[48%] top-[41%] h-1.5 w-[18%] rotate-[15deg] rounded-full bg-navy-700 shadow-sm" />

        {/* Worker marker */}
        <div className="absolute left-[23%] top-[38%]">
          <div className="relative">
            <div className="absolute -inset-3 animate-ping rounded-full bg-coop-500/20" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-navy-700 text-white shadow-xl">
              <Navigation size={19} />
            </div>
          </div>
          <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lg">
            {worker?.name || booking.workerName || "Assigned Worker"}
          </div>
        </div>

        {/* Customer marker */}
        <div className="absolute right-[22%] top-[57%]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-coop-600 text-white shadow-xl">
            <MapPin size={20} />
          </div>
          <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lg">
            Your Location
          </div>
        </div>

        {/* Map controls UI */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-lg">
            +
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-lg">
            −
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Worker Status
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {tracking?.label || "On The Way"}
                </p>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-slate-400">ETA</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {tracking?.eta || "8 min"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Distance</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {tracking?.distance || "1.8 km"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        <ShieldCheck size={15} className="shrink-0 text-coop-600" />
        Live location will be connected by the tracking service. Location sharing is limited to the active booking.
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING PROGRESS
========================================================= */

function BookingProgress({ currentStep }) {
  const steps = [
    "Requested",
    "Assigned",
    "On The Way",
    "Arrived",
    "Service",
  ];

  return (
    <div className="relative">
      <div className="absolute left-5 right-5 top-4 h-0.5 bg-slate-200" />

      <div
        className="absolute left-5 top-4 h-0.5 bg-coop-500 transition-all"
        style={{
          width: `calc(${Math.max(
            currentStep - 1,
            0
          )} * ${100 / (steps.length - 1)}% - 20px)`,
        }}
      />

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber <= currentStep;

          return (
            <div
              key={step}
              className="flex w-20 flex-col items-center text-center"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  completed
                    ? "border-coop-500 bg-coop-500 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <span className="text-xs font-bold">
                    {stepNumber}
                  </span>
                )}
              </div>

              <span
                className={`mt-2 text-[10px] font-semibold ${
                  completed
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING LIST
========================================================= */

function BookingList({
  bookings,
  emptyTitle,
  emptyDescription,
  onView,
  onRate,
}) {
  if (!bookings.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <CalendarDays size={25} />
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
          {emptyTitle}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking, index) => (
        <BookingListCard
          key={
            booking.id ||
            booking._id ||
            booking.bookingId ||
            index
          }
          booking={booking}
          onView={() => onView(booking)}
          onRate={() => onRate(booking)}
        />
      ))}
    </div>
  );
}

/* =========================================================
   BOOKING LIST CARD
========================================================= */

function BookingListCard({
  booking,
  onView,
  onRate,
}) {
  const worker = normalizeWorker(
    {
      name:
        booking.workerName ||
        booking.worker ||
        "Assigned Worker",
      skill:
        booking.service ||
        booking.category ||
        "Home Service",
      rating: booking.workerRating || 4.7,
      verified: true,
    },
    0
  );

  const status = getBookingStatus(booking);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <WorkerAvatar worker={worker} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900">
                {booking.service || "Home Service"}
              </h3>

              <StatusPill status={status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {worker.name}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(booking.date)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} />
                {booking.time || "Scheduled"}
              </span>

              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <IndianRupee size={14} />
                {Number(booking.amount || 0).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {status === "Completed" && (
            <button
              onClick={onRate}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
            >
              <Star size={16} />
              Rate
            </button>
          )}

          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navy-700"
          >
            View
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING DETAIL MODAL
========================================================= */

function BookingDetailModal({
  booking,
  worker,
  tracking,
  onClose,
  onCheckIn,
  onCheckOut,
  onRate,
}) {
  const status = getBookingStatus(booking);

  return (
    <ModalShell onClose={onClose}>
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-coop-600">
              Booking Details
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
              {booking.service || "Home Service"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-4">
            <WorkerAvatar worker={worker} size="lg" />

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">
                  {worker.name}
                </h3>

                {worker.verified && (
                  <ShieldCheck
                    size={16}
                    className="text-coop-600"
                  />
                )}
              </div>

              <p className="text-sm text-slate-500">
                {worker.skill}
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Star
                  size={13}
                  className="fill-current text-amber-500"
                />
                {worker.rating}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={<CalendarDays size={17} />}
            label="Date"
            value={formatDate(booking.date)}
          />

          <DetailItem
            icon={<Clock3 size={17} />}
            label="Time"
            value={booking.time || "Not specified"}
          />

          <DetailItem
            icon={<IndianRupee size={17} />}
            label="Amount"
            value={formatAmount(booking.amount)}
          />

          <DetailItem
            icon={<CheckCircle2 size={17} />}
            label="Status"
            value={status}
          />

          <div className="sm:col-span-2">
            <DetailItem
              icon={<MapPin size={17} />}
              label="Address"
              value={
                booking.address ||
                "Address provided during booking"
              }
            />
          </div>
        </div>

        {isActiveBooking(booking) && (
          <div className="mt-6 rounded-2xl border border-coop-100 bg-coop-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-coop-700">
                  Current Status
                </p>

                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                  {tracking.label}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {tracking.description}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">
                  ETA
                </p>

                <p className="text-xl font-bold text-coop-700">
                  {tracking.eta}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {isActiveBooking(booking) && (
            <>
              <button
                onClick={onCheckIn}
                className="flex items-center justify-center gap-2 rounded-xl bg-coop-600 px-4 py-3 text-sm font-bold text-white hover:bg-coop-700"
              >
                <QrCode size={17} />
                Show Check-in QR
              </button>

              <button
                onClick={onCheckOut}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle2 size={17} />
                Show Completion QR
              </button>
            </>
          )}

          {status === "Completed" && (
            <button
              onClick={onRate}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white hover:bg-navy-800"
            >
              <Star size={17} />
              Rate Worker
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   QR MODAL
========================================================= */

function QRModal({
  booking,
  mode,
  value,
  onClose,
}) {
  const isCheckIn = mode === "check-in";

  return (
    <ModalShell onClose={onClose}>
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-coop-600">
              Secure Verification
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
              {isCheckIn
                ? "Service Check-in"
                : "Service Completion"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div className="p-6 text-center">
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-3xl border-8 border-slate-100 bg-white shadow-inner">
          <FakeQR value={value} />
        </div>

        <h3 className="mt-6 font-display text-lg font-bold text-slate-900">
          {isCheckIn
            ? "Show this QR to your worker"
            : "Show this QR to complete the service"}
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          This is a booking-specific verification QR for your
          ShramSetu prototype.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Booking
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            #
            {booking.id ||
              booking._id ||
              booking.bookingId ||
              "SS-DEMO"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white hover:bg-navy-800"
        >
          Done
        </button>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   FAKE QR
========================================================= */

function FakeQR({ value }) {
  const cells = useMemo(() => {
    const output = [];
    let seed = 0;

    for (let i = 0; i < value.length; i++) {
      seed =
        (seed * 31 + value.charCodeAt(i)) %
        1000003;
    }

    for (let i = 0; i < 441; i++) {
      seed =
        (seed * 1103515245 + 12345) %
        2147483647;

      output.push(seed % 2 === 0);
    }

    return output;
  }, [value]);

  const isFinder = (row, col, startRow, startCol) => {
    if (
      row < startRow ||
      row >= startRow + 7 ||
      col < startCol ||
      col >= startCol + 7
    ) {
      return false;
    }

    const r = row - startRow;
    const c = col - startCol;

    return (
      r === 0 ||
      r === 6 ||
      c === 0 ||
      c === 6 ||
      (r >= 2 &&
        r <= 4 &&
        c >= 2 &&
        c <= 4)
    );
  };

  return (
    <div
      className="grid bg-white p-2"
      style={{
        gridTemplateColumns: "repeat(21, 8px)",
        gridTemplateRows: "repeat(21, 8px)",
        gap: "1px",
      }}
    >
      {cells.map((filled, index) => {
        const row = Math.floor(index / 21);
        const col = index % 21;

        const finder =
          isFinder(row, col, 0, 0) ||
          isFinder(row, col, 0, 14) ||
          isFinder(row, col, 14, 0);

        return (
          <span
            key={index}
            className={
              finder || filled
                ? "bg-slate-900"
                : "bg-white"
            }
          />
        );
      })}
    </div>
  );
}

/* =========================================================
   RATING MODAL
========================================================= */

function RatingModal({
  booking,
  rating,
  setRating,
  review,
  setReview,
  onClose,
  onSubmit,
}) {
  const workerName =
    booking.workerName ||
    booking.worker ||
    "your worker";

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Star
              size={28}
              className="fill-current"
            />
          </div>

          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
            Rate your service
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            How was your experience with {workerName}?
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className="transition hover:scale-110"
            >
              <Star
                size={30}
                className={
                  value <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(event) =>
            setReview(event.target.value)
          }
          rows={4}
          placeholder="Share your experience..."
          className="mt-6 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-coop-400 focus:bg-white"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="flex-1 rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   CHATBOT
========================================================= */

function Chatbot({
  messages,
  input,
  setInput,
  onSend,
  onClose,
}) {
  const quickActions = [
    "Where is my worker?",
    "What is my current booking?",
    "Who was my previous worker?",
    "Show my payment",
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-navy-700 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coop-500">
            <Sparkles size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold">
              ShramSetu Assistant
            </h3>

            <p className="text-xs text-white/60">
              Booking support
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          <X size={19} />
        </button>
      </div>

      <div className="h-[330px] overflow-y-auto bg-slate-50 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${
              message.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-5 ${
                message.sender === "user"
                  ? "rounded-br-md bg-navy-700 text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onSend(action)}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-coop-300 hover:text-coop-700"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-coop-400">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSend();
              }
            }}
            placeholder="Ask about your booking..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          />

          <button
            onClick={() => onSend()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coop-600 text-white hover:bg-coop-700"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PREVIOUS WORKER CARD
========================================================= */

function PreviousWorkerCard({
  worker,
  onBookAgain,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <WorkerAvatar
          worker={normalizeWorker(worker, 0)}
        />

        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-900">
            {worker.name}
          </h3>

          <p className="truncate text-xs text-slate-500">
            {worker.service}
          </p>

          <div className="mt-1 flex items-center gap-1 text-xs">
            <Star
              size={12}
              className="fill-current text-amber-500"
            />

            <span className="font-semibold text-slate-600">
              {worker.rating}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onBookAgain}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-coop-200 bg-coop-50 px-3 py-2.5 text-xs font-bold text-coop-700 hover:bg-coop-100"
      >
        <RotateCcw size={14} />
        Book Again
      </button>
    </div>
  );
}

/* =========================================================
   WORKER AVATAR
========================================================= */

function WorkerAvatar({
  worker,
  size = "md",
}) {
  const dimensions =
    size === "lg"
      ? "h-14 w-14"
      : "h-11 w-11";

  const name =
    worker?.name || "Worker";

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-2xl bg-navy-700 font-display font-bold text-white`}
    >
      {initials || <UserRound size={20} />}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusPill({ status }) {
  const styles = {
    Requested:
      "bg-amber-50 text-amber-700 border-amber-200",
    "Worker Assigned":
      "bg-blue-50 text-blue-700 border-blue-200",
    "On The Way":
      "bg-indigo-50 text-indigo-700 border-indigo-200",
    Arrived:
      "bg-coop-50 text-coop-700 border-coop-200",
    "Service Started":
      "bg-coop-50 text-coop-700 border-coop-200",
    Completed:
      "bg-slate-100 text-slate-700 border-slate-200",
    Cancelled:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   TAB
========================================================= */

function TabButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 whitespace-nowrap pb-4 text-sm font-bold transition ${
        active
          ? "text-navy-700"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}

      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-coop-500" />
      )}
    </button>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({ children }) {
  return (
    <span className="rounded-full bg-coop-100 px-2 py-0.5 text-[10px] font-bold text-coop-700">
      {children}
    </span>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-coop-600">
        {icon}

        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-coop-500" />

      <p className="mt-4 text-sm font-medium text-slate-500">
        Loading your bookings...
      </p>
    </div>
  );
}


/* =========================================================
   MODAL SHELL
========================================================= */

function ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}