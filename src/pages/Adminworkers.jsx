import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";

import AdminSidebar from "../components/Adminsidebar";

export default function AdminWorkers() {

  const [worker, setWorker] = useState(null);
  const [status, setStatus] = useState("none");

  useEffect(() => {

    const savedProfile = localStorage.getItem(
      "ss_worker_profile"
    );

    if (savedProfile) {

      try {

        const profile = JSON.parse(savedProfile);

        setWorker(profile);
        setStatus(profile.verificationStatus || "pending");

      } catch {
        setWorker(null);
      }

    }

  }, []);

  const updateVerification = (newStatus) => {

    if (!worker) return;

    const updatedWorker = {
      ...worker,
      verificationStatus: newStatus,
      verifiedAt:
        newStatus === "verified"
          ? new Date().toISOString()
          : null,
    };

    localStorage.setItem(
      "ss_worker_profile",
      JSON.stringify(updatedWorker)
    );

    setWorker(updatedWorker);
    setStatus(newStatus);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex">

      <AdminSidebar />

      <main className="flex-1 min-w-0">

        {/* HEADER */}

        <header className="bg-white border-b border-navy-100 px-8 py-5">

          <p className="text-sm text-navy-400">
            Cooperative Administration
          </p>

          <h1 className="font-display font-extrabold text-2xl text-navy-700">
            Worker Verification
          </h1>

        </header>

        <div className="p-8">

          {!worker ? (

            <div className="bg-white border border-navy-100 rounded-2xl p-10 text-center">

              <ShieldCheck
                size={40}
                className="mx-auto text-navy-200"
              />

              <h2 className="font-display font-bold text-lg text-navy-700 mt-4">
                No verification requests
              </h2>

              <p className="text-sm text-navy-400 mt-2">
                Worker verification requests will appear here
                after workers submit their profiles.
              </p>

            </div>

          ) : (

            <div className="bg-white border border-navy-100 rounded-2xl overflow-hidden">

              {/* PROFILE HEADER */}

              <div className="p-6 border-b border-navy-100">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-xl bg-navy-700 text-white flex items-center justify-center">
                      <User size={24} />
                    </div>

                    <div>

                      <h2 className="font-display font-bold text-xl text-navy-700">
                        {worker.fullName || "Worker"}
                      </h2>

                      <p className="text-sm text-navy-400">
                        Worker Verification Request
                      </p>

                    </div>

                  </div>

                  <VerificationBadge status={status} />

                </div>

              </div>

              {/* DETAILS */}

              <div className="p-6 grid md:grid-cols-2 gap-5">

                <Info
                  icon={User}
                  label="Full Name"
                  value={worker.fullName}
                />

                <Info
                  icon={Phone}
                  label="Phone"
                  value={worker.phone}
                />

                <Info
                  icon={Briefcase}
                  label="Skill"
                  value={worker.skill}
                />

                <Info
                  icon={Briefcase}
                  label="Experience"
                  value={
                    worker.experience
                      ? `${worker.experience} years`
                      : "Not provided"
                  }
                />

                <Info
                  icon={MapPin}
                  label="City"
                  value={worker.city}
                />

                <Info
                  icon={MapPin}
                  label="Service Area"
                  value={worker.serviceArea}
                />

              </div>

              {/* DOCUMENTS */}

              <div className="p-6 border-t border-navy-100">

                <h3 className="font-display font-bold text-navy-700">
                  Submitted Verification Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mt-4">

                  <Document
                    label="Aadhaar"
                    value={
                      worker.aadhaar
                        ? `•••• •••• ${worker.aadhaar.slice(-4)}`
                        : "Not submitted"
                    }
                  />

                  <Document
                    label="Address Proof"
                    value={
                      worker.addressProof
                        ? "Submitted"
                        : "Not submitted"
                    }
                  />

                  <Document
                    label="Skill Certificate"
                    value={
                      worker.skillCertificate
                        ? "Submitted"
                        : "Not submitted"
                    }
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="p-6 bg-[#fafbfc] border-t border-navy-100">

                <div className="flex flex-col sm:flex-row gap-3">

                  <button
                    onClick={() =>
                      updateVerification("verified")
                    }
                    className="flex items-center justify-center gap-2 bg-coop-500 hover:bg-coop-600 text-white px-5 py-3 rounded-xl font-semibold text-sm"
                  >

                    <CheckCircle2 size={17} />

                    Approve Worker

                  </button>

                  <button
                    onClick={() =>
                      updateVerification("rejected")
                    }
                    className="flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-5 py-3 rounded-xl font-semibold text-sm"
                  >

                    <XCircle size={17} />

                    Reject Worker

                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {

  return (
    <div className="border border-navy-100 rounded-xl p-4">

      <div className="flex items-center gap-2 text-navy-400 text-xs">

        <Icon size={15} />

        {label}

      </div>

      <p className="font-semibold text-navy-700 text-sm mt-2">
        {value || "Not provided"}
      </p>

    </div>
  );
}

function Document({
  label,
  value,
}) {

  return (
    <div className="bg-navy-50 rounded-xl p-4">

      <p className="text-xs text-navy-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-navy-700 mt-1">
        {value}
      </p>

    </div>
  );
}

function VerificationBadge({
  status,
}) {

  if (status === "verified") {

    return (
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-coop-50 text-coop-700 text-xs font-bold">
        <CheckCircle2 size={15} />
        VERIFIED
      </span>
    );

  }

  if (status === "rejected") {

    return (
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-600 text-xs font-bold">
        <XCircle size={15} />
        REJECTED
      </span>
    );

  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-saffron-50 text-saffron-700 text-xs font-bold">
      <ShieldCheck size={15} />
      PENDING
    </span>
  );
}