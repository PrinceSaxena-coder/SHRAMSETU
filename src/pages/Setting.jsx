import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Globe2,
  MapPin,
  ShieldCheck,
  Lock,
  Smartphone,
  Mail,
  CreditCard,
  ChevronRight,
  Check,
  LogOut,
  Trash2,
  Sparkles,
  Navigation,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

import { getCurrentUser, logout } from "../data/mockauth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  /* =====================================================
     SETTINGS STATE
  ===================================================== */

  const [settings, setSettings] = useState({
    bookingNotifications: true,
    workerArrivalNotifications: true,
    paymentNotifications: true,
    aiRecommendations: true,
    locationServices: true,
    liveLocation: true,
    emailUpdates: true,
    smsUpdates: false,
    language: "English",
    paymentPreference: "UPI",
  });

  const [saved, setSaved] = useState(false);

  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    const savedSettings = localStorage.getItem("ss_customer_settings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        localStorage.removeItem("ss_customer_settings");
      }
    }
  }, []);

  /* =====================================================
     UPDATE SETTING
  ===================================================== */

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  const saveSettings = () => {
    localStorage.setItem(
      "ss_customer_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* =====================================================
     DELETE ACCOUNT - PROTOTYPE
  ===================================================== */

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This is a prototype action."
    );

    if (!confirmed) return;

    localStorage.removeItem("ss_auth");
    localStorage.removeItem("ss_customer_settings");

    navigate("/login");
  };

  return (
    <div className="container-app py-8 pb-28">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-500 text-white">
              <User size={22} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">
                  Settings
                </h1>

                <span className="rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
                  CUSTOMER
                </span>

              </div>

              <p className="mt-1 text-sm text-navy-400">
                Manage your ShramSetu account and preferences.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={saveSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-navy-600"
        >
          {saved ? (
            <>
              <Check size={15} />
              Settings Saved
            </>
          ) : (
            <>
              <Save size={15} />
              Save Changes
            </>
          )}
        </button>

      </div>

      {/* =====================================================
          PROFILE SUMMARY
      ===================================================== */}

      <section className="mt-8 overflow-hidden rounded-3xl bg-navy-700 shadow-card">

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-coop-500 text-xl font-bold text-white">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div>

              <p className="font-display text-xl font-bold text-white">
                {currentUser?.name || "Customer"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-100">

                <span className="flex items-center gap-1.5">
                  <Mail size={13} />
                  {currentUser?.email || "customer@shramsetu.in"}
                </span>

                {currentUser?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Smartphone size={13} />
                    {currentUser.phone}
                  </span>
                )}

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
          >
            Customer Dashboard
            <ChevronRight size={14} />
          </button>

        </div>

      </section>

      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <SettingsSection
        icon={User}
        title="Account"
        description="Manage your basic account information."
      >

        <SettingsRow
          icon={User}
          title="Profile Information"
          description="Update your name, phone number and personal details."
          action={
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:text-coop-600"
            >
              Manage
              <ChevronRight size={14} />
            </button>
          }
        />

        <SettingsRow
          icon={Mail}
          title="Email Address"
          description={currentUser?.email || "customer@shramsetu.in"}
          action={
            <span className="rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
              Verified
            </span>
          }
        />

        <SettingsRow
          icon={Smartphone}
          title="Phone Number"
          description={
            currentUser?.phone || "Add your phone number for booking updates."
          }
          action={
            <ChevronRight
              size={17}
              className="text-navy-300"
            />
          }
        />

        <SettingsRow
          icon={Lock}
          title="Password & Security"
          description="Manage your password and account security."
          action={
            <ChevronRight
              size={17}
              className="text-navy-300"
            />
          }
        />

      </SettingsSection>

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Choose which updates you want to receive."
      >

        <ToggleRow
          icon={Bell}
          title="Booking Updates"
          description="Receive updates when your booking status changes."
          checked={settings.bookingNotifications}
          onChange={(value) =>
            updateSetting("bookingNotifications", value)
          }
        />

        <ToggleRow
          icon={Navigation}
          title="Worker Arrival Alerts"
          description="Get notified when your assigned worker is on the way or arrives."
          checked={settings.workerArrivalNotifications}
          onChange={(value) =>
            updateSetting("workerArrivalNotifications", value)
          }
        />

        <ToggleRow
          icon={CreditCard}
          title="Payment Updates"
          description="Receive payment and invoice notifications."
          checked={settings.paymentNotifications}
          onChange={(value) =>
            updateSetting("paymentNotifications", value)
          }
        />

        <ToggleRow
          icon={Sparkles}
          title="AI Recommendations"
          description="Receive personalized home maintenance and service suggestions."
          checked={settings.aiRecommendations}
          onChange={(value) =>
            updateSetting("aiRecommendations", value)
          }
        />

        <ToggleRow
          icon={Mail}
          title="Email Updates"
          description="Receive important account and service updates by email."
          checked={settings.emailUpdates}
          onChange={(value) =>
            updateSetting("emailUpdates", value)
          }
        />

        <ToggleRow
          icon={Smartphone}
          title="SMS Updates"
          description="Receive important booking alerts through SMS."
          checked={settings.smsUpdates}
          onChange={(value) =>
            updateSetting("smsUpdates", value)
          }
        />

      </SettingsSection>

      {/* =====================================================
          PREFERENCES
      ===================================================== */}

      <SettingsSection
        icon={Globe2}
        title="Preferences"
        description="Customize how ShramSetu works for you."
      >

        <div className="border-b border-navy-100 px-5 py-5 sm:px-6">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
              <Globe2 size={18} />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold text-navy-700">
                Language
              </p>

              <p className="mt-1 text-xs text-navy-400">
                Choose the language used across your customer dashboard.
              </p>

              <select
                value={settings.language}
                onChange={(e) =>
                  updateSetting("language", e.target.value)
                }
                className="mt-3 w-full max-w-xs rounded-xl border border-navy-100 bg-white px-3 py-2.5 text-xs font-semibold text-navy-700 outline-none focus:border-coop-400"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Hinglish</option>
              </select>

            </div>

          </div>

        </div>

        <ToggleRow
          icon={MapPin}
          title="Location Services"
          description="Allow ShramSetu to use your location for nearby service discovery."
          checked={settings.locationServices}
          onChange={(value) =>
            updateSetting("locationServices", value)
          }
        />

        <ToggleRow
          icon={Navigation}
          title="Live Worker Tracking"
          description="Allow location sharing during an active service journey."
          checked={settings.liveLocation}
          onChange={(value) =>
            updateSetting("liveLocation", value)
          }
        />

        <div className="px-5 py-5 sm:px-6">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
              <CreditCard size={18} />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold text-navy-700">
                Preferred Payment Method
              </p>

              <p className="mt-1 text-xs text-navy-400">
                Choose the payment option shown first during booking.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {["UPI", "Card", "Cash"].map((method) => (

                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      updateSetting("paymentPreference", method)
                    }
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      settings.paymentPreference === method
                        ? "border-coop-500 bg-coop-50 text-coop-700"
                        : "border-navy-100 bg-white text-navy-500 hover:bg-navy-50"
                    }`}
                  >
                    {method}

                    {settings.paymentPreference === method && (
                      <Check
                        size={13}
                        className="ml-1.5 inline"
                      />
                    )}

                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>

      </SettingsSection>

      {/* =====================================================
          PRIVACY & SECURITY
      ===================================================== */}

      <SettingsSection
        icon={ShieldCheck}
        title="Privacy & Security"
        description="Control how your information is used during ShramSetu services."
      >

        <PrivacyRow
          icon={Navigation}
          title="Location During Active Booking"
          description="Your live location should only be shared when required for an active worker journey."
          status="Controlled"
        />

        <PrivacyRow
          icon={Eye}
          title="Service History"
          description="Your previous bookings can be used to provide personalized service recommendations."
          status="Enabled"
        />

        <PrivacyRow
          icon={ShieldCheck}
          title="Verified Worker Matching"
          description="Worker recommendations use service requirements, availability, rating and verification information."
          status="Protected"
        />

      </SettingsSection>

      {/* =====================================================
          ACCOUNT MANAGEMENT
      ===================================================== */}

      <section className="mt-8 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">

        <div className="border-b border-red-100 bg-red-50/50 px-5 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <ShieldCheck size={18} />
            </div>

            <div>

              <h2 className="font-display font-bold text-navy-700">
                Account Management
              </h2>

              <p className="mt-1 text-xs text-navy-400">
                Manage your ShramSetu account access.
              </p>

            </div>

          </div>

        </div>

        <div className="p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold text-navy-700">
                Sign out of ShramSetu
              </p>

              <p className="mt-1 text-xs text-navy-400">
                End your current customer session on this device.
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={15} />
              Logout
            </button>

          </div>

          <div className="my-5 border-t border-navy-100" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold text-red-600">
                Delete Account
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-navy-400">
                Permanently remove your customer account and associated
                prototype session data.
              </p>

            </div>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={15} />
              Delete Account
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          PROTOTYPE NOTE
      ===================================================== */}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-4">

        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-saffron-600"
        />

        <p className="text-xs leading-5 text-navy-600">

          <strong>Prototype:</strong> Settings are currently stored locally
          on this device. In the production version, these preferences can
          be synchronized with the customer's account through the ShramSetu
          backend.

        </p>

      </div>

    </div>
  );
}

/* =========================================================
   SETTINGS SECTION
========================================================= */

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm">

      <div className="border-b border-navy-100 bg-navy-50/40 px-5 py-5 sm:px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy-600 shadow-sm">
            <Icon size={18} />
          </div>

          <div>

            <h2 className="font-display font-bold text-navy-700">
              {title}
            </h2>

            <p className="mt-1 text-xs text-navy-400">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div>
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   SETTINGS ROW
========================================================= */

function SettingsRow({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex items-center gap-4 border-b border-navy-100 px-5 py-5 last:border-b-0 sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-bold text-navy-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-navy-400">
          {description}
        </p>

      </div>

      <div className="shrink-0">
        {action}
      </div>

    </div>
  );
}

/* =========================================================
   TOGGLE ROW
========================================================= */

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center gap-4 border-b border-navy-100 px-5 py-5 last:border-b-0 sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-bold text-navy-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-navy-400">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-coop-500"
            : "bg-navy-200"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

/* =========================================================
   PRIVACY ROW
========================================================= */

function PrivacyRow({
  icon: Icon,
  title,
  description,
  status,
}) {
  return (
    <div className="flex items-start gap-4 border-b border-navy-100 px-5 py-5 last:border-b-0 sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-bold text-navy-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-navy-400">
          {description}
        </p>

      </div>

      <span className="shrink-0 rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
        {status}
      </span>

    </div>
  );
}