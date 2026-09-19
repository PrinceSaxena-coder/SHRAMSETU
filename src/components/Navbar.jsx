import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  Bell,
  Globe,
  ChevronDown,
  User,
  Hammer,
  LogOut,
  UserCircle,
  ClipboardList,
  Heart,
  Settings,
  BriefcaseBusiness,
  Wallet,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Headphones,
  Ticket,
  PlayCircle,
  Stethoscope,
  Shield,
  CreditCard,
  FileText,
  Moon,
  Volume2,
  Languages,
  ShoppingBag,
  ChevronRight,
  Clock,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";

import {
  LANGUAGES,
  TRANSLATIONS,
  getCurrentUser,
  logout,
} from "../data/mockauth";

import {
  listJobs,
  listNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api";

import logo from "../assets/logo.png";


/* ======================================================
   LOCAL STORAGE HOOK
====================================================== */

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);

      return stored
        ? JSON.parse(stored)
        : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }, [key, value]);

  return [value, setValue];
}


/* ======================================================
   TIME HELPERS
====================================================== */

/*
  Converts:

  8:00 AM
  08:00 AM
  8:00 PM

  into minutes from midnight.
*/

function parseTimeToMinutes(value) {
  if (!value) return null;

  const match = String(value).match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}


/*
  Supports:

  "8:00 AM"
  "8:00 AM - 10:00 AM"
  "08:00 AM – 10:00 AM"

  If only one time exists, the slot is treated
  as a 2-hour slot.
*/

function getSlotTimeRange(timeValue) {
  if (!timeValue) return null;

  const matches = String(timeValue).match(
    /\d{1,2}:\d{2}\s*(?:AM|PM)/gi
  );

  if (!matches || matches.length === 0) {
    return null;
  }

  const start = parseTimeToMinutes(matches[0]);

  if (start === null) {
    return null;
  }

  let end;

  if (matches.length >= 2) {
    end = parseTimeToMinutes(matches[1]);
  } else {
    // ShramSetu worker slots = 2 hours
    end = start + 120;
  }

  if (end === null) {
    end = start + 120;
  }

  /*
    Handles a slot crossing midnight.
  */

  if (end <= start) {
    end += 24 * 60;
  }

  return {
    start,
    end,
  };
}


/*
  Checks whether the job date belongs to today.
*/

function isJobToday(jobDate) {
  if (!jobDate) return false;

  const parsed = new Date(jobDate);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate()
  );
}


/* ======================================================
   NAVBAR
====================================================== */

export default function Navbar() {
  const navigate = useNavigate();


  /* ====================================================
     CURRENT USER
  ==================================================== */

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;


  /* ====================================================
     GENERAL STATES
  ==================================================== */

  const [open, setOpen] = useState(false);

  const [lang, setLang] = useLocalStorage(
    "ss_lang",
    "en"
  );

  const [langOpen, setLangOpen] = useState(false);

  const [roleOpen, setRoleOpen] = useState(false);


  /*
    Notifications are retained for CUSTOMER.

    They are NOT rendered for WORKER.
  */

  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = async () => {
    if (userRole === "worker") {
      setNotifications([]);
      return;
    }

    try {
      const nextNotifications = await listNotifications();
      setNotifications(Array.isArray(nextNotifications) ? nextNotifications : []);
    } catch (error) {
      console.error("Unable to load notifications:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (userRole === "worker") {
      setNotifications([]);
      return;
    }

    refreshNotifications();

    const interval = window.setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [userRole]);

  const ref = useRef(null);


  /* ====================================================
     WORKER ONLINE / OFFLINE
  ==================================================== */

  const [workerOnline, setWorkerOnline] =
    useLocalStorage(
      "ss_worker_online",
      false
    );

  const [faceVerificationOpen, setFaceVerificationOpen] =
    useState(false);

  const [faceVerifying, setFaceVerifying] =
    useState(false);

  const [faceVerified, setFaceVerified] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [checkingActiveGig, setCheckingActiveGig] =
    useState(false);

  const [offlineBlocked, setOfflineBlocked] =
    useState(false);

  const [activeGig, setActiveGig] =
    useState(null);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);


  /* ====================================================
     WORKER SETTINGS
  ==================================================== */

  const [darkMode, setDarkMode] =
    useLocalStorage(
      "ss_worker_dark_mode",
      false
    );

  const [audioLanguage, setAudioLanguage] =
    useLocalStorage(
      "ss_worker_audio_language",
      "English"
    );

  const [supportLanguage, setSupportLanguage] =
    useLocalStorage(
      "ss_worker_support_language",
      "English"
    );


  /* ====================================================
     TRANSLATIONS
  ==================================================== */

  const t =
    TRANSLATIONS[lang] ||
    TRANSLATIONS.en;


  /* ====================================================
     UNREAD NOTIFICATIONS
     CUSTOMER ONLY
  ==================================================== */

  const unread =
    notifications.filter(
      (notification) => !(notification.read ?? notification.isRead)
    ).length;


  /* ====================================================
     ROLE CONFIGURATION
  ==================================================== */

  const activeRole =
    userRole === "worker"
      ? {
          label: "Worker",
          icon: Hammer,
        }
      : {
          label: "Customer",
          icon: User,
        };

  const RoleIcon = activeRole.icon;


  /* ====================================================
     CLOSE DROPDOWNS
  ==================================================== */

  useEffect(() => {
    function handleClick(e) {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setLangOpen(false);
        setRoleOpen(false);
        setNotifOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, []);


  /* ====================================================
     DARK MODE
     WORKER ONLY
  ==================================================== */

  useEffect(() => {
    if (userRole !== "worker") {
      return;
    }

    if (darkMode) {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }

    return () => {
      document.documentElement.classList.remove(
        "dark"
      );
    };
  }, [
    darkMode,
    userRole,
  ]);


  /* ====================================================
     STOP CAMERA
  ==================================================== */

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      cameraStreamRef.current = null;
    }
  };


  /* ====================================================
     START CAMERA
     WORKER ONLY
  ==================================================== */

  useEffect(() => {
    if (
      userRole !== "worker" ||
      !faceVerificationOpen
    ) {
      stopCamera();
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      try {
        setCameraError("");

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          setCameraError(
            "Camera access is not supported by this browser."
          );

          return;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
            },
            audio: false,
          });

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }
      } catch (error) {
        console.error(
          "Camera access error:",
          error
        );

        setCameraError(
          "Camera permission was denied or the camera is unavailable."
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [
    faceVerificationOpen,
    userRole,
  ]);


  /* ====================================================
     CHECK ACTIVE BOOKED GIG
  ==================================================== */

  const findRunningBookedGig = async () => {
    if (userRole !== "worker") {
      return null;
    }

    try {
      /*
        Your existing WorkerDashboard already uses
        listJobs(), so we use the same source here.
      */

      const jobs = await listJobs();

      if (!Array.isArray(jobs)) {
        return null;
      }

      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      const runningGig = jobs.find((job) => {

        if (!job) {
          return false;
        }


        /* -----------------------------------------------
           Ignore finished jobs
        ----------------------------------------------- */

        const status =
          String(job.status || "")
            .trim()
            .toLowerCase();

        const finishedStatuses = [
          "completed",
          "cancelled",
          "canceled",
          "rejected",
          "declined",
        ];

        if (
          finishedStatuses.includes(
            status
          )
        ) {
          return false;
        }


        /* -----------------------------------------------
           Worker ownership check

           If both IDs exist, make sure the job
           actually belongs to this worker.
        ----------------------------------------------- */

        if (
          currentUser?.id &&
          job.workerId &&
          String(job.workerId) !==
            String(currentUser.id)
        ) {
          return false;
        }


        /* -----------------------------------------------
           Only today's jobs
        ----------------------------------------------- */

        if (!isJobToday(job.date)) {
          return false;
        }


        /* -----------------------------------------------
           Get 2-hour slot range
        ----------------------------------------------- */

        const range =
          getSlotTimeRange(job.time);

        if (!range) {
          return false;
        }


        /*
          Normal slot:
          10:00 AM → 12:00 PM

          Current time must be:
          >= start
          AND
          < end
        */

        if (
          currentMinutes >= range.start &&
          currentMinutes < range.end
        ) {
          return true;
        }

        return false;
      });

      return runningGig || null;

    } catch (error) {
      console.error(
        "Unable to check active worker gig:",
        error
      );

      /*
        If API check fails, don't incorrectly lock
        the worker offline.
      */

      return null;
    }
  };


  /* ====================================================
     WORKER ONLINE / OFFLINE TOGGLE
  ==================================================== */

  const handleWorkerToggle = async () => {
    if (userRole !== "worker") {
      return;
    }


    /* ==================================================
       ONLINE → OFFLINE
       FIRST CHECK CURRENT RUNNING SLOT
    ================================================== */

    if (workerOnline) {

      setCheckingActiveGig(true);

      try {

        const runningGig =
          await findRunningBookedGig();

        if (runningGig) {

          /*
            BLOCK OFFLINE
          */

          setActiveGig(runningGig);

          setOfflineBlocked(true);

          return;
        }


        /*
          No active slot.
          Worker can safely go offline.
        */

        setWorkerOnline(false);

      } finally {
        setCheckingActiveGig(false);
      }

      return;
    }


    /* ==================================================
       OFFLINE → VERIFICATION
    ================================================== */

    setFaceVerified(false);
    setFaceVerifying(false);
    setCameraError("");
    setFaceVerificationOpen(true);
  };


  /* ====================================================
     FACE VERIFICATION
  ==================================================== */

  const handleFaceVerification = () => {
    if (userRole !== "worker") {
      return;
    }

    if (cameraError) {
      return;
    }

    setFaceVerifying(true);
    setFaceVerified(false);


    /*
      Prototype verification.

      Later connect:
      - Face recognition
      - Liveness detection
      - ML model
      - Backend verification
    */

    setTimeout(() => {

      setFaceVerifying(false);
      setFaceVerified(true);

      setTimeout(() => {

        setWorkerOnline(true);

        setFaceVerificationOpen(false);

        setFaceVerified(false);

        stopCamera();

      }, 900);

    }, 1800);
  };


  /* ====================================================
     CLOSE FACE VERIFICATION
  ==================================================== */

  const closeFaceVerification = () => {

    setFaceVerificationOpen(false);

    setFaceVerifying(false);

    setFaceVerified(false);

    setCameraError("");

    stopCamera();
  };


  /* ====================================================
     MARK ALL NOTIFICATIONS READ
     CUSTOMER ONLY
  ==================================================== */

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };


  /* ====================================================
     LOGOUT
  ==================================================== */

  const handleLogout = () => {

    logout();

    setRoleOpen(false);
    setNotifOpen(false);
    setLangOpen(false);
    setOpen(false);

    if (userRole === "worker") {
      setWorkerOnline(false);
    }

    navigate("/login");
  };


  /* ====================================================
     WORKER NAVIGATION
     
     PROFILE IS NOT IN MAIN NAVIGATION
  ==================================================== */

  const navLinks =
    userRole === "worker"
      ? [
          {
            to: "/",
            label: t.home,
          },
          {
            to: "/worker-dashboard",
            label: "My Jobs",
          },
          {
            to: "/worker-gigs",
            label: "Gigs",
          },
          {
            to: "/worker-pocket",
            label: "Pocket",
          },
          {
            to: "/ai-insights",
            label: "AI Insights",
          },
        ]
      : [
          {
            to: "/",
            label: t.home,
          },
          {
            to: "/services",
            label: t.services,
          },
          {
            to: "/ai-insights",
            label: "AI Diagnosis",
          },
          {
            to: "/dashboard",
            label: "My Bookings",
          },
        ];


  /* ====================================================
     NAV ITEM STYLE
  ==================================================== */

  const navItem =
    "px-3 py-2 text-sm font-semibold rounded-lg transition-colors";


  /* ====================================================
     WORKER SUPPORT
  ==================================================== */

  const workerSupportItems = [
    {
      label: "Help Centre",
      icon: HelpCircle,
      path: "/worker-help",
    },
    {
      label: "Call Customer Care",
      icon: Headphones,
      action: "call",
    },
    {
      label: "Support Tickets",
      icon: Ticket,
      path: "/worker-support-tickets",
    },
  ];


  /* ====================================================
     KNOWLEDGE RESOURCES
  ==================================================== */

  const workerKnowledgeItems = [
    {
      label: "Online Training Videos",
      icon: PlayCircle,
      path: "/worker-knowledge",
    },
  ];


  /* ====================================================
     WORKER BENEFITS
  ==================================================== */

  const workerBenefitItems = [
    {
      label: "Medical Service",
      icon: Stethoscope,
      path: "/worker-benefits/medical-service",
    },
    {
      label: "Medical Insurance",
      icon: Shield,
      path: "/worker-benefits/medical-insurance",
    },
    {
      label: "ID Card",
      icon: CreditCard,
      path: "/worker-benefits/id-card",
    },
    {
      label: "Agreement",
      icon: FileText,
      path: "/worker-benefits/agreement",
    },
  ];


  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-navy-100">

        <div className="w-full px-6 lg:px-10 xl:px-12 flex items-center justify-between h-16">


          {/* ==================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="flex items-center gap-2"
          >

            <img
              src={logo}
              alt="ShramSetu"
              className="w-9 h-9 rounded-lg object-contain"
            />

            <span className="font-display font-extrabold text-navy-700 text-lg tracking-tight">
              SHRAMSETU
            </span>

          </Link>


          {/* ==================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav className="hidden lg:flex items-center gap-5">

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${navItem} ${
                    isActive
                      ? "text-white bg-navy-500"
                      : "text-navy-500 hover:bg-navy-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

          </nav>


          {/* ==================================================
              DESKTOP CONTROLS
          ================================================== */}

          <div
            className="hidden lg:flex items-center gap-2"
            ref={ref}
          >


            {/* ==================================================
                LANGUAGE
            ================================================== */}

            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setLangOpen((v) => !v);
                  setRoleOpen(false);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-500 hover:bg-navy-50 rounded-lg"
              >

                <Globe size={16} />

                {
                  LANGUAGES.find(
                    (language) =>
                      language.code === lang
                  )?.label
                }

                <ChevronDown size={14} />

              </button>


              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-cardHover border border-navy-100 py-1 animate-fade-up">

                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => {
                        setLang(language.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-navy-50 ${
                        lang === language.code
                          ? "text-coop-600 font-semibold"
                          : "text-navy-600"
                      }`}
                    >
                      {language.label}
                    </button>
                  ))}

                </div>
              )}

            </div>


            {/* ==================================================
                WORKER ONLINE / OFFLINE
            ================================================== */}

            {userRole === "worker" && (
              <button
                type="button"
                onClick={handleWorkerToggle}
                disabled={checkingActiveGig}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  workerOnline
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                } disabled:opacity-60`}
              >

                {checkingActiveGig ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      workerOnline
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                )}

                {checkingActiveGig
                  ? "Checking..."
                  : workerOnline
                    ? "Online"
                    : "Offline"}

              </button>
            )}


            {/* ==================================================
                CUSTOMER NOTIFICATIONS ONLY

                Worker does NOT get this option.
            ================================================== */}

            {userRole !== "worker" && (
              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setLangOpen(false);
                    setRoleOpen(false);
                  }}
                  className="relative p-2.5 text-navy-500 hover:bg-navy-50 rounded-lg"
                >

                  <Bell size={18} />

                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-saffron-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}

                </button>


                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-cardHover border border-navy-100 py-2 animate-fade-up">

                    <div className="flex items-center justify-between px-4 py-1.5">

                      <p className="font-semibold text-sm text-navy-700">
                        Notifications
                      </p>

                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs text-coop-600 font-semibold hover:underline"
                      >
                        Mark all read
                      </button>

                    </div>


                    <div className="max-h-72 overflow-y-auto">

                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">
                          No notifications
                        </p>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-2.5 text-sm border-t border-navy-50 ${
                                !(notification.read ?? notification.isRead)
                                  ? "bg-coop-50/40"
                                  : ""
                              }`}
                            >

                              <p className="text-navy-700 font-medium">
                                {notification.title || notification.text}
                              </p>

                              <p className="text-navy-600 mt-1">
                                {notification.message || notification.text}
                              </p>

                              <div className="flex items-center justify-between gap-2 mt-1.5">
                                <p className="text-xs text-navy-300">
                                  {notification.time ? new Date(notification.time).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) : "Just now"}
                                </p>

                                {!(notification.read ?? notification.isRead) && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-[10px] font-semibold text-coop-600 hover:underline"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>

                            </div>
                          )
                        )
                      )}

                    </div>


                    <div className="border-t border-navy-100 mt-1 pt-1">

                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/notifications");
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-coop-600 hover:bg-coop-50 transition"
                      >
                        View all notifications
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}


            {/* ==================================================
                ROLE PANEL
            ================================================== */}

            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setRoleOpen((v) => !v);
                  setLangOpen(false);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-coop-500 hover:bg-coop-600 rounded-lg"
              >

                <RoleIcon size={16} />

                <span>
                  {activeRole.label}
                </span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    roleOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>


              {/* ==================================================
                  ROLE DROPDOWN
              ================================================== */}

              {roleOpen && (
                <div className="absolute right-0 mt-2 w-72 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-cardHover border border-navy-100 overflow-x-hidden animate-fade-up">


                  {/* ==============================================
                      CUSTOMER MENU
                  ============================================== */}

                  {userRole === "customer" && (
                    <>

                      <button
                        type="button"
                        onClick={() => {
                          navigate("/dashboard");
                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-coop-600 font-semibold hover:bg-navy-50 transition"
                      >

                        <User size={17} />

                        Customer Dashboard

                      </button>


                      <button
                        type="button"
                        onClick={() => {
                          navigate("/profile");
                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <UserCircle size={17} />

                        My Profile

                      </button>


                      <button
                        type="button"
                        onClick={() => {
                          navigate("/dashboard");
                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <ClipboardList size={17} />

                        My Bookings

                      </button>


                      <button
                        type="button"
                        onClick={() => {
                          navigate("/SavedWorkers");
                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <Heart size={17} />

                        Saved Workers

                      </button>


                      <button
                        type="button"
                        onClick={() => {
                          navigate("/settings");
                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <Settings size={17} />

                        Settings

                      </button>

                    </>
                  )}


                  {/* ==============================================
                      WORKER MENU
                  ============================================== */}

                  {userRole === "worker" && (
                    <>

                      {/* WORKER DASHBOARD */}

                      <button
                        type="button"
                        onClick={() => {
                          navigate(
                            "/worker-dashboard"
                          );

                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-coop-600 font-semibold hover:bg-navy-50 transition"
                      >

                        <Hammer size={17} />

                        Worker Dashboard

                      </button>


                      {/* GIGS */}

                      <button
                        type="button"
                        onClick={() => {
                          navigate(
                            "/worker-gigs"
                          );

                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <BriefcaseBusiness size={17} />

                        Gigs

                      </button>


                      {/* POCKET */}

                      <button
                        type="button"
                        onClick={() => {
                          navigate(
                            "/worker-pocket"
                          );

                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <Wallet size={17} />

                        Pocket

                      </button>


                      {/* PROFILE */}

                      <button
                        type="button"
                        onClick={() => {
                          navigate(
                            "/worker-profile"
                          );

                          setRoleOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <UserCircle size={17} />

                        My Profile

                      </button>


                      <div className="h-px bg-navy-100 my-1" />


                      {/* ==================================================
                          HELP & SUPPORT
                      ================================================== */}

                      <div className="px-4 pt-3 pb-1">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-300">
                          Help & Support
                        </p>

                      </div>


                      {workerSupportItems.map(
                        (item) => {

                          const Icon = item.icon;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {

                                if (
                                  item.action ===
                                  "call"
                                ) {

                                  /*
                                    Replace this with
                                    your actual support number.
                                  */

                                  window.location.href =
                                    "tel:18001234567";

                                } else {

                                  navigate(
                                    "/worker-support"
                                  );

                                }

                                setRoleOpen(false);

                              }}
                              className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                            >

                              <span className="flex items-center gap-3">

                                <Icon
                                  size={17}
                                />

                                {item.label}

                              </span>

                              <ChevronRight
                                size={14}
                                className="text-navy-300"
                              />

                            </button>
                          );
                        }
                      )}


                      {/* ==================================================
                          KNOWLEDGE RESOURCES
                      ================================================== */}

                      <div className="px-4 pt-4 pb-1">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-300">
                          Knowledge Resources
                        </p>

                      </div>


                      {workerKnowledgeItems.map(
                        (item) => {

                          const Icon = item.icon;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {

                                navigate(
                                  item.path
                                );

                                setRoleOpen(false);

                              }}
                              className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                            >

                              <span className="flex items-center gap-3">

                                <Icon
                                  size={17}
                                />

                                {item.label}

                              </span>

                              <ChevronRight
                                size={14}
                                className="text-navy-300"
                              />

                            </button>
                          );
                        }
                      )}


                      {/* ==================================================
                          YOUR BENEFITS
                      ================================================== */}

                      <div className="px-4 pt-4 pb-1">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-300">
                          Your Benefits
                        </p>

                      </div>


                      {workerBenefitItems.map(
                        (item) => {

                          const Icon = item.icon;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {

                                navigate(
                                  item.path
                                );

                                setRoleOpen(false);

                              }}
                              className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                            >

                              <span className="flex items-center gap-3">

                                <Icon
                                  size={17}
                                />

                                {item.label}

                              </span>

                              <ChevronRight
                                size={14}
                                className="text-navy-300"
                              />

                            </button>
                          );
                        }
                      )}


                      {/* ==================================================
                          WEB SETTINGS
                      ================================================== */}

                      <div className="px-4 pt-4 pb-1">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-300">
                          Web Settings
                        </p>

                      </div>


                      {/* DARK MODE */}

                      <button
                        type="button"
                        onClick={() =>
                          setDarkMode(
                            (value) => !value
                          )
                        }
                        className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <span className="flex items-center gap-3">

                          <Moon size={17} />

                          Dark Mode

                        </span>


                        <span
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            darkMode
                              ? "bg-coop-500"
                              : "bg-slate-300"
                          }`}
                        >

                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              darkMode
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />

                        </span>

                      </button>


                      {/* AUDIO LANGUAGE */}

                      <button
                        type="button"
                        onClick={() => {

                          const languages = [
                            "English",
                            "Hindi",
                            "Hinglish",
                          ];

                          const current =
                            languages.indexOf(
                              audioLanguage
                            );

                          const next =
                            languages[
                              (current + 1) %
                                languages.length
                            ];

                          setAudioLanguage(
                            next
                          );

                        }}
                        className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <span className="flex items-center gap-3">

                          <Volume2 size={17} />

                          Audio Language

                        </span>

                        <span className="text-xs text-navy-400">
                          {audioLanguage}
                        </span>

                      </button>


                      {/* SUPPORT LANGUAGE */}

                      <button
                        type="button"
                        onClick={() => {

                          const languages = [
                            "English",
                            "Hindi",
                            "Hinglish",
                          ];

                          const current =
                            languages.indexOf(
                              supportLanguage
                            );

                          const next =
                            languages[
                              (current + 1) %
                                languages.length
                            ];

                          setSupportLanguage(
                            next
                          );

                        }}
                        className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <span className="flex items-center gap-3">

                          <Languages size={17} />

                          Support Language

                        </span>

                        <span className="text-xs text-navy-400">
                          {supportLanguage}
                        </span>

                      </button>


                      {/* ORDER */}

                      <button
                        type="button"
                        onClick={() => {

                          navigate(
                            "/worker-settings/order"
                          );

                          setRoleOpen(false);

                        }}
                        className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition"
                      >

                        <span className="flex items-center gap-3">

                          <ShoppingBag
                            size={17}
                          />

                          Order

                        </span>

                        <ChevronRight
                          size={14}
                          className="text-navy-300"
                        />

                      </button>

                    </>
                  )}


                  {/* ==================================================
                      SEPARATOR
                  ================================================== */}

                  <div className="h-px bg-navy-100 mt-2" />

                  {/* ==================================================
                      LOGOUT
                  ================================================== */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            className="lg:hidden p-2 text-navy-600"
            onClick={() => {

              setOpen((v) => !v);

              setLangOpen(false);
              setRoleOpen(false);
              setNotifOpen(false);

            }}
          >

            {open ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>

        </div>


        {/* ====================================================
            MOBILE NAVIGATION
        ==================================================== */}

        {open && (
          <div className="lg:hidden border-t border-navy-100 bg-white animate-fade-up">

            <div className="container-app py-3 flex flex-col gap-1">


              {/* ==================================================
                  MAIN NAVIGATION
              ================================================== */}

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={({ isActive }) =>
                    `${navItem} ${
                      isActive
                        ? "text-white bg-navy-500"
                        : "text-navy-500 hover:bg-navy-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}


              {/* ==================================================
                  WORKER ONLINE / OFFLINE
              ================================================== */}

              {userRole === "worker" && (
                <>
                  <div className="h-px bg-navy-100 my-2" />

                  <button
                    type="button"
                    onClick={handleWorkerToggle}
                    disabled={checkingActiveGig}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold ${
                      workerOnline
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    } disabled:opacity-60`}
                  >

                    <span className="flex items-center gap-2">

                      {checkingActiveGig ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            workerOnline
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                      )}

                      {checkingActiveGig
                        ? "Checking active gigs..."
                        : workerOnline
                          ? "You are Online"
                          : "You are Offline"}

                    </span>

                    <span>
                      {checkingActiveGig
                        ? ""
                        : workerOnline
                          ? "Go Offline"
                          : "Go Online"}
                    </span>

                  </button>
                </>
              )}


              <div className="h-px bg-navy-100 my-2" />


              {/* ==================================================
                  CURRENT PANEL
              ================================================== */}

              <p className="px-3 text-xs font-bold text-navy-300 uppercase tracking-wider">
                Current panel ·{" "}
                {activeRole.label}
              </p>


              {/* ==================================================
                  CUSTOMER MOBILE
                  UNCHANGED
              ================================================== */}

              {userRole === "customer" && (
                <>

                  <button
                    type="button"
                    onClick={() => {
                      navigate("/dashboard");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <User size={15} />

                    Customer Dashboard

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <UserCircle size={15} />

                    My Profile

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate("/dashboard");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <ClipboardList size={15} />

                    My Bookings

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate("/saved-workers");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Heart size={15} />

                    Saved Workers

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate("/settings");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Settings size={15} />

                    Settings

                  </button>

                </>
              )}


              {/* ==================================================
                  WORKER MOBILE MENU
              ================================================== */}

              {userRole === "worker" && (
                <>

                  {/* WORKER DASHBOARD */}

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-dashboard"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Hammer size={15} />

                    Worker Dashboard

                  </button>


                  {/* GIGS */}

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-gigs"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <BriefcaseBusiness
                      size={15}
                    />

                    Gigs

                  </button>


                  {/* POCKET */}

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-pocket"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Wallet size={15} />

                    Pocket

                  </button>


                  {/* ==================================================
                      HELP & SUPPORT
                  ================================================== */}

                  <div className="h-px bg-navy-100 my-2" />

                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-300">
                    Help & Support
                  </p>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-help"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <HelpCircle size={15} />

                    Help Centre

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "tel:18001234567";
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Headphones size={15} />

                    Call Customer Care

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-support-tickets"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Ticket size={15} />

                    Support Tickets

                  </button>


                  {/* ==================================================
                      KNOWLEDGE RESOURCES
                  ================================================== */}

                  <div className="pt-3">

                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-300">
                      Knowledge Resources
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-knowledge"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <PlayCircle size={15} />

                    Online Training Videos

                  </button>


                  {/* ==================================================
                      YOUR BENEFITS
                  ================================================== */}

                  <div className="pt-3">

                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-300">
                      Your Benefits
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-benefits/medical-service"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Stethoscope size={15} />

                    Medical Service

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-benefits/medical-insurance"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <Shield size={15} />

                    Medical Insurance

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-benefits/id-card"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <CreditCard size={15} />

                    ID Card

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/worker-benefits/agreement"
                      );

                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg hover:bg-navy-50 text-navy-600"
                  >

                    <FileText size={15} />

                    Agreement

                  </button>


                  {/* ==================================================
                      WEB SETTINGS
                  ================================================== */}

                  <div className="pt-3">

                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-300">
                      Web Settings
                    </p>

                  </div>


                  {/* DARK MODE */}

                  <button
                    type="button"
                    onClick={() =>
                      setDarkMode(
                        (value) => !value
                      )
                    }
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-navy-50 text-sm text-navy-600"
                  >

                    <span className="flex items-center gap-2">

                      <Moon size={15} />

                      Dark Mode

                    </span>


                    <span
                      className={`relative w-10 h-5 rounded-full ${
                        darkMode
                          ? "bg-coop-500"
                          : "bg-slate-300"
                      }`}
                    >

                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          darkMode
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />

                    </span>

                  </button>


                  {/* AUDIO LANGUAGE */}

                  <button
                    type="button"
                    onClick={() => {

                      const languages = [
                        "English",
                        "Hindi",
                        "Hinglish",
                      ];

                      const current =
                        languages.indexOf(
                          audioLanguage
                        );

                      const next =
                        languages[
                          (current + 1) %
                            languages.length
                        ];

                      setAudioLanguage(
                        next
                      );

                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-navy-50 text-sm text-navy-600"
                  >

                    <span className="flex items-center gap-2">

                      <Volume2 size={15} />

                      Audio Language

                    </span>

                    <span className="text-xs text-navy-400">
                      {audioLanguage}
                    </span>

                  </button>


                  {/* SUPPORT LANGUAGE */}

                  <button
                    type="button"
                    onClick={() => {

                      const languages = [
                        "English",
                        "Hindi",
                        "Hinglish",
                      ];

                      const current =
                        languages.indexOf(
                          supportLanguage
                        );

                      const next =
                        languages[
                          (current + 1) %
                            languages.length
                        ];

                      setSupportLanguage(
                        next
                      );

                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-navy-50 text-sm text-navy-600"
                  >

                    <span className="flex items-center gap-2">

                      <Languages size={15} />

                      Support Language

                    </span>

                    <span className="text-xs text-navy-400">
                      {supportLanguage}
                    </span>

                  </button>


                  {/* ORDER */}

                  <button
                    type="button"
                    onClick={() => {

                      navigate(
                        "/worker-settings/order"
                      );

                      setOpen(false);

                    }}
                    className="flex items-center gap-2 text-left px-3 py-2.5 rounded-lg hover:bg-navy-50 text-sm text-navy-600"
                  >

                    <ShoppingBag size={15} />

                    Order

                  </button>

                </>
              )}

              {/* ==================================================
                  LOGOUT
              ================================================== */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} />
                Logout
              </button>

            </div>

          </div>
        )}

      </header>


      {/* ====================================================
          ACTIVE GIG → CANNOT GO OFFLINE MODAL
      ==================================================== */}

      {userRole === "worker" &&
        offlineBlocked && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-900/60 backdrop-blur-sm px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-navy-100">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">

                    <LockKeyhole
                      size={24}
                      className="text-amber-600"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-navy-700">
                      You can't go Offline
                    </h2>

                    <p className="text-sm text-navy-400 mt-1">
                      You have a booked gig running right now.
                    </p>

                  </div>

                </div>

              </div>


              {/* CONTENT */}

              <div className="p-6">

                <div className="bg-navy-50 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-navy-700 font-semibold">

                    <Clock size={17} />

                    Current Gig

                  </div>


                  {activeGig ? (
                    <div className="mt-3 space-y-2 text-sm">

                      {activeGig.service && (
                        <div className="flex justify-between gap-4">

                          <span className="text-navy-400">
                            Service
                          </span>

                          <span className="font-semibold text-navy-700 text-right">
                            {activeGig.service}
                          </span>

                        </div>
                      )}


                      {activeGig.time && (
                        <div className="flex justify-between gap-4">

                          <span className="text-navy-400">
                            Slot
                          </span>

                          <span className="font-semibold text-navy-700">
                            {activeGig.time}
                          </span>

                        </div>
                      )}


                      {activeGig.customer && (
                        <div className="flex justify-between gap-4">

                          <span className="text-navy-400">
                            Customer
                          </span>

                          <span className="font-semibold text-navy-700">
                            {activeGig.customer}
                          </span>

                        </div>
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-navy-500 mt-2">
                      Your current booked slot is still active.
                    </p>
                  )}

                </div>


                {/* WARNING */}

                <div className="flex gap-3 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">

                  <AlertTriangle
                    size={18}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />

                  <p className="text-xs text-amber-800 leading-relaxed">
                    Please complete your current gig before
                    switching to Offline. You will be able to
                    go Offline after the active slot ends.
                  </p>

                </div>


                {/* BUTTON */}

                <button
                  type="button"
                  onClick={() => {
                    setOfflineBlocked(false);
                    setActiveGig(null);
                  }}
                  className="w-full mt-5 px-4 py-3 rounded-xl bg-coop-500 text-white font-semibold hover:bg-coop-600 transition"
                >
                  Continue Working
                </button>

              </div>

            </div>

          </div>
        )}


      {/* ====================================================
          WORKER FACE VERIFICATION MODAL
      ==================================================== */}

      {userRole === "worker" &&
        faceVerificationOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 backdrop-blur-sm px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">


              {/* HEADER */}

              <div className="px-6 py-5 border-b border-navy-100 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-navy-700">
                    Worker Verification
                  </h2>

                  <p className="text-sm text-navy-400 mt-1">
                    Verify your identity before going online
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeFaceVerification}
                  disabled={faceVerifying}
                  className="p-2 rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition disabled:opacity-50"
                >

                  <X size={20} />

                </button>

              </div>


              {/* CONTENT */}

              <div className="p-6">

                {!faceVerified ? (
                  <>

                    {/* CAMERA */}

                    <div className="relative aspect-[4/3] bg-navy-900 rounded-2xl overflow-hidden">

                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />


                      {/* FACE FRAME */}

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                        <div className="w-48 h-56 border-2 border-white/80 rounded-[48%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />

                      </div>


                      {/* CAMERA ERROR */}

                      {cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/90 p-6 text-center">

                          <div>

                            <Camera
                              size={32}
                              className="mx-auto text-white mb-3"
                            />

                            <p className="text-white text-sm">
                              {cameraError}
                            </p>

                          </div>

                        </div>
                      )}

                    </div>


                    {/* INSTRUCTIONS */}

                    <div className="mt-5 text-center">

                      <div className="flex items-center justify-center gap-2 text-navy-700 font-semibold">

                        <ShieldCheck
                          size={18}
                          className="text-coop-500"
                        />

                        Identity Verification

                      </div>

                      <p className="text-sm text-navy-400 mt-2 leading-relaxed">
                        Position your face inside the frame.
                        Make sure your face is clearly visible
                        before continuing.
                      </p>

                    </div>


                    {/* VERIFY */}

                    <button
                      type="button"
                      onClick={
                        handleFaceVerification
                      }
                      disabled={
                        faceVerifying ||
                        !!cameraError
                      }
                      className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-coop-500 text-white font-semibold hover:bg-coop-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {faceVerifying ? (
                        <>

                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Verifying...

                        </>
                      ) : (
                        <>

                          <Camera size={18} />

                          Verify & Go Online

                        </>
                      )}

                    </button>


                    {/* CANCEL */}

                    <button
                      type="button"
                      onClick={
                        closeFaceVerification
                      }
                      disabled={faceVerifying}
                      className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-navy-500 hover:bg-navy-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                  </>
                ) : (

                  /* SUCCESS */

                  <div className="py-10 text-center">

                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">

                      <CheckCircle2
                        size={42}
                        className="text-emerald-500"
                      />

                    </div>

                    <h3 className="text-xl font-bold text-navy-700 mt-5">
                      Identity Verified
                    </h3>

                    <p className="text-sm text-navy-400 mt-2">
                      You are now online and can receive
                      new gigs.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>
        )}

    </>
  );
}


/* ======================================================
   EXPORT LOCAL STORAGE HOOK
====================================================== */

export {
  useLocalStorage,
};