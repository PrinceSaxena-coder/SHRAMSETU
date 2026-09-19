import React, { useEffect, useMemo, useState } from "react";
import {
  Menu,
  RefreshCw,
  Search,
  Users,
  ClipboardList,
  ShieldCheck,
  IndianRupee,
  CheckCircle2,
  MapPinned,
  BarChart3,
  Sparkles,
  Building2,
  HeartPulse,
  AlertTriangle,
  Eye,
  X,
  Target,
  Clock3,
  WalletCards,
  TrendingUp,
  Gauge,
  Navigation,
  Ban,
} from "lucide-react";

import AdminSidebar from "../components/Adminsidebar";

import {
  getAdminSummary,
  listAdminWorkers,
  listAdminCustomers,
  listAdminBookings,
  listAdminActivities,
  listDisputes,
  updateWorkerVerification,
  toggleWorkerSuspension,
  updateAdminBookingStatus,
  updateDispute,
} from "../api/admindashboard";

/* =========================================================
   HELPERS
========================================================= */

const INR = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write ${key}`, error);
  }
};

const emit = () => {
  window.dispatchEvent(new Event("shramsetu:data"));
};

/* =========================================================
   DEMO FALLBACK DATA
========================================================= */

const demoW = [
  {
    id: "W-1001",
    name: "Rakesh Kumar",
    skill: "Electrician",
    city: "C-Scheme",
    experience: 6,
    rating: 4.8,
    verificationStatus: "verified",
    online: true,
    todayEarnings: 2450,
    accountHolder: "Rakesh Kumar",
    accountNumber: "•••• 4821",
    ifsc: "SBIN0001234",
    latitude: 26.9124,
    longitude: 75.7873,
    currentJob: "Electrical Repair",
    cooperative: "ShramSetu Cooperative",
  },
  {
    id: "W-1002",
    name: "Mohit Sharma",
    skill: "Plumber",
    city: "Malviya Nagar",
    experience: 4,
    rating: 4.7,
    verificationStatus: "verified",
    online: true,
    todayEarnings: 1980,
    accountHolder: "Mohit Sharma",
    accountNumber: "•••• 1192",
    ifsc: "HDFC0002410",
    latitude: 26.85,
    longitude: 75.806,
    currentJob: "Pipe Leakage",
    cooperative: "ShramSetu Cooperative",
  },
  {
    id: "W-1003",
    name: "Suresh Meena",
    skill: "Carpenter",
    city: "Mansarovar",
    experience: 8,
    rating: 4.9,
    verificationStatus: "verified",
    online: false,
    todayEarnings: 1620,
    accountHolder: "Suresh Meena",
    accountNumber: "•••• 6507",
    ifsc: "ICIC0003312",
    latitude: 26.885,
    longitude: 75.752,
    cooperative: "ShramSetu Cooperative",
  },
];

const demoB = [
  {
    id: "SS-5001",
    customerName: "Amit Kumar",
    workerName: "Rakesh Kumar",
    service: "Electrical Repair",
    amount: 900,
    status: "In Progress",
    zone: "C-Scheme",
    time: "10 AM - 12 PM",
  },
  {
    id: "SS-5002",
    customerName: "Priya Sharma",
    workerName: "Mohit Sharma",
    service: "Pipe Leakage",
    amount: 1200,
    status: "Completed",
    zone: "Malviya Nagar",
    time: "12 PM - 2 PM",
  },
  {
    id: "SS-5003",
    customerName: "Neha Jain",
    workerName: "Suresh Meena",
    service: "Carpentry",
    amount: 1600,
    status: "Confirmed",
    zone: "Mansarovar",
    time: "4 PM - 6 PM",
  },
  {
    id: "SS-5004",
    customerName: "Amit Kumar",
    workerName: "Mohit Sharma",
    service: "Tap Installation",
    amount: 700,
    status: "Completed",
    zone: "Malviya Nagar",
    time: "6 PM - 8 PM",
  },
];

const zones = [
  ["Malviya Nagar", 94, 1280, 22, 69, 62],
  ["C-Scheme", 86, 1120, 18, 56, 36],
  ["Mansarovar", 78, 980, 16, 38, 67],
  ["Durgapura", 73, 1010, 14, 77, 78],
  ["Vaishali Nagar", 71, 1050, 12, 27, 39],
  ["Civil Lines", 64, 920, 10, 50, 20],
];

/* =========================================================
   MAIN ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [mobile, setMobile] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [disputes, setDisputes] = useState([]);

  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  /* -------------------------------------------------------
     LOCAL FALLBACK DATA
  ------------------------------------------------------- */

  const getLocalData = () => {
    const storedWorkers = read("ss_registered_workers", demoW);
    const storedCustomers = read("ss_registered_customers", []);
    const storedBookings = read("ss_admin_bookings", demoB);

    return {
      workers:
        Array.isArray(storedWorkers) && storedWorkers.length
          ? storedWorkers
          : demoW,

      customers:
        Array.isArray(storedCustomers) ? storedCustomers : [],

      bookings:
        Array.isArray(storedBookings) && storedBookings.length
          ? storedBookings
          : demoB,
    };
  };

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  const load = async () => {
    setRefreshing(true);

    /*
      IMPORTANT:
      Keep these variables outside try/catch.
      This fixes the original "ds is not defined" crash.
    */

    let localData = getLocalData();

    let apiSummary = {};
    let apiWorkers = null;
    let apiCustomers = null;
    let apiBookings = null;
    let apiActivities = [];
    let apiDisputes = [];

    try {
      const result = await Promise.all([
        getAdminSummary(),
        listAdminWorkers(),
        listAdminCustomers(),
        listAdminBookings(),
        listAdminActivities(),
        listDisputes(),
      ]);

      const [
        fetchedSummary,
        fetchedWorkers,
        fetchedCustomers,
        fetchedBookings,
        fetchedActivities,
        fetchedDisputes,
      ] = result;

      apiSummary = fetchedSummary || {};
      apiWorkers = fetchedWorkers;
      apiCustomers = fetchedCustomers;
      apiBookings = fetchedBookings;
      apiActivities = Array.isArray(fetchedActivities)
        ? fetchedActivities
        : [];
      apiDisputes = Array.isArray(fetchedDisputes)
        ? fetchedDisputes
        : [];

      if (Array.isArray(apiWorkers) && apiWorkers.length) {
        localData.workers = apiWorkers;
      }

      if (Array.isArray(apiCustomers) && apiCustomers.length) {
        localData.customers = apiCustomers;
      }

      if (Array.isArray(apiBookings) && apiBookings.length) {
        localData.bookings = apiBookings;
      }
    } catch (error) {
      console.warn(
        "Admin API unavailable. Using local prototype data.",
        error,
      );
    }

    /* -----------------------------------------------------
       NORMALIZE WORKERS
    ----------------------------------------------------- */

    const normalizedWorkers = localData.workers.map((worker, index) => ({
      ...worker,

      id:
        worker.id ||
        worker._id ||
        worker.workerId ||
        `W-${1000 + index}`,

      name:
        worker.name ||
        worker.fullName ||
        "Worker",

      verificationStatus:
        worker.verificationStatus ||
        "pending",

      online:
        Boolean(worker.online),

      suspended:
        Boolean(worker.suspended),

      todayEarnings:
        Number(worker.todayEarnings || 0),

      rating:
        Number(worker.rating || 4.7),

      experience:
        Number(worker.experience || 0),
    }));

    /* -----------------------------------------------------
       NORMALIZE BOOKINGS
    ----------------------------------------------------- */

    const normalizedBookings = localData.bookings.map(
      (booking, index) => ({
        ...booking,

        id:
          booking.id ||
          booking.bookingId ||
          `SS-${5000 + index}`,

        amount:
          Number(
            booking.amount ||
              booking.totalAmount ||
              booking.price ||
              0,
          ),

        status:
          booking.status ||
          "Pending",
      }),
    );

    /* -----------------------------------------------------
       SUMMARY CALCULATIONS
    ----------------------------------------------------- */

    const revenue = normalizedBookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount ||
            booking.totalAmount ||
            booking.price ||
            0,
        ),
      0,
    );

    const verifiedWorkers =
      normalizedWorkers.filter(
        (worker) =>
          worker.verificationStatus === "verified",
      ).length;

    const pendingKYC =
      normalizedWorkers.filter(
        (worker) =>
          worker.verificationStatus === "pending",
      ).length;

    const completedBookings =
      normalizedBookings.filter(
        (booking) =>
          String(booking.status).toLowerCase() ===
          "completed",
      ).length;

    const activeBookings =
      normalizedBookings.filter(
        (booking) =>
          ![
            "completed",
            "cancelled",
            "rejected",
          ].includes(
            String(booking.status).toLowerCase(),
          ),
      ).length;

    const openDisputes =
      apiDisputes.filter(
        (dispute) =>
          String(dispute.status || "").toLowerCase() !==
          "resolved",
      ).length;

    /* -----------------------------------------------------
       STATE UPDATE
    ----------------------------------------------------- */

    setWorkers(normalizedWorkers);
    setCustomers(localData.customers);
    setBookings(normalizedBookings);
    setActivities(apiActivities);
    setDisputes(apiDisputes);

    setSummary({
      ...apiSummary,

      totalWorkers:
        apiSummary.totalWorkers ??
        normalizedWorkers.length,

      verifiedWorkers:
        apiSummary.verifiedWorkers ??
        verifiedWorkers,

      totalCustomers:
        apiSummary.totalCustomers ??
        localData.customers.length,

      totalBookings:
        apiSummary.totalBookings ??
        normalizedBookings.length,

      completedBookings:
        apiSummary.completedBookings ??
        completedBookings,

      activeBookings:
        apiSummary.activeBookings ??
        activeBookings,

      pendingKYC:
        apiSummary.pendingKYC ??
        pendingKYC,

      revenue:
        apiSummary.revenue ??
        revenue,

      workerEarnings:
        apiSummary.workerEarnings ??
        Math.round(revenue * 0.9),

      openDisputes:
        apiSummary.openDisputes ??
        openDisputes,
    });

    setLoading(false);
    setRefreshing(false);
  };

  /* -------------------------------------------------------
     INITIAL LOAD + LIVE REFRESH
  ------------------------------------------------------- */

  useEffect(() => {
    load();

    const handleRefresh = () => {
      load();
    };

    window.addEventListener(
      "shramsetu:data",
      handleRefresh,
    );

    window.addEventListener(
      "storage",
      handleRefresh,
    );

    const interval = setInterval(
      load,
      8000,
    );

    return () => {
      window.removeEventListener(
        "shramsetu:data",
        handleRefresh,
      );

      window.removeEventListener(
        "storage",
        handleRefresh,
      );

      clearInterval(interval);
    };
  }, []);

  /* -------------------------------------------------------
     TOAST
  ------------------------------------------------------- */

  const notify = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  /* -------------------------------------------------------
     WORKER VERIFICATION
  ------------------------------------------------------- */

  const updateWorker = async (
    worker,
    status,
  ) => {
    try {
      await updateWorkerVerification(
        worker.id,
        status,
        "Admin decision",
      );
    } catch (error) {
      console.warn(
        "Backend verification update unavailable.",
        error,
      );
    }

    const updatedWorkers = workers.map(
      (item) =>
        item.id === worker.id
          ? {
              ...item,
              verificationStatus: status,
              verifiedAt:
                status === "verified"
                  ? new Date().toISOString()
                  : null,
            }
          : item,
    );

    setWorkers(updatedWorkers);

    write(
      "ss_registered_workers",
      updatedWorkers,
    );

    /*
      Keep the single-worker profile synchronized too.
    */

    const profile = read(
      "ss_worker_profile",
      null,
    );

    if (
      profile &&
      (profile.id === worker.id ||
        profile.workerId === worker.id)
    ) {
      write(
        "ss_worker_profile",
        {
          ...profile,
          verificationStatus: status,
          verifiedAt:
            status === "verified"
              ? new Date().toISOString()
              : null,
        },
      );
    }

    emit();

    setSelected(null);

    notify(
      status === "verified"
        ? "KYC approved successfully"
        : "Worker rejected",
    );
  };

  /* -------------------------------------------------------
     SUSPEND WORKER
  ------------------------------------------------------- */

  const suspend = async (worker) => {
    try {
      await toggleWorkerSuspension(
        worker.id,
      );
    } catch (error) {
      console.warn(
        "Backend suspension update unavailable.",
        error,
      );
    }

    const updatedWorkers = workers.map(
      (item) =>
        item.id === worker.id
          ? {
              ...item,
              suspended: !item.suspended,
              online: item.suspended
                ? item.online
                : false,
            }
          : item,
    );

    setWorkers(updatedWorkers);

    write(
      "ss_registered_workers",
      updatedWorkers,
    );

    emit();

    notify(
      worker.suspended
        ? "Worker activated"
        : "Worker suspended",
    );
  };

  /* -------------------------------------------------------
     BOOKING STATUS
  ------------------------------------------------------- */

  const changeBooking = async (
    booking,
    status,
  ) => {
    const bookingId =
      booking.id ||
      booking.bookingId;

    try {
      await updateAdminBookingStatus(
        bookingId,
        status,
      );
    } catch (error) {
      console.warn(
        "Backend booking update unavailable.",
        error,
      );
    }

    const updatedBookings =
      bookings.map((item) =>
        (item.id ||
          item.bookingId) === bookingId
          ? {
              ...item,
              status,
            }
          : item,
      );

    setBookings(updatedBookings);

    write(
      "ss_admin_bookings",
      updatedBookings,
    );

    emit();

    setSelected(null);

    notify("Booking status updated");
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-slate-700"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading ShramSetu Admin...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <AdminSidebar
        activeTab={tab}
        setActiveTab={setTab}
        mobileOpen={mobile}
        setMobileOpen={setMobile}
      />

      <main className="lg:ml-[280px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
                onClick={() =>
                  setMobile(true)
                }
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
                  SHRAMSETU / ADMIN
                </p>

                <h1 className="text-xl font-black text-slate-950">
                  {
                    {
                      dashboard:
                        "Command Centre",
                      workers:
                        "Worker Management",
                      customers:
                        "Customer Management",
                      bookings:
                        "Booking Operations",
                      kyc:
                        "KYC Verification",
                      live:
                        "Live Workforce",
                      reports:
                        "Reports & Analytics",
                      ai:
                        "AI Business Intelligence",
                      cooperatives:
                        "Cooperative Network",
                      disputes:
                        "Dispute Resolution",
                      welfare:
                        "Worker Welfare",
                    }[tab]
                  }
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:block">
                Refresh
              </span>
            </button>
          </div>
        </header>

        {/* CONTENT */}

        <div className="p-4 sm:p-6 lg:p-8">
          {tab === "dashboard" && (
            <Home
              summary={summary}
              workers={workers}
              bookings={bookings}
              navigate={setTab}
            />
          )}

          {tab === "workers" && (
            <Workers
              workers={workers}
              search={search}
              setSearch={setSearch}
              onView={setSelected}
              onVerify={updateWorker}
              onSuspend={suspend}
            />
          )}

          {tab === "customers" && (
            <Customers
              customers={customers}
              search={search}
              setSearch={setSearch}
              onView={setSelected}
            />
          )}

          {tab === "bookings" && (
            <Bookings
              bookings={bookings}
              search={search}
              setSearch={setSearch}
              onView={setSelected}
            />
          )}

          {tab === "kyc" && (
            <KYC
              workers={workers}
              onView={setSelected}
              onVerify={updateWorker}
            />
          )}

          {tab === "live" && (
            <Live
              workers={workers}
            />
          )}

          {tab === "reports" && (
            <Reports
              bookings={bookings}
            />
          )}

          {tab === "ai" && (
            <AI
              bookings={bookings}
            />
          )}

          {tab === "cooperatives" && (
            <Coop
              workers={workers}
            />
          )}

          {tab === "disputes" && (
            <Disputes
              data={disputes}
              resolve={async (
                dispute,
              ) => {
                try {
                  await updateDispute(
                    dispute.id,
                    "resolved",
                  );
                } catch (error) {
                  console.warn(
                    "Backend dispute update unavailable.",
                    error,
                  );
                }

                setDisputes(
                  (items) =>
                    items.map(
                      (item) =>
                        item.id ===
                        dispute.id
                          ? {
                              ...item,
                              status:
                                "resolved",
                            }
                          : item,
                    ),
                );

                emit();

                notify(
                  "Dispute resolved",
                );
              }}
            />
          )}

          {tab === "welfare" && (
            <Welfare
              workers={workers}
            />
          )}
        </div>
      </main>

      {/* DETAILS MODAL */}

      {selected && (
        <Details
          item={selected}
          close={() =>
            setSelected(null)
          }
          verify={updateWorker}
          suspend={suspend}
          change={changeBooking}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[120] rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SHARED UI
========================================================= */

const Card = ({
  children,
  className = "",
}) => (
  <div
    className={`rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,.05)] ${className}`}
  >
    {children}
  </div>
);

const Stat = ({
  title,
  value,
  sub,
  icon: Icon,
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {sub}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-950 p-3 text-white">
        <Icon size={18} />
      </div>
    </div>
  </Card>
);

const Title = ({
  k,
  t,
  d,
}) => (
  <div className="mb-5">
    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
      {k}
    </p>

    <h2 className="mt-1 text-2xl font-black text-slate-950">
      {t}
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {d}
    </p>
  </div>
);

const SearchBox = ({
  value,
  onChange,
  placeholder,
}) => (
  <div className="relative flex-1">
    <Search
      size={17}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    />
  </div>
);

/* =========================================================
   DASHBOARD HOME
========================================================= */

function Home({
  summary,
  workers,
  bookings,
  navigate,
}) {
  const onlineWorkers =
    workers.filter(
      (worker) =>
        worker.online &&
        worker.verificationStatus ===
          "verified" &&
        !worker.suspended,
    ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-slate-950 p-7 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
          Operations overview
        </p>

        <h2 className="mt-3 max-w-3xl text-3xl font-black">
          Know what is happening across
          ShramSetu.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Verification, workforce visibility,
          marketplace performance and
          cooperative economics in one
          command layer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Marketplace GMV"
          value={INR(summary.revenue)}
          sub="Illustrative marketplace volume"
          icon={IndianRupee}
        />

        <Stat
          title="Worker earnings"
          value={INR(
            summary.workerEarnings,
          )}
          sub="Completed payout estimate"
          icon={WalletCards}
        />

        <Stat
          title="Verified workers"
          value={
            summary.verifiedWorkers || 0
          }
          sub={`${summary.totalWorkers || 0} registered`}
          icon={Users}
        />

        <Stat
          title="Pending KYC"
          value={
            summary.pendingKYC || 0
          }
          sub="Needs cooperative review"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <Title
            k="Quick actions"
            t="Move to the decision that matters"
            d="Jump directly into the highest-value operational modules."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                ShieldCheck,
                "Review KYC",
                "kyc",
              ],
              [
                MapPinned,
                "Live workforce",
                "live",
              ],
              [
                BarChart3,
                "Reports",
                "reports",
              ],
              [
                Sparkles,
                "AI intelligence",
                "ai",
              ],
            ].map(
              ([Icon, name, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    navigate(id)
                  }
                  className="rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <Icon size={19} />

                  <p className="mt-3 font-bold">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Open interactive module
                  </p>
                </button>
              ),
            )}
          </div>
        </Card>

        <Card className="p-6">
          <Title
            k="Live signal"
            t="Workforce pulse"
            d="Current operational indicators."
          />

          <div className="space-y-3">
            <Pulse
              label="Online verified workers"
              value={onlineWorkers}
              icon={MapPinned}
            />

            <Pulse
              label="Active bookings"
              value={
                summary.activeBookings ||
                0
              }
              icon={ClipboardList}
            />

            <Pulse
              label="Completed services"
              value={
                summary.completedBookings ||
                0
              }
              icon={CheckCircle2}
            />

            <Pulse
              label="Open disputes"
              value={
                summary.openDisputes ||
                0
              }
              icon={AlertTriangle}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Pulse({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="rounded-xl bg-white p-2.5 shadow-sm">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="font-black">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   WORKERS
========================================================= */

function Workers({
  workers,
  search,
  setSearch,
  onView,
  onVerify,
  onSuspend,
}) {
  const filtered =
    workers.filter(
      (worker) =>
        !search ||
        `${worker.name} ${worker.skill} ${worker.city} ${worker.id}`
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (
    <>
      <Title
        k="Workforce"
        t="Worker management"
        d="KYC, banking, daily earnings and workforce status."
      />

      <div className="mb-5 flex gap-3">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search worker, skill, city or ID..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Worker",
                  "Skill",
                  "Location",
                  "Today",
                  "Bank",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    className="px-5 py-4"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map(
                (worker) => (
                  <tr
                    key={worker.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <b>
                        {worker.name}
                      </b>

                      <p className="text-xs text-slate-400">
                        {worker.id} · ★{" "}
                        {worker.rating}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {worker.skill ||
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      {worker.city ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 font-black">
                      {INR(
                        worker.todayEarnings,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <b>
                        {worker.accountHolder ||
                          worker.name}
                      </b>

                      <p className="text-xs text-slate-400">
                        {worker.accountNumber ||
                          "•••• ••••"}
                        {" · "}
                        {worker.ifsc ||
                          "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize">
                        {worker.verificationStatus}
                      </span>

                      {worker.suspended && (
                        <span className="ml-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
                          SUSPENDED
                        </span>
                      )}

                      {worker.online &&
                        !worker.suspended && (
                          <span className="ml-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                            ONLINE
                          </span>
                        )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView(worker)
                        }
                        className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200"
                        title="View worker"
                      >
                        <Eye size={15} />
                      </button>

                      {worker.verificationStatus ===
                        "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            onVerify(
                              worker,
                              "verified",
                            )
                          }
                          className="ml-1 rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                          title="Approve"
                        >
                          <CheckCircle2
                            size={15}
                          />
                        </button>
                      )}

                      {worker.verificationStatus ===
                        "verified" && (
                        <button
                          type="button"
                          onClick={() =>
                            onSuspend(
                              worker,
                            )
                          }
                          className="ml-1 rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                          title={
                            worker.suspended
                              ? "Activate"
                              : "Suspend"
                          }
                        >
                          <Ban
                            size={15}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {!filtered.length && (
            <Empty text="No workers match your search." />
          )}
        </div>
      </Card>
    </>
  );
}

/* =========================================================
   CUSTOMERS
========================================================= */

function Customers({
  customers,
  search,
  setSearch,
  onView,
}) {
  const filtered =
    customers.filter(
      (customer) =>
        !search ||
        `${customer.name || ""} ${
          customer.email || ""
        } ${
          customer.phone || ""
        }`
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (
    <>
      <Title
        k="Marketplace"
        t="Customer management"
        d="Customer accounts and booking footprint."
      />

      <div className="mb-5">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search customer..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(
          (customer) => (
            <Card
              className="p-5"
              key={
                customer.id ||
                customer.email
              }
            >
              <div className="flex items-center justify-between gap-3">
                <b>
                  {customer.name ||
                    "Customer"}
                </b>

                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  {customer.status ||
                    "active"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {customer.email ||
                  "—"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Mini
                  l="Bookings"
                  v={
                    customer.bookingsCount ||
                    0
                  }
                />

                <Mini
                  l="Location"
                  v={
                    customer.city ||
                    "—"
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onView(customer)
                }
                className="mt-4 w-full rounded-xl border py-2 text-sm font-bold hover:bg-slate-50"
              >
                View profile
              </button>
            </Card>
          ),
        )}
      </div>

      {!filtered.length && (
        <Empty text="No customers found." />
      )}
    </>
  );
}

/* =========================================================
   BOOKINGS
========================================================= */

function Bookings({
  bookings,
  search,
  setSearch,
  onView,
}) {
  const filtered =
    bookings.filter(
      (booking) =>
        !search ||
        `${booking.id || ""} ${
          booking.customerName || ""
        } ${
          booking.workerName || ""
        } ${
          booking.service || ""
        }`
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (
    <>
      <Title
        k="Operations"
        t="Booking management"
        d="Track every service from request to completion."
      />

      <div className="mb-5">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search booking, customer, worker..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Booking",
                  "Customer",
                  "Worker",
                  "Service",
                  "Amount",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    className="px-5 py-4"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map(
                (booking) => (
                  <tr
                    key={
                      booking.id
                    }
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-bold">
                      #
                      {
                        booking.id
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        booking.customerName ||
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        booking.workerName ||
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        booking.service ||
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {INR(
                        booking.amount ||
                          booking.totalAmount,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                        {
                          booking.status
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            booking,
                          )
                        }
                        className="rounded-xl bg-slate-100 p-2"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {!filtered.length && (
            <Empty text="No bookings found." />
          )}
        </div>
      </Card>
    </>
  );
}

/* =========================================================
   KYC
========================================================= */

function KYC({
  workers,
  onView,
  onVerify,
}) {
  const pending =
    workers.filter(
      (worker) =>
        worker.verificationStatus ===
        "pending",
    );

  return (
    <>
      <Title
        k="Governance"
        t="KYC verification queue"
        d={`${pending.length} worker applications require cooperative approval.`}
      />

      {pending.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.map(
            (worker) => (
              <Card
                className="p-5"
                key={worker.id}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <b className="text-lg">
                      {worker.name}
                    </b>

                    <p className="text-sm text-slate-500">
                      {worker.skill ||
                        "Service worker"}{" "}
                      ·{" "}
                      {worker.experience ||
                        0}{" "}
                      years ·{" "}
                      {worker.city ||
                        "—"}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Request ID:{" "}
                      {worker.kycRequestId ||
                        worker.id}
                    </p>
                  </div>

                  <ShieldCheck className="text-amber-500" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Mini
                    l="Aadhaar"
                    v="•••• •••• ••••"
                  />

                  <Mini
                    l="Address proof"
                    v={
                      worker.addressProof ||
                      "Submitted"
                    }
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onView(worker)
                    }
                    className="flex-1 rounded-xl border py-2.5 text-sm font-bold hover:bg-slate-50"
                  >
                    Review
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onVerify(
                        worker,
                        "verified",
                      )
                    }
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onVerify(
                        worker,
                        "rejected",
                      )
                    }
                    className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </Card>
            ),
          )}
        </div>
      ) : (
        <Empty text="All verification requests are cleared." />
      )}
    </>
  );
}

/* =========================================================
   LIVE WORKERS
========================================================= */

function Live({
  workers,
}) {
  const live =
    workers.filter(
      (worker) =>
        worker.online &&
        worker.verificationStatus ===
          "verified" &&
        !worker.suspended,
    );

  return (
    <>
      <Title
        k="Live workforce"
        t="Active workers map"
        d="Prototype job-scoped location view. Production should stream GPS only while a worker is active on a job."
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
        <Card className="relative h-[540px] overflow-hidden bg-[#e9efe9]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize:
                "44px 44px",
            }}
          />

          <div className="absolute left-[45%] top-[30%] text-xs font-black text-slate-500">
            C-SCHEME
          </div>

          <div className="absolute left-[62%] top-[55%] text-xs font-black text-slate-500">
            MALVIYA NAGAR
          </div>

          <div className="absolute left-[30%] top-[65%] text-xs font-black text-slate-500">
            MANSAROVAR
          </div>

          {live.map(
            (worker, index) => (
              <div
                key={worker.id}
                className="absolute"
                style={{
                  left: `${25 + index * 28}%`,
                  top: `${25 + index * 25}%`,
                }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-white shadow-xl">
                  <Navigation
                    size={18}
                  />
                </div>

                <div className="mt-1 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">
                  {
                    worker.name
                  }
                </div>
              </div>
            ),
          )}

          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 p-3 text-xs shadow">
            <b>
              {live.length}{" "}
              workers online
            </b>

            <p className="text-slate-500">
              Live active workforce
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <Title
            k="Live now"
            t="Worker status"
            d="Verified active workforce."
          />

          {live.map(
            (worker) => (
              <div
                key={worker.id}
                className="mb-3 rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <b>
                    {worker.name}
                  </b>

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>

                <p className="text-xs text-slate-500">
                  {worker.skill ||
                    "Worker"}{" "}
                  ·{" "}
                  {worker.currentJob ||
                    "Available"}
                </p>

                <p className="mt-1 text-xs font-bold text-emerald-600">
                  ONLINE
                </p>
              </div>
            ),
          )}

          {!live.length && (
            <Empty text="No verified workers online." />
          )}
        </Card>
      </div>
    </>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports({
  bookings,
}) {
  const service = {};

  bookings.forEach(
    (booking) => {
      const name =
        booking.service ||
        "Other";

      service[name] =
        (service[name] || 0) +
        1;
    },
  );

  const top =
    Object.entries(
      service,
    ).sort(
      (a, b) =>
        b[1] - a[1],
    );

  return (
    <>
      <Title
        k="Decision intelligence"
        t="Reports & analytics"
        d="Demand, earning potential, coverage and peak-time intelligence."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          title="Top zone"
          value={zones[0][0]}
          sub="Highest opportunity score"
          icon={Target}
        />

        <Stat
          title="Peak time"
          value="6–8 PM"
          sub="Highest demand intensity"
          icon={Clock3}
        />

        <Stat
          title="Utilization"
          value="78%"
          sub="Illustrative KPI"
          icon={Gauge}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <Card className="p-6">
          <Title
            k="Spatial demand"
            t="Opportunity heat map"
            d="Illustrative zone-level opportunity score."
          />

          <div className="relative h-[430px] overflow-hidden rounded-3xl bg-[#edf1ed]">
            {zones.map(
              (zone) => (
                <div
                  key={zone[0]}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{
                    left: `${zone[4]}%`,
                    top: `${zone[5]}%`,
                  }}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white font-black text-white shadow-xl ${
                      zone[1] > 85
                        ? "bg-rose-600"
                        : zone[1] > 75
                          ? "bg-orange-500"
                          : "bg-amber-400"
                    }`}
                  >
                    {zone[1]}
                  </div>

                  <p className="mt-1 rounded bg-white/90 px-2 py-1 text-[10px] font-black">
                    {zone[0]}
                  </p>
                </div>
              ),
            )}
          </div>
        </Card>

        <Card className="p-6">
          <Title
            k="Zone ranking"
            t="Most worth-it areas"
            d="Demand + earning potential indicator."
          />

          {zones.map(
            (zone, index) => (
              <div
                key={zone[0]}
                className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <div>
                  <b>
                    {index + 1}.{" "}
                    {zone[0]}
                  </b>

                  <p className="text-xs text-slate-500">
                    {zone[1]}% demand ·{" "}
                    {zone[3]} workers
                  </p>
                </div>

                <b>
                  {INR(zone[2])}
                </b>
              </div>
            ),
          )}
        </Card>
      </div>

      <Card className="mt-5 p-6">
        <Title
          k="Service mix"
          t="Most demanded services"
          d="Based on current prototype booking records."
        />

        {top.length ? (
          top
            .slice(0, 6)
            .map(
              ([name, count]) => (
                <div
                  key={name}
                  className="mb-4"
                >
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {name}
                    </span>

                    <b>
                      {count}
                    </b>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{
                        width: `${
                          (count /
                            (top[0]?.[1] ||
                              1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )
        ) : (
          <Empty text="No service demand data available." />
        )}
      </Card>
    </>
  );
}

/* =========================================================
   AI BUSINESS INTELLIGENCE
========================================================= */

function AI({
  bookings,
}) {
  const rules = read(
    "ss_admin_financial_rules",
    {
      worker: 90,
      cooperative: 5,
      platform: 5,
      operatingCost: 2,
    },
  );

  const gmv =
    bookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.amount ||
            booking.totalAmount ||
            0,
        ),
      0,
    ) || 6150;

  const worker =
    (gmv * rules.worker) /
    100;

  const cooperative =
    (gmv * rules.cooperative) /
    100;

  const platform =
    (gmv * rules.platform) /
    100;

  const operatingCost =
    (gmv * rules.operatingCost) /
    100;

  const profit =
    platform - operatingCost;

  const margin =
    platform > 0
      ? (profit / platform) *
        100
      : 0;

  return (
    <>
      <div className="rounded-[30px] bg-gradient-to-br from-slate-950 to-slate-800 p-7 text-white shadow-xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-slate-500">
          <Sparkles size={15} />

          AI business intelligence
        </p>

        <h2 className="mt-3 text-3xl font-black">
          Grow without breaking the
          cooperative promise.
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Transparent revenue
          distribution, operating cost
          and profit intelligence.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat
          title="GMV"
          value={INR(gmv)}
          sub="Prototype marketplace volume"
          icon={IndianRupee}
        />

        <Stat
          title="Worker share"
          value={`${rules.worker}%`}
          sub={INR(worker)}
          icon={Users}
        />

        <Stat
          title="Cooperative"
          value={`${rules.cooperative}%`}
          sub={INR(cooperative)}
          icon={Building2}
        />

        <Stat
          title="Platform"
          value={`${rules.platform}%`}
          sub={INR(platform)}
          icon={WalletCards}
        />

        <Stat
          title="Profit margin"
          value={`${Math.round(
            margin,
          )}%`}
          sub={`${INR(
            profit,
          )} operating profit`}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <Title
            k="Economics"
            t="Where ₹100 goes"
            d="Configured prototype revenue distribution."
          />

          <Split
            label="Worker"
            percentage={
              rules.worker
            }
          />

          <Split
            label="Cooperative"
            percentage={
              rules.cooperative
            }
          />

          <Split
            label="ShramSetu platform"
            percentage={
              rules.platform
            }
          />

          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            Illustrative commercial
            policy. Replace with the
            cooperative-approved financial
            rules before production.
          </div>
        </Card>

        <Card className="p-6">
          <Title
            k="AI recommendations"
            t="Next best actions"
            d="Operational recommendations generated from prototype signals."
          />

          <Advice
            title="Prioritize Malviya Nagar during peak demand"
            description="Increase verified worker coverage where demand and earning potential are highest."
          />

          <Advice
            title="Protect the 6–8 PM window"
            description="Use scheduled 2-hour slots to improve fulfilment during peak demand."
          />

          <Advice
            title="Track platform profit separately"
            description="Keep worker, cooperative and platform economics transparent."
          />

          <Advice
            title="Improve high-value zone coverage"
            description="Move available workers toward zones with strong demand and lower worker coverage."
          />
        </Card>
      </div>
    </>
  );
}

function Split({
  label,
  percentage,
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>
          {label}
        </span>

        <span>
          {percentage}%
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                percentage,
              ),
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function Advice({
  title,
  description,
}) {
  return (
    <div className="mb-3 rounded-2xl bg-slate-50 p-4">
      <b className="text-sm">
        {title}
      </b>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   COOPERATIVE
========================================================= */

function Coop({
  workers,
}) {
  const cooperativeMap = {};

  workers.forEach(
    (worker) => {
      const name =
        worker.cooperative ||
        "ShramSetu Cooperative";

      cooperativeMap[name] =
        (cooperativeMap[name] ||
          0) + 1;
    },
  );

  return (
    <>
      <Title
        k="Governance"
        t="Cooperative network"
        d="Worker distribution across cooperative groups."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(
          cooperativeMap,
        ).map(
          ([name, count]) => (
            <Card
              className="p-6"
              key={name}
            >
              <Building2 size={22} />

              <h3 className="mt-4 font-black">
                {name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {count} workers
              </p>
            </Card>
          ),
        )}
      </div>
    </>
  );
}

/* =========================================================
   DISPUTES
========================================================= */

function Disputes({
  data,
  resolve,
}) {
  return (
    <>
      <Title
        k="Trust & safety"
        t="Dispute resolution"
        d="Review and resolve customer-worker issues."
      />

      <div className="space-y-3">
        {data.map(
          (dispute) => (
            <Card
              className="p-5"
              key={dispute.id}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <b>
                    {dispute.title ||
                      `Dispute #${dispute.id}`}
                  </b>

                  <p className="text-sm text-slate-500">
                    {dispute.description ||
                      "No description"}
                  </p>
                </div>

                {dispute.status !==
                  "resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      resolve(
                        dispute,
                      )
                    }
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </Card>
          ),
        )}

        {!data.length && (
          <Empty text="No disputes recorded." />
        )}
      </div>
    </>
  );
}

/* =========================================================
   WELFARE
========================================================= */

function Welfare({
  workers,
}) {
  const verified =
    workers.filter(
      (worker) =>
        worker.verificationStatus ===
        "verified",
    ).length;

  return (
    <>
      <Title
        k="Worker welfare"
        t="Welfare & protection"
        d="Prototype cooperative benefit coverage."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          title="Eligible workers"
          value={verified}
          sub="Verified workforce"
          icon={HeartPulse}
        />

        <Stat
          title="Insurance"
          value="Active"
          sub="Illustrative policy"
          icon={ShieldCheck}
        />

        <Stat
          title="Emergency support"
          value="Available"
          sub="Cooperative layer"
          icon={AlertTriangle}
        />
      </div>
    </>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Mini({
  l,
  v,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] uppercase text-slate-400">
        {l}
      </p>

      <p className="mt-1 truncate text-sm font-bold">
        {v}
      </p>
    </div>
  );
}

function Empty({
  text,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function Details({
  item,
  close,
  verify,
  suspend,
  change,
}) {
  const isWorker =
    Boolean(item.skill) ||
    Boolean(
      item.verificationStatus,
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={close}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-xl p-2 hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {isWorker ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Worker profile
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {item.name}
            </h2>

            <p className="text-sm text-slate-500">
              {item.id} ·{" "}
              {item.skill ||
                "Service Worker"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini
                l="Experience"
                v={`${item.experience || 0} years`}
              />

              <Mini
                l="Rating"
                v={`★ ${
                  item.rating ||
                  4.7
                }`}
              />

              <Mini
                l="Bank"
                v={
                  item.accountNumber ||
                  "•••• ••••"
                }
              />

              <Mini
                l="Today"
                v={INR(
                  item.todayEarnings,
                )}
              />

              <Mini
                l="IFSC"
                v={
                  item.ifsc ||
                  "—"
                }
              />

              <Mini
                l="Account holder"
                v={
                  item.accountHolder ||
                  item.name
                }
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Mini
                l="Verification"
                v={
                  item.verificationStatus
                }
              />

              <Mini
                l="Location"
                v={
                  item.city ||
                  "—"
                }
              />
            </div>

            {item.verificationStatus ===
              "pending" && (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    verify(
                      item,
                      "verified",
                    )
                  }
                  className="flex-1 rounded-xl bg-slate-950 py-3 font-bold text-white"
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() =>
                    verify(
                      item,
                      "rejected",
                    )
                  }
                  className="flex-1 rounded-xl bg-rose-50 py-3 font-bold text-rose-700"
                >
                  Reject
                </button>
              </div>
            )}

            {item.verificationStatus ===
              "verified" && (
              <button
                type="button"
                onClick={() =>
                  suspend(item)
                }
                className="mt-3 w-full rounded-xl border border-rose-200 py-3 font-bold text-rose-700 hover:bg-rose-50"
              >
                {item.suspended
                  ? "Activate Worker"
                  : "Suspend Worker"}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Record details
            </p>

            <h2 className="mt-1 text-2xl font-black">
              #
              {item.id ||
                item.bookingId ||
                "Record"}
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                [
                  "Customer",
                  item.customerName ||
                    item.name,
                ],

                [
                  "Worker",
                  item.workerName,
                ],

                [
                  "Service",
                  item.service,
                ],

                [
                  "Amount",
                  INR(
                    item.amount ||
                      item.totalAmount,
                  ),
                ],

                [
                  "Status",
                  item.status,
                ],

                [
                  "Email",
                  item.email,
                ],

                [
                  "Phone",
                  item.phone,
                ],

                [
                  "Location",
                  item.zone ||
                    item.city,
                ],
              ].map(
                ([label, value]) => (
                  <Mini
                    key={label}
                    l={label}
                    v={
                      value ||
                      "—"
                    }
                  />
                ),
              )}
            </div>

            {item.status && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Update status
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Confirmed",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                  ].map(
                    (status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() =>
                          change(
                            item,
                            status,
                          )
                        }
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          item.status ===
                          status
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}