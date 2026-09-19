import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Pencil,
  Check,
  X,
  Lock,
  Bell,
  CreditCard,
  ClipboardList,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "../data/mockauth";
import { useNavigate } from "react-router-dom";

export default function CustomerProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [saved, setSaved] = useState(false);

  /* =====================================================
     LOAD CUSTOMER ACCOUNT
  ===================================================== */

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser) {
      setUser(currentUser);

      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });
    }
  }, []);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    localStorage.setItem("ss_auth", JSON.stringify(updatedUser));

    setUser(updatedUser);
    setFormData({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });

    setEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const cancelEdit = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setEditing(false);
  };

  /* =====================================================
     MEMBER SINCE
  ===================================================== */

  const memberSince = user?.signupTime
    ? new Date(user.signupTime).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "September 2026";

  /* =====================================================
     LOADING
  ===================================================== */

  if (!user) {
    return (
      <div className="container-app py-8">
        <div className="card flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-navy-400">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 pb-28">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-500 text-white">
            <User size={22} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">
                My Profile
              </h1>

              <span className="rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
                CUSTOMER
              </span>

            </div>

            <p className="mt-1 text-sm text-navy-400">
              Manage your ShramSetu customer account.
            </p>

          </div>

        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-navy-600"
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        )}

      </div>

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="mt-8 overflow-hidden rounded-3xl bg-navy-700 shadow-card">

        <div className="relative overflow-hidden p-6 sm:p-8">

          {/* Decorative elements */}

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />

          <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full border border-white/5" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Avatar */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-coop-500 text-3xl font-bold text-white shadow-lg">

              {user.name?.charAt(0)?.toUpperCase() || "C"}

            </div>

            {/* Customer information */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="font-display text-2xl font-bold text-white">
                  {user.name || "Customer"}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-coop-400/15 px-2.5 py-1 text-[10px] font-bold text-coop-300">
                  <ShieldCheck size={12} />
                  Verified Account
                </span>

              </div>

              <div className="mt-3 flex flex-col gap-2 text-xs text-navy-100 sm:flex-row sm:flex-wrap sm:gap-x-5">

                <span className="flex items-center gap-2">
                  <Mail size={14} />
                  {user.email || "No email added"}
                </span>

                <span className="flex items-center gap-2">
                  <Phone size={14} />
                  {user.phone || "No phone added"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  Member since {memberSince}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          EDIT PROFILE
      ===================================================== */}

      {editing && (

        <section className="mt-8 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm">

          <div className="border-b border-navy-100 bg-navy-50/40 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy-600 shadow-sm">
                <Pencil size={18} />
              </div>

              <div>

                <h2 className="font-display font-bold text-navy-700">
                  Edit Account Information
                </h2>

                <p className="mt-1 text-xs text-navy-400">
                  Update the information associated with your customer account.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            {/* NAME */}

            <div>

              <label className="mb-2 block text-xs font-bold text-navy-600">
                Full Name
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-slate-50 px-3">

                <User
                  size={16}
                  className="text-navy-300"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent px-1 py-3 text-sm text-navy-700 outline-none"
                  placeholder="Enter your name"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-xs font-bold text-navy-600">
                Email Address
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-slate-50 px-3">

                <Mail
                  size={16}
                  className="text-navy-300"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent px-1 py-3 text-sm text-navy-700 outline-none"
                  placeholder="Enter your email"
                />

              </div>

            </div>

            {/* PHONE */}

            <div>

              <label className="mb-2 block text-xs font-bold text-navy-600">
                Phone Number
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-slate-50 px-3">

                <Phone
                  size={16}
                  className="text-navy-300"
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent px-1 py-3 text-sm text-navy-700 outline-none"
                  placeholder="Enter your phone number"
                />

              </div>

            </div>

            {/* ACCOUNT TYPE */}

            <div>

              <label className="mb-2 block text-xs font-bold text-navy-600">
                Account Type
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-slate-50 px-3 py-3">

                <ShieldCheck
                  size={16}
                  className="text-coop-600"
                />

                <span className="text-sm font-semibold text-navy-700">
                  Customer
                </span>

                <span className="ml-auto rounded-full bg-coop-50 px-2 py-1 text-[10px] font-bold text-coop-700">
                  VERIFIED
                </span>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-2 border-t border-navy-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-100 bg-white px-5 py-2.5 text-xs font-bold text-navy-600 transition hover:bg-navy-50"
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="button"
              onClick={saveProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-coop-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-coop-600"
            >
              <Check size={14} />
              Save Changes
            </button>

          </div>

        </section>

      )}

      {/* =====================================================
          ACCOUNT INFORMATION
      ===================================================== */}

      {!editing && (

        <section className="mt-8 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm">

          <div className="border-b border-navy-100 bg-navy-50/40 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy-600 shadow-sm">
                <User size={18} />
              </div>

              <div>

                <h2 className="font-display font-bold text-navy-700">
                  Account Information
                </h2>

                <p className="mt-1 text-xs text-navy-400">
                  Your basic ShramSetu account details.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-px bg-navy-100 sm:grid-cols-2">

            <ProfileInfo
              icon={User}
              label="Full Name"
              value={user.name || "Not provided"}
            />

            <ProfileInfo
              icon={Mail}
              label="Email Address"
              value={user.email || "Not provided"}
              verified
            />

            <ProfileInfo
              icon={Phone}
              label="Phone Number"
              value={user.phone || "Not provided"}
              verified
            />

            <ProfileInfo
              icon={ShieldCheck}
              label="Account Type"
              value="Customer"
            />

            <ProfileInfo
              icon={CalendarDays}
              label="Member Since"
              value={memberSince}
            />

            <ProfileInfo
              icon={Lock}
              label="Account Security"
              value="Protected"
              verified
            />

          </div>

        </section>

      )}

      {/* =====================================================
          ACCOUNT OVERVIEW
      ===================================================== */}

      <section className="mt-8">

        <div className="mb-4">

          <h2 className="font-display text-xl font-bold text-navy-700">
            Account Overview
          </h2>

          <p className="mt-1 text-xs text-navy-400">
            Your ShramSetu customer activity at a glance.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <OverviewCard
            icon={ClipboardList}
            title="My Bookings"
            value="View"
            description="Track your service requests"
            onClick={() => navigate("/dashboard/bookings")}
          />

          <OverviewCard
            icon={Heart}
            title="Saved Workers"
            value="Manage"
            description="Your preferred workers"
            onClick={() => navigate("/saved-workers")}
          />

          <OverviewCard
            icon={Sparkles}
            title="AI Insights"
            value="Explore"
            description="Understand your home problems"
            onClick={() => navigate("/ai-insights")}
          />

          <OverviewCard
            icon={Bell}
            title="Preferences"
            value="Manage"
            description="Notifications & privacy"
            onClick={() => navigate("/settings")}
          />

        </div>

      </section>

      {/* =====================================================
          SECURITY STRIP
      ===================================================== */}

      <section className="mt-8 rounded-3xl border border-coop-100 bg-coop-50/60 p-5 sm:p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-coop-600 shadow-sm">
            <ShieldCheck size={20} />
          </div>

          <div>

            <p className="font-display font-bold text-navy-700">
              Your account is protected
            </p>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-navy-500">
              ShramSetu uses your account information to manage bookings,
              connect you with verified service workers and provide
              personalized service recommendations.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          SAVED MESSAGE
      ===================================================== */}

      {saved && (

        <div className="fixed bottom-6 left-1/2 z-[3000] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-xs font-bold text-white shadow-xl">

          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-coop-500">
            <Check size={13} />
          </div>

          Profile updated successfully

        </div>

      )}

    </div>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({
  icon: Icon,
  label,
  value,
  verified = false,
}) {
  return (
    <div className="bg-white p-5 sm:p-6">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500">
          <Icon size={16} />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-wide text-navy-300">
            {label}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">

            <p className="truncate text-sm font-bold text-navy-700">
              {value}
            </p>

            {verified && (
              <span className="rounded-full bg-coop-50 px-2 py-0.5 text-[9px] font-bold text-coop-700">
                Verified
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  icon: Icon,
  title,
  value,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition group-hover:bg-coop-50 group-hover:text-coop-600">
          <Icon size={18} />
        </div>

        <ChevronRight
          size={16}
          className="text-navy-200 transition group-hover:translate-x-0.5 group-hover:text-coop-500"
        />

      </div>

      <p className="mt-4 text-xs font-semibold text-navy-400">
        {title}
      </p>

      <p className="mt-1 font-display text-lg font-bold text-navy-700">
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-navy-300">
        {description}
      </p>

    </button>
  );
}