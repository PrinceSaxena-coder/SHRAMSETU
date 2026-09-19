import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkerServiceHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  const loadHistory = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("ss_worker_service_history") || "[]"
      );
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleStorage = (event) => {
      if (event.key === "ss_worker_service_history") {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return history;

    return history.filter((job) =>
      [
        job.service,
        job.customer,
        job.location,
        job.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [history, search]);

  const totalEarnings = useMemo(
    () =>
      history.reduce(
        (sum, job) => sum + (Number(job.earning ?? job.amount) || 0),
        0
      ),
    [history]
  );

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                    Worker
                  </p>
                  <h1 className="text-2xl font-bold">Service History</h1>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                Completed services verified through the ShramSetu workflow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Completed
                </p>
                <p className="text-xl font-bold mt-1">{history.length}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Recorded earnings
                </p>
                <p className="text-xl font-bold mt-1">
                  ₹{totalEarnings.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative mb-5">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service, customer or location..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center">
              <BriefcaseBusiness size={25} className="text-slate-400" />
            </div>
            <h2 className="font-bold text-slate-800 mt-4">
              No completed services yet
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Once a service is completed through the customer QR verification,
              it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((job) => (
              <article
                key={`${job.id}-${job.completedAt || "completed"}`}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={23} className="text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">
                        {job.service || "Service"}
                      </h2>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        COMPLETED
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-1">
                      Customer: {job.customer || "Customer"}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {job.location || "Location unavailable"}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {formatDate(job.completedAt)}
                      </span>

                      {job.distance && (
                        <span className="flex items-center gap-1">
                          <Star size={13} />
                          {job.distance}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      Recorded earning
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-1 flex lg:justify-end items-center gap-1">
                      <IndianRupee size={17} />
                      {Number(job.earning ?? job.amount ?? 0).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Job ID: {job.id ?? "—"}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Customer QR completion verified
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
