import React, { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  Navigation,
  PlayCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
  Wrench,
  Zap,
  Hammer,
  Gift,
  Flame,
  Users,
  BadgePercent,
  Bell,
  MessageCircle,
  PhoneCall,
  X,
  Check,
  Timer,
  QrCode,
  ScanLine,
  Route,
  AlertTriangle,
  Bot,
  Send,
  CircleDot,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listBookings, updateBookingStatus } from "../api";
import { getCurrentUser } from "../data/mockauth";

/* =================================================
   DEMO GIG DATA
================================================= */

const DEMO_GIGS = [
  {
    id: 1,
    service: "Plumbing Repair",
    icon: Wrench,
    customer: "Rahul Sharma",
    location: "Vaishali Nagar, Jaipur",
    distance: "1.8 km",
    amount: 650,
    time: "Today, 11:30 AM",
    duration: "1–2 hrs",
    priority: "Normal",
    latitude: 26.9124,
    longitude: 75.7873,
  },

  {
    id: 2,
    service: "Electrical Repair",
    icon: Zap,
    customer: "Ankit Verma",
    location: "Mansarovar, Jaipur",
    distance: "2.6 km",
    amount: 850,
    time: "Today, 1:00 PM",
    duration: "1–2 hrs",
    priority: "High",
    latitude: 26.8567,
    longitude: 75.7648,
  },

  {
    id: 3,
    service: "Carpentry Work",
    icon: Hammer,
    customer: "Priya Gupta",
    location: "Shyam Nagar, Jaipur",
    distance: "3.2 km",
    amount: 900,
    time: "Today, 3:30 PM",
    duration: "2–3 hrs",
    priority: "Normal",
    latitude: 26.9001,
    longitude: 75.7671,
  },
];

/* =================================================
   WEEKLY EARNINGS
================================================= */

const WEEKLY_EARNINGS = [
  { day: "Mon", amount: 850 },
  { day: "Tue", amount: 1200 },
  { day: "Wed", amount: 950 },
  { day: "Thu", amount: 1450 },
  { day: "Fri", amount: 1100 },
  { day: "Sat", amount: 1680 },
  { day: "Sun", amount: 0 },
];

/* =================================================
   WORKER OFFERS
================================================= */

const WORKER_OFFERS = [
  {
    id: 1,
    title: "First 5 Jobs Bonus",
    description:
      "Complete your first 5 eligible jobs and earn an additional bonus.",
    reward: "+₹500",
    icon: Gift,
    tag: "NEW WORKER",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    tagBg: "bg-blue-100",
    tagColor: "text-blue-700",
  },

  {
    id: 2,
    title: "Weekend Earnings Boost",
    description:
      "Complete eligible weekend jobs during high-demand hours.",
    reward: "+10%",
    icon: Flame,
    tag: "WEEKEND",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    tagBg: "bg-orange-100",
    tagColor: "text-orange-700",
  },

  {
    id: 3,
    title: "Refer a Worker",
    description:
      "Refer a verified worker and receive a referral incentive after eligibility is met.",
    reward: "+₹300",
    icon: Users,
    tag: "REFERRAL",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    tagBg: "bg-purple-100",
    tagColor: "text-purple-700",
  },

  {
    id: 4,
    title: "High Demand Bonus",
    description:
      "Earn additional incentives on selected high-demand service categories.",
    reward: "+₹150",
    icon: BadgePercent,
    tag: "HIGH DEMAND",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    tagBg: "bg-emerald-100",
    tagColor: "text-emerald-700",
  },
];

/* =================================================
   WORKER HOME
================================================= */

export default function WorkerHome() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [gigs, setGigs] = useState(() => {
    try {
      const saved = localStorage.getItem("ss_worker_available_gigs");
      return saved ? JSON.parse(saved) : DEMO_GIGS;
    } catch {
      return DEMO_GIGS;
    }
  });

  const formatDistanceDisplay = (distanceKm) => {
    if (distanceKm === null || distanceKm === undefined || Number.isNaN(Number(distanceKm))) {
      return "Distance unavailable";
    }

    const numericDistance = Number(distanceKm);

    if (numericDistance < 1) {
      return `${Math.round(numericDistance * 1000)} m`;
    }

    return `${Number(numericDistance.toFixed(1))} km`;
  };

  const normalizeBookingToGig = (booking) => ({
    id: booking.id || booking._id || booking.bookingId,
    icon: Wrench,
    service: booking.serviceName || booking.service || "Service Request",
    customer: booking.customer?.name || booking.customerName || "Customer name unavailable",
    location: booking.address || booking.location || "Jaipur",
    distance: formatDistanceDisplay(booking.distanceKm),
    amount: Number(booking.amount || 0),
    time: booking.scheduledAt
      ? new Date(booking.scheduledAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "As scheduled",
    duration: "1–2 hrs",
    priority: "Normal",
    latitude: Number(booking.latitude ?? 26.9124),
    longitude: Number(booking.longitude ?? 75.7873),
    status: booking.status || "pending",
  });

  const mapBookingStatusToJobStatus = (status = "pending") => {
    const normalized = String(status).toLowerCase();
    if (normalized === "accepted") return "accepted";
    if (normalized === "in_progress") return "service";
    if (normalized === "completed") return "completed";
    if (normalized === "cancelled") return "idle";
    return "incoming";
  };

  /*
   * INCOMING / ACTIVE REQUEST
   *
   * The active request is persisted locally so a refresh does not
   * lose the worker's current service workflow.
   */
  const [incomingRequest, setIncomingRequest] = useState(() => {
    try {
      const saved = localStorage.getItem("ss_worker_active_request");
      return saved ? JSON.parse(saved) : DEMO_GIGS[0];
    } catch {
      return DEMO_GIGS[0];
    }
  });

  useEffect(() => {
    let cancelled = false;

    const loadWorkerBookings = async () => {
      try {
        const bookings = await listBookings();

        if (cancelled) return;

        const workerBookings = Array.isArray(bookings) ? bookings : [];

        if (workerBookings.length > 0) {
          const nextGig = workerBookings.map(normalizeBookingToGig);
          setGigs(nextGig);
          const firstBooking = nextGig[0];
          setIncomingRequest(firstBooking);
          setJobStatus(mapBookingStatusToJobStatus(firstBooking.status));
          try {
            localStorage.setItem("ss_worker_active_request", JSON.stringify(firstBooking));
          } catch {
            // no-op if storage is unavailable
          }
        } else {
          setGigs(DEMO_GIGS);
          setIncomingRequest(DEMO_GIGS[0]);
          setJobStatus("incoming");
        }
      } catch (error) {
        console.error("Unable to load worker bookings from the backend:", error);
      }
    };

    loadWorkerBookings();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.workerId]);

  /*
   * REQUEST STATE
   *
   * incoming
   * accepted
   * on_way
   * reached
   * service
   * completed
   * idle
   */
  const [jobStatus, setJobStatus] = useState(() => {
    try {
      return localStorage.getItem("ss_worker_job_status") || "incoming";
    } catch {
      return "incoming";
    }
  });

  /*
   * 15 MINUTE BUFFER
   */
  const [bufferSeconds, setBufferSeconds] = useState(() => {
    try {
      const acceptedAt = Number(localStorage.getItem("ss_worker_accepted_at"));
      if (acceptedAt) {
        return Math.max(0, Math.ceil((acceptedAt + 15 * 60 * 1000 - Date.now()) / 1000));
      }
    } catch {
      // Ignore localStorage errors in prototype mode.
    }
    return 15 * 60;
  });

  /*
   * AI ASSISTANT
   */
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "ai",
      text:
        "Hello. I am your ShramSetu AI Assistant. I can help you with this service request, navigation and job status.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");

  /*
   * ALERT
   */
  const [requestAlert, setRequestAlert] = useState(true);

  /*
   * QR MODAL
   */
  const [qrModal, setQrModal] = useState(null);

  /*
   * SERVICE START / COMPLETION
   */
  const [qrVerified, setQrVerified] = useState(false);

  /*
   * MAP
   */
  const [mapLoading, setMapLoading] = useState(true);

  /*
   * AUDIO REFERENCE
   */
  const audioContextRef = useRef(null);
  const aiEscalatedRef = useRef(false);

  /* =================================================
     WORKER NAME
  ================================================= */

  const workerName =
    currentUser?.name ||
    currentUser?.fullName ||
    "Worker";

  const firstName = workerName.split(" ")[0];

  /* =================================================
     ALERT SOUND
  ================================================= */

  const playAlertSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        880,
        ctx.currentTime
      );

      oscillator.frequency.setValueAtTime(
        660,
        ctx.currentTime + 0.18
      );

      oscillator.frequency.setValueAtTime(
        880,
        ctx.currentTime + 0.36
      );

      gainNode.gain.setValueAtTime(
        0.0001,
        ctx.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.25,
        ctx.currentTime + 0.03
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.55
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.6);
    } catch (error) {
      console.log("Alert sound unavailable.");
    }
  };

  /* =================================================
     INITIAL REQUEST ALERT
  ================================================= */

  useEffect(() => {
    if (incomingRequest && jobStatus === "incoming" && requestAlert) {
      const timer = setTimeout(() => {
        playAlertSound();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [incomingRequest, jobStatus, requestAlert]);

  /* =================================================
     BUFFER TIMER
  ================================================= */

  useEffect(() => {
    if (jobStatus !== "accepted") {
      return;
    }

    let timer;

    const tick = () => {
      const acceptedAt =
        Number(localStorage.getItem("ss_worker_accepted_at")) ||
        Date.now();

      const remaining = Math.max(
        0,
        Math.ceil(
          (acceptedAt + 15 * 60 * 1000 - Date.now()) / 1000
        )
      );

      setBufferSeconds(remaining);

      if (remaining <= 0 && !aiEscalatedRef.current) {
        aiEscalatedRef.current = true;
        setRequestAlert(false);

        setAiMessages((previous) => [
          ...previous,
          {
            sender: "ai",
            text:
              "The 15-minute buffer has expired. Please respond to the AI Assistant. If there is no response, this request may be reassigned to another available worker.",
          },
        ]);

        setAiAssistantOpen(true);

        if (timer) {
          clearInterval(timer);
        }
      }
    };

    tick();
    timer = setInterval(tick, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [jobStatus]);

  /* =================================================
     FORMAT TIMER
  ================================================= */

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* =================================================
     ACCEPT REQUEST
  ================================================= */

  const handleAcceptRequest = async () => {
    if (!incomingRequest?.id) return;

    try {
      const updated = await updateBookingStatus(incomingRequest.id, "accepted");
      const nextRequest = {
        ...incomingRequest,
        status: updated?.status || "accepted",
      };
      setIncomingRequest(nextRequest);
      setGigs((previous) =>
        previous.map((item) =>
          String(item.id) === String(incomingRequest.id)
            ? { ...item, status: nextRequest.status }
            : item
        )
      );

      const acceptedAt = Date.now();
      aiEscalatedRef.current = false;

      setJobStatus("accepted");
      setBufferSeconds(15 * 60);
      setRequestAlert(false);

      try {
        localStorage.setItem("ss_worker_accepted_at", String(acceptedAt));
      } catch {
        // Prototype fallback.
      }

      playAlertSound();
    } catch (error) {
      console.error("Unable to accept the booking:", error);
      setAiMessages((previous) => [
        ...previous,
        {
          sender: "ai",
          text: "I could not accept this booking because the booking status was not valid for the current workflow.",
        },
      ]);
      setAiAssistantOpen(true);
    }
  };

  /* =================================================
     DECLINE REQUEST
  ================================================= */

  const handleDeclineRequest = () => {
    if (!incomingRequest) return;

    setGigs((previous) =>
      previous.filter(
        (item) => item.id !== incomingRequest.id
      )
    );

    setIncomingRequest(null);
    setRequestAlert(false);
    setJobStatus("idle");

    try {
      localStorage.removeItem("ss_worker_active_request");
      localStorage.removeItem("ss_worker_accepted_at");
      localStorage.removeItem("ss_worker_buffer_seconds");
    } catch {
      // Prototype fallback.
    }
  };

  /* =================================================
     MARK ON THE WAY
  ================================================= */

  const handleMarkOnTheWay = () => {
    aiEscalatedRef.current = false;
    setJobStatus("on_way");

    setAiMessages((previous) => [
      ...previous,
      {
        sender: "ai",
        text:
          "Great. Your customer has been notified that you are on the way.",
      },
    ]);
  };

  /* =================================================
     MARK REACHED
  ================================================= */

  const handleMarkReached = () => {
    setJobStatus("reached");

    setAiMessages((previous) => [
      ...previous,
      {
        sender: "ai",
        text:
          "You have marked yourself as reached. Scan the QR code provided by the customer before starting the service.",
      },
    ]);
  };

  /* =================================================
     SERVICE HISTORY
  ================================================= */

  const addCompletedServiceToHistory = (job) => {
    if (!job) return;

    try {
      const existing = JSON.parse(
        localStorage.getItem("ss_worker_service_history") || "[]"
      );

      const historyRecord = {
        ...job,
        status: "Completed",
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.id || currentUser?._id || "demo-worker",
        workerName,
        earning: Number(job.amount) || 0,
      };

      const alreadyExists = existing.some(
        (item) => String(item.id) === String(job.id)
      );

      const nextHistory = alreadyExists
        ? existing.map((item) =>
            String(item.id) === String(job.id)
              ? { ...item, ...historyRecord }
              : item
          )
        : [historyRecord, ...existing];

      localStorage.setItem(
        "ss_worker_service_history",
        JSON.stringify(nextHistory.slice(0, 100))
      );
    } catch (error) {
      console.error("Unable to save service history.", error);
    }
  };

  /* =================================================
     QR VERIFICATION
  ================================================= */

  const handleVerifyQR = async (type) => {
    if (!incomingRequest?.id) return;

    setQrVerified(false);

    setTimeout(async () => {
      try {
        if (type === "start") {
          const updated = await updateBookingStatus(incomingRequest.id, "in_progress");
          setIncomingRequest((previous) => ({ ...previous, status: updated?.status || "in_progress" }));
          setJobStatus("service");
        }

        if (type === "end") {
          const updated = await updateBookingStatus(incomingRequest.id, "completed");
          setIncomingRequest((previous) => ({ ...previous, status: updated?.status || "completed" }));
          setJobStatus("completed");
          addCompletedServiceToHistory(incomingRequest);

          try {
            localStorage.removeItem("ss_worker_accepted_at");
            localStorage.removeItem("ss_worker_buffer_seconds");
          } catch {
            // Prototype fallback.
          }
        }
      } catch (error) {
        console.error("Unable to update booking lifecycle status:", error);
      } finally {
        setQrVerified(true);
      }
    }, 1200);
  };

  /* =================================================
     AI CHAT
  ================================================= */

  const sendAiMessage = () => {
    const message = aiInput.trim();

    if (!message) return;

    setAiMessages((previous) => [
      ...previous,
      {
        sender: "worker",
        text: message,
      },
    ]);

    setAiInput("");

    setTimeout(() => {
      let response =
        "I can help you with the current service request, job status and navigation.";

      if (
        message.toLowerCase().includes("location") ||
        message.toLowerCase().includes("map")
      ) {
        response =
          "The customer's location is shown in the service request map. Use the navigation option to open directions.";
      } else if (
        message.toLowerCase().includes("late") ||
        message.toLowerCase().includes("15")
      ) {
        response =
          "You have a 15-minute buffer after accepting the request. Please mark On the Way before the buffer expires.";
      } else if (
        message.toLowerCase().includes("qr")
      ) {
        response =
          "The customer provides the QR code. Scan it when you reach the location to start the service.";
      }

      setAiMessages((previous) => [
        ...previous,
        {
          sender: "ai",
          text: response,
        },
      ]);
    }, 700);
  };

  /* =================================================
     ACTIVE JOB
  ================================================= */

  const activeJob =
    jobStatus !== "idle" && incomingRequest
      ? incomingRequest
      : null;

  /* =================================================
     MAP URL
  ================================================= */

  const mapUrl = activeJob
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        activeJob.longitude - 0.025
      }%2C${activeJob.latitude - 0.018}%2C${
        activeJob.longitude + 0.025
      }%2C${activeJob.latitude + 0.018
      }&layer=mapnik&marker=${activeJob.latitude}%2C${activeJob.longitude}`
    : "";

  /* =================================================
     STATUS LABEL
  ================================================= */

  const statusLabel = {
    incoming: "New Request",
    accepted: "Accepted",
    on_way: "On the Way",
    reached: "Reached",
    service: "Service in Progress",
    completed: "Completed",
    idle: "No Active Request",
  };

  /* =================================================
     STATUS PROGRESS
  ================================================= */

  const statusProgress = {
    incoming: 10,
    accepted: 25,
    on_way: 50,
    reached: 65,
    service: 80,
    completed: 100,
    idle: 0,
  };

  /* =================================================
     RENDER
  ================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <p className="text-sm text-slate-500">
                  Worker Dashboard
                </p>

                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
                  SHRAMSETU
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Good morning, {firstName} 👋
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage service requests and grow your earnings.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setAiAssistantOpen(true);
                playAlertSound();
              }}
              className="relative w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
              title="AI Assistant"
            >
              <Bot size={21} />

              {jobStatus === "accepted" &&
                bufferSeconds < 300 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                )}
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          INCOMING REQUEST ALERT
      ================================================= */}

      {incomingRequest &&
        jobStatus === "incoming" &&
        requestAlert && (

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

            <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm">

              <div className="bg-blue-600 text-white px-5 py-3 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center animate-pulse">

                    <Bell size={19} />

                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      New Service Request
                    </p>

                    <p className="text-xs text-blue-100">
                      A nearby customer needs your service
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setRequestAlert(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="p-5">

                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">

                  {/* REQUEST DETAILS */}

                  <div>

                    <div className="flex items-start gap-3">

                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">

                        <Wrench
                          size={22}
                          className="text-blue-600"
                        />

                      </div>

                      <div>

                        <h2 className="text-lg font-bold text-slate-900">
                          {incomingRequest.service}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          Customer: {incomingRequest.customer}
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      <InfoRow
                        icon={MapPin}
                        label="Customer Location"
                        value={incomingRequest.location}
                      />

                      <InfoRow
                        icon={Navigation}
                        label="Distance"
                        value={incomingRequest.distance}
                      />

                      <InfoRow
                        icon={Clock3}
                        label="Estimated Duration"
                        value={incomingRequest.duration}
                      />

                      <InfoRow
                        icon={IndianRupee}
                        label="Estimated Earning"
                        value={`₹${incomingRequest.amount}`}
                      />

                    </div>

                    {incomingRequest.priority === "High" && (

                      <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700">

                        <AlertTriangle size={16} />

                        <span className="text-xs font-semibold">
                          High-priority service request
                        </span>

                      </div>

                    )}

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <button
                        type="button"
                        onClick={handleAcceptRequest}
                        className="py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Check size={17} />
                        Accept Request
                      </button>

                      <button
                        type="button"
                        onClick={handleDeclineRequest}
                        className="py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                      >
                        <X size={17} />
                        Decline
                      </button>

                    </div>

                  </div>

                  {/* MAP */}

                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px]">

                    {mapLoading && (
                      <div className="absolute" />
                    )}

                    <iframe
                      title="Customer Location Map"
                      src={mapUrl}
                      className="w-full h-[280px] border-0"
                      loading="lazy"
                      onLoad={() => setMapLoading(false)}
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>
        )}

      {/* =================================================
          ACTIVE JOB CONTROL CENTER
      ================================================= */}

      {activeJob && jobStatus !== "incoming" && (

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

            {/* HEADER */}

            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div>

                <div className="flex items-center gap-2">

                  <CircleDot
                    size={17}
                    className="text-blue-600"
                  />

                  <h2 className="font-bold text-slate-900">
                    Active Service Request
                  </h2>

                </div>

                <p className="text-xs text-slate-500 mt-1">
                  {activeJob.service} • {activeJob.customer}
                </p>

              </div>

              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {statusLabel[jobStatus]}
              </span>

            </div>

            {/* PROGRESS */}

            <div className="px-5 pt-5">

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-semibold text-slate-600">
                  Job Progress
                </span>

                <span className="text-xs font-bold text-blue-600">
                  {statusProgress[jobStatus]}%
                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${statusProgress[jobStatus]}%`,
                  }}
                />

              </div>

            </div>

            <div className="p-5 grid lg:grid-cols-[1fr_1.2fr] gap-5">

              {/* LEFT CONTROL */}

              <div>

                <div className="flex items-start gap-3">

                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                    <Wrench
                      size={22}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      {activeJob.service}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {activeJob.customer}
                    </p>

                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <MapPin size={13} />
                      {activeJob.location}
                    </p>

                  </div>

                </div>

                {/* 15 MIN BUFFER */}

                {jobStatus === "accepted" && (

                  <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">

                        <Timer
                          size={19}
                          className="text-amber-600"
                        />

                      </div>

                      <div className="flex-1">

                        <div className="flex items-center justify-between gap-3">

                          <p className="text-sm font-bold text-amber-800">
                            Mark On the Way
                          </p>

                          <span className="text-lg font-bold text-amber-700">
                            {formatTimer(bufferSeconds)}
                          </span>

                        </div>

                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          You have 15 minutes after accepting the request to mark yourself as On the Way.
                        </p>

                        <button
                          type="button"
                          onClick={handleMarkOnTheWay}
                          className="w-full mt-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition"
                        >
                          <Navigation size={17} />
                          Mark On the Way
                        </button>

                      </div>

                    </div>

                  </div>
                )}

                {/* ON THE WAY */}

                {jobStatus === "on_way" && (

                  <div className="mt-5 p-4 rounded-2xl bg-blue-50 border border-blue-100">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                        <Navigation
                          size={19}
                          className="text-blue-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-blue-800">
                          You are On the Way
                        </p>

                        <p className="text-xs text-blue-700 mt-1">
                          Customer has been notified.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleMarkReached}
                      className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <MapPin size={17} />
                      Mark Reached
                    </button>

                  </div>
                )}

                {/* REACHED */}

                {jobStatus === "reached" && (

                  <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">

                        <CheckCircle2
                          size={19}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-emerald-800">
                          You have reached the location
                        </p>

                        <p className="text-xs text-emerald-700 mt-1">
                          Scan the customer's QR code to start the service.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setQrModal("start");
                        setQrVerified(false);
                      }}
                      className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <ScanLine size={17} />
                      Scan Customer QR
                    </button>

                  </div>
                )}

                {/* SERVICE */}

                {jobStatus === "service" && (

                  <div className="mt-5 p-4 rounded-2xl bg-purple-50 border border-purple-200">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">

                        <Wrench
                          size={19}
                          className="text-purple-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-purple-800">
                          Service in Progress
                        </p>

                        <p className="text-xs text-purple-700 mt-1">
                          Complete the work and scan the customer's completion QR.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setQrModal("end");
                        setQrVerified(false);
                      }}
                      className="w-full mt-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <ScanLine size={17} />
                      Complete Service
                    </button>

                  </div>
                )}

                {/* COMPLETED */}

                {jobStatus === "completed" && (

                  <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">

                        <CheckCircle2
                          size={20}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-emerald-800">
                          Service Completed
                        </p>

                        <p className="text-xs text-emerald-700 mt-1">
                          Job completion has been verified.
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-white border border-emerald-100">

                      <p className="text-xs text-slate-500">
                        Estimated earning
                      </p>

                      <p className="text-xl font-bold text-slate-900 mt-1">
                        ₹{activeJob.amount}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/worker-service-history")}
                      className="w-full mt-3 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                    >
                      <BriefcaseBusiness size={17} />
                      View Service History
                    </button>

                  </div>
                )}

                {/* AI BUTTON */}

                <button
                  type="button"
                  onClick={() => setAiAssistantOpen(true)}
                  className="w-full mt-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <Bot size={17} />
                  Ask AI Assistant
                </button>

              </div>

              {/* MAP */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <div>

                    <p className="text-sm font-bold text-slate-900">
                      Customer Location
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {activeJob.location}
                    </p>

                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activeJob.latitude},${activeJob.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1"
                  >
                    <Route size={14} />
                    Directions
                  </a>

                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200">

                  <iframe
                    title="Active Job Customer Location"
                    src={mapUrl}
                    className="w-full h-[300px] border-0"
                    loading="lazy"
                  />

                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">

                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Distance
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {activeJob.distance}
                    </p>

                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">

                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Estimated Earning
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-1">
                      ₹{activeJob.amount}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <StatCard
            label="Today's Earnings"
            value="₹1,240"
            sub="+12.5% today"
            icon={IndianRupee}
            iconClass="text-emerald-600"
            bgClass="bg-emerald-50"
            subClass="text-emerald-600"
          />

          <StatCard
            label="Jobs Completed"
            value="4"
            sub="Today"
            icon={BriefcaseBusiness}
            iconClass="text-blue-600"
            bgClass="bg-blue-50"
            subClass="text-slate-500"
          />

          <StatCard
            label="Your Rating"
            value="4.8"
            sub="Excellent"
            icon={Star}
            iconClass="text-amber-500"
            bgClass="bg-amber-50"
            subClass="text-amber-600"
            fill
          />

          <StatCard
            label="Jobs Nearby"
            value="7"
            sub="Within 5 km"
            icon={MapPin}
            iconClass="text-purple-600"
            bgClass="bg-purple-50"
            subClass="text-slate-500"
          />

        </section>

        {/* =================================================
            OFFERS
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">

          <div className="px-5 py-5 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div>

                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">

                    <Gift
                      size={19}
                      className="text-amber-600"
                    />

                  </div>

                  <h2 className="font-bold text-slate-900">
                    Offers & Incentives
                  </h2>

                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Earn more by completing eligible jobs and activities.
                </p>

              </div>

              <button
                type="button"
                onClick={() => navigate("/worker-offers")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all offers
                <ChevronRight size={15} />
              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-5">

            {WORKER_OFFERS.map((offer) => {

              const Icon = offer.icon;

              return (
                <div
                  key={offer.id}
                  className={`rounded-xl border border-slate-100 p-4 ${offer.bg} hover:shadow-sm transition`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl ${offer.iconBg} flex items-center justify-center`}
                    >
                      <Icon
                        size={19}
                        className={offer.iconColor}
                      />
                    </div>

                    <span
                      className={`px-2 py-1 rounded-full text-[9px] font-bold ${offer.tagBg} ${offer.tagColor}`}
                    >
                      {offer.tag}
                    </span>

                  </div>

                  <h3 className="font-bold text-slate-900 mt-4">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-5 mt-2 min-h-[40px]">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">

                    <span className="text-lg font-bold text-slate-900">
                      {offer.reward}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/worker-offers")
                      }
                      className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1"
                    >
                      Details
                      <ChevronRight size={13} />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}

          <div className="xl:col-span-2 space-y-6">

            {/* =================================================
                AVAILABLE GIGS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Available Gigs
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Nearby service opportunities
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/worker-gigs")
                  }
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View all
                  <ChevronRight size={15} />
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {gigs.length === 0 ? (

                  <div className="p-10 text-center">

                    <CheckCircle2
                      size={35}
                      className="mx-auto text-emerald-500 mb-3"
                    />

                    <h3 className="font-semibold text-slate-800">
                      No new gigs right now
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Check again when new jobs become available.
                    </p>

                  </div>

                ) : (

                  gigs.map((gig) => {

                    const Icon = gig.icon;

                    return (
                      <div
                        key={gig.id}
                        className="p-5 hover:bg-slate-50 transition"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                          <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">

                            <Icon
                              size={22}
                              className="text-blue-600"
                            />

                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-slate-900">
                                {gig.service}
                              </h3>

                              {gig.priority === "High" && (

                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                  HIGH PRIORITY
                                </span>

                              )}

                            </div>

                            <p className="text-sm text-slate-500 mt-1">
                              {gig.customer}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">

                              <span className="flex items-center gap-1">
                                <MapPin size={13} />
                                {gig.location}
                              </span>

                              <span className="flex items-center gap-1">
                                <Navigation size={13} />
                                {gig.distance}
                              </span>

                              <span className="flex items-center gap-1">
                                <Clock3 size={13} />
                                {gig.duration}
                              </span>

                            </div>

                          </div>

                          <div className="sm:text-right">

                            <p className="text-lg font-bold text-slate-900">
                              ₹{gig.amount}
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Estimated earning
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:ml-16">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/worker-gigs/${gig.id}`
                              )
                            }
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                          >
                            <BriefcaseBusiness size={16} />
                            View Gig
                          </button>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>

            </section>

            {/* =================================================
                BENEFITS
            ================================================= */}

            <section className="mt-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Your ShramSetu Benefits
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  More than just gigs — build a better working future.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/worker-benefits")
                }
                className="text-sm font-semibold text-blue-600 flex items-center gap-1"
              >
                View Benefits
                <ChevronRight size={15} />
              </button>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <BenefitCard
                icon={ShieldCheck}
                title="Medical Insurance"
                description="Worker protection"
              />

              <BenefitCard
                icon={CheckCircle2}
                title="Verified ID"
                description="Digital identity"
              />

              <BenefitCard
                icon={PlayCircle}
                title="Training"
                description="Improve your skills"
              />

              <BenefitCard
                icon={Wallet}
                title="Daily Earnings"
                description="Track your money"
              />

            </div>

          </div>

            </section>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* =================================================
                POCKET
            ================================================= */}

            <section className="bg-slate-900 rounded-2xl p-5 text-white">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-slate-400">
                    Worker Pocket
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    ₹3,890
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Available balance
                  </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">

                  <Wallet size={21} />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-white/5 rounded-xl p-3">

                  <p className="text-[10px] text-slate-400">
                    Pending
                  </p>

                  <p className="font-bold mt-1">
                    ₹650
                  </p>

                </div>

                <div className="bg-white/5 rounded-xl p-3">

                  <p className="text-[10px] text-slate-400">
                    This Week
                  </p>

                  <p className="font-bold mt-1">
                    ₹7,230
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/worker-pocket")
                }
                className="w-full mt-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition"
              >
                Open Pocket
              </button>

            </section>

            {/* =================================================
                WEEKLY EARNINGS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Weekly Earnings
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Your earning activity
                  </p>

                </div>

                <TrendingUp
                  size={19}
                  className="text-emerald-500"
                />

              </div>

              <div className="flex items-end justify-between gap-2 h-32">

                {WEEKLY_EARNINGS.map((item) => {

                  const maxAmount = 1680;

                  const height =
                    item.amount === 0
                      ? 5
                      : Math.max(
                          12,
                          (item.amount / maxAmount) * 100
                        );

                  return (
                    <div
                      key={item.day}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                    >

                      <div
                        className={`w-full max-w-[28px] rounded-t-md transition ${
                          item.amount === 0
                            ? "bg-slate-100"
                            : "bg-blue-500"
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                        title={`₹${item.amount}`}
                      />

                      <span className="text-[10px] text-slate-400">
                        {item.day}
                      </span>

                    </div>
                  );
                })}

              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Weekly total
                </span>

                <span className="font-bold text-slate-900">
                  ₹7,230
                </span>

              </div>

            </section>

            {/* =================================================
                QUICK ACCESS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-100">

                <h2 className="font-bold text-slate-900">
                  Quick Access
                </h2>

              </div>

              <QuickAccess
                icon={BriefcaseBusiness}
                title="Find Gigs"
                onClick={() =>
                  navigate("/worker-gigs")
                }
                color="blue"
              />

              <QuickAccess
                icon={Gift}
                title="Offers & Incentives"
                onClick={() =>
                  navigate("/worker-offers")
                }
                color="orange"
              />

              <QuickAccess
                icon={PlayCircle}
                title="Training & Resources"
                onClick={() =>
                  navigate("/worker-knowledge")
                }
                color="purple"
              />

              <QuickAccess
                icon={ShieldCheck}
                title="Worker Benefits"
                onClick={() =>
                  navigate("/worker-benefits")
                }
                color="emerald"
              />

              <QuickAccess
                icon={BriefcaseBusiness}
                title="Service History"
                onClick={() =>
                  navigate("/worker-service-history")
                }
                color="blue"
              />

              <QuickAccess
                icon={MessageCircle}
                title="Worker Support"
                onClick={() =>
                  navigate("/worker-support")
                }
                color="amber"
                last
              />

            </section>

          </div>

        </div>



      </main>

      {/* =================================================
          AI ASSISTANT
      ================================================= */}

      {aiAssistantOpen && (

        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl">

            {/* HEADER */}

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">

                  <Bot size={19} />

                </div>

                <div>

                  <p className="font-bold text-sm">
                    ShramSetu AI Assistant
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Worker support assistant
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setAiAssistantOpen(false)
                }
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>

            </div>

            {/* MESSAGES */}

            <div className="h-[360px] overflow-y-auto p-4 space-y-3 bg-slate-50">

              {aiMessages.map((message, index) => (

                <div
                  key={index}
                  className={`flex ${
                    message.sender === "worker"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm ${
                      message.sender === "worker"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                    }`}
                  >
                    {message.text}
                  </div>

                </div>

              ))}

            </div>

            {/* QUICK ACTIONS */}

            <div className="px-4 pt-3 flex gap-2 overflow-x-auto">

              <button
                type="button"
                onClick={() =>
                  setAiInput("Where is the customer?")
                }
                className="shrink-0 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
              >
                Customer location
              </button>

              <button
                type="button"
                onClick={() =>
                  setAiInput("What should I do for QR verification?")
                }
                className="shrink-0 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold"
              >
                QR help
              </button>

              <button
                type="button"
                onClick={() =>
                  setAiInput("How much time do I have?")
                }
                className="shrink-0 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold"
              >
                Time remaining
              </button>

            </div>

            {/* INPUT */}

            <div className="p-4 border-t border-slate-100 flex gap-2">

              <input
                value={aiInput}
                onChange={(e) =>
                  setAiInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendAiMessage();
                  }
                }}
                placeholder="Ask the AI assistant..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={sendAiMessage}
                className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
              >
                <Send size={17} />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          QR SCANNER MODAL
      ================================================= */}

      {qrModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  {qrModal === "start"
                    ? "Start Service"
                    : "Complete Service"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Scan the QR code provided by the customer.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setQrModal(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-6">

              {!qrVerified ? (

                <>
                  <div className="relative w-56 h-56 mx-auto rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">

                    <div className="absolute inset-5 border-2 border-white/70 rounded-xl" />

                    <div className="absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />

                    <div className="absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />

                    <div className="absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />

                    <div className="absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

                    <QrCode
                      size={90}
                      className="text-white"
                    />

                    <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-blue-400 animate-pulse" />

                  </div>

                  <div className="mt-5 text-center">

                    <p className="text-sm font-semibold text-slate-800">
                      Scan Customer QR
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Align the customer's QR code inside the scanner.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleVerifyQR(qrModal)
                    }
                    className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ScanLine size={17} />
                    Simulate QR Scan
                  </button>

                </>

              ) : (

                <div className="py-8 text-center">

                  <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">

                    <CheckCircle2
                      size={34}
                      className="text-emerald-600"
                    />

                  </div>

                  <h3 className="font-bold text-slate-900 mt-5">
                    QR Verified Successfully
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    {qrModal === "start"
                      ? "Service can now begin."
                      : "Service completion has been verified."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setQrModal(null)}
                    className="w-full mt-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
                  >
                    Continue
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =================================================
   STAT CARD
================================================= */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  bgClass,
  subClass,
  fill = false,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {value}
          </h3>

          <p className={`text-xs mt-1 font-medium ${subClass}`}>
            {sub}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}
        >

          <Icon
            size={19}
            className={iconClass}
            fill={fill ? "currentColor" : "none"}
          />

        </div>

      </div>

    </div>
  );
}

/* =================================================
   INFO ROW
================================================= */

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">

        <Icon
          size={16}
          className="text-slate-500"
        />

      </div>

      <div>

        <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-800 mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =================================================
   QUICK ACCESS
================================================= */

function QuickAccess({
  icon: Icon,
  title,
  onClick,
  color,
  last = false,
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
      >
        <Icon size={17} />
      </div>

      <span className="flex-1 text-left text-sm font-medium">
        {title}
      </span>

      <ChevronRight
        size={16}
        className="text-slate-400"
      />

    </button>
  );
}

/* =================================================
   BENEFIT CARD
================================================= */

function BenefitCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition">

      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-3">

        <Icon
          size={18}
          className="text-blue-600"
        />

      </div>

      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        {description}
      </p>

    </div>
  );
}