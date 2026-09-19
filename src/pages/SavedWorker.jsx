import React, { useEffect, useState } from "react";
import {
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  BriefcaseBusiness,
  Phone,
  CalendarCheck,
  Trash2,
  Search,
  ArrowLeft,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SAVED_WORKERS_KEY = "ss_saved_workers";

export default function SavedWorkers() {
  const navigate = useNavigate();

  const [savedWorkers, setSavedWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  /* =====================================================
     LOAD SAVED WORKERS
  ===================================================== */

  useEffect(() => {
    loadSavedWorkers();
  }, []);

  const loadSavedWorkers = () => {
    try {
      const saved = localStorage.getItem(SAVED_WORKERS_KEY);

      if (!saved) {
        setSavedWorkers([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setSavedWorkers(parsed);
      } else {
        setSavedWorkers([]);
      }
    } catch (error) {
      console.error("Unable to load saved workers:", error);
      setSavedWorkers([]);
    }
  };

  /* =====================================================
     REMOVE WORKER
  ===================================================== */

  const removeWorker = (workerId) => {
    const updatedWorkers = savedWorkers.filter(
      (worker) => getWorkerId(worker) !== workerId
    );

    setSavedWorkers(updatedWorkers);

    localStorage.setItem(
      SAVED_WORKERS_KEY,
      JSON.stringify(updatedWorkers)
    );
  };

  /* =====================================================
     FILTER WORKERS
  ===================================================== */

  const filteredWorkers = savedWorkers.filter((worker) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      String(worker.name || "")
        .toLowerCase()
        .includes(query) ||
      String(worker.skill || worker.category || "")
        .toLowerCase()
        .includes(query) ||
      String(worker.service || "")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="container-app py-8 pb-28">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-500 shadow-sm transition hover:bg-navy-50"
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700 text-white">
            <Heart size={21} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">
                Saved Workers
              </h1>

              <span className="rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
                {savedWorkers.length} SAVED
              </span>

            </div>

            <p className="mt-1 text-sm text-navy-400">
              Keep your preferred ShramSetu workers within easy reach.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      {savedWorkers.length > 0 && (

        <div className="mt-7">

          <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 shadow-sm">

            <Search
              size={18}
              className="shrink-0 text-navy-300"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved workers..."
              className="w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-navy-300"
            />

          </div>

        </div>

      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {savedWorkers.length === 0 && (

        <section className="mt-8 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card">

          <div className="flex flex-col items-center px-6 py-14 text-center sm:px-10">

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-coop-50 text-coop-600">

              <Heart
                size={34}
                strokeWidth={1.7}
              />

            </div>

            <h2 className="mt-6 font-display text-xl font-bold text-navy-700">
              No saved workers yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-navy-400">
              When you find a worker you trust, save their profile so you
              can quickly book them again for future services.
            </p>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-xs font-bold text-white transition hover:bg-navy-600"
            >
              Browse Services
              <ChevronRight size={15} />
            </button>

          </div>

        </section>

      )}

      {/* =====================================================
          NO SEARCH RESULTS
      ===================================================== */}

      {savedWorkers.length > 0 && filteredWorkers.length === 0 && (

        <section className="mt-8 rounded-3xl border border-navy-100 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">

            <Search size={24} />

          </div>

          <h2 className="mt-4 font-display font-bold text-navy-700">
            No workers found
          </h2>

          <p className="mt-1 text-sm text-navy-400">
            Try searching with another worker name or service.
          </p>

        </section>

      )}

      {/* =====================================================
          WORKER LIST
      ===================================================== */}

      {filteredWorkers.length > 0 && (

        <div className="mt-8 grid gap-5 lg:grid-cols-2">

          {filteredWorkers.map((worker) => (

            <SavedWorkerCard
              key={getWorkerId(worker)}
              worker={worker}
              onRemove={() => removeWorker(getWorkerId(worker))}
              onBook={() => handleBookWorker(worker, navigate)}
            />

          ))}

        </div>

      )}

      {/* =====================================================
          INFORMATION STRIP
      ===================================================== */}

      {savedWorkers.length > 0 && (

        <section className="mt-8 rounded-3xl border border-coop-100 bg-coop-50/60 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-coop-600 shadow-sm">
              <ShieldCheck size={20} />
            </div>

            <div>

              <p className="font-display font-bold text-navy-700">
                Why save a worker?
              </p>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-navy-500">
                Your saved workers make repeat bookings faster. ShramSetu
                will continue to show verification, ratings, skills and
                availability before you request a service.
              </p>

            </div>

          </div>

        </section>

      )}

    </div>
  );
}

/* =========================================================
   SAVED WORKER CARD
========================================================= */

function SavedWorkerCard({
  worker,
  onRemove,
  onBook,
}) {
  const name = worker.name || "ShramSetu Worker";

  const skill =
    worker.skill ||
    worker.category ||
    worker.service ||
    "Home Service Professional";

  const rating =
    worker.rating !== undefined
      ? worker.rating
      : "4.8";

  const experience =
    worker.experience ||
    worker.experienceYears ||
    "Experienced";

  const distance =
    worker.distance ||
    worker.distanceKm ||
    "Nearby";

  const phone = worker.phone || worker.mobile;

  const image =
    worker.image ||
    worker.photo ||
    worker.avatar;

  return (
    <article className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">

      {/* =====================================================
          TOP SECTION
      ===================================================== */}

      <div className="p-5 sm:p-6">

        <div className="flex gap-4">

          {/* AVATAR */}

          {image ? (

            <img
              src={image}
              alt={name}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />

          ) : (

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-2xl font-bold text-navy-600">
              {name.charAt(0).toUpperCase()}
            </div>

          )}

          {/* BASIC INFO */}

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="truncate font-display text-lg font-bold text-navy-700">
                    {name}
                  </h2>

                  <ShieldCheck
                    size={16}
                    className="shrink-0 text-coop-600"
                  />

                </div>

                <p className="mt-1 text-xs font-semibold text-navy-400">
                  {skill}
                </p>

              </div>

              {/* REMOVE */}

              <button
                type="button"
                onClick={onRemove}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-navy-300 transition hover:bg-red-50 hover:text-red-500"
                title="Remove from saved workers"
                aria-label={`Remove ${name}`}
              >
                <Heart
                  size={18}
                  fill="currentColor"
                />
              </button>

            </div>

            {/* RATING */}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">

              <span className="inline-flex items-center gap-1 font-bold text-navy-700">

                <Star
                  size={14}
                  fill="currentColor"
                  className="text-amber-500"
                />

                {rating}

              </span>

              <span className="h-3 w-px bg-navy-100" />

              <span className="text-navy-400">
                {experience}
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            WORKER DETAILS
        ================================================= */}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <WorkerDetail
            icon={MapPin}
            label="Distance"
            value={distance}
          />

          <WorkerDetail
            icon={BriefcaseBusiness}
            label="Service"
            value={skill}
          />

          <WorkerDetail
            icon={ShieldCheck}
            label="Status"
            value="Verified"
            positive
          />

        </div>

      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="flex flex-col gap-2 border-t border-navy-100 bg-slate-50/60 p-4 sm:flex-row">

        <button
          type="button"
          onClick={onBook}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-3 text-xs font-bold text-white transition hover:bg-navy-600"
        >
          <CalendarCheck size={15} />
          Book This Worker
        </button>

        {phone && (

          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-3 text-xs font-bold text-navy-600 transition hover:bg-navy-50"
          >
            <Phone size={15} />
            Contact
          </a>

        )}

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-3 text-xs font-bold text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={15} />
          Remove
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   WORKER DETAIL
========================================================= */

function WorkerDetail({
  icon: Icon,
  label,
  value,
  positive = false,
}) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-3">

      <div className="flex items-center gap-2">

        <Icon
          size={14}
          className={
            positive
              ? "text-coop-600"
              : "text-navy-300"
          }
        />

        <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-300">
          {label}
        </span>

      </div>

      <p
        className={`mt-2 truncate text-xs font-bold ${
          positive
            ? "text-coop-700"
            : "text-navy-700"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   WORKER ID
========================================================= */

function getWorkerId(worker) {
  return (
    worker.id ||
    worker.workerId ||
    worker._id ||
    worker.email ||
    worker.phone ||
    worker.name
  );
}

/* =========================================================
   BOOK WORKER
========================================================= */

function handleBookWorker(worker, navigate) {
  const workerId = getWorkerId(worker);

  /*
   * Your existing Booking.jsx already supports selecting a
   * worker through a workerId query parameter.
   */

  if (workerId) {
    navigate(`/booking?workerId=${encodeURIComponent(workerId)}`);
  } else {
    navigate("/booking");
  }
}