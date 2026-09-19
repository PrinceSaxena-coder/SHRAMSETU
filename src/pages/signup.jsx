import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { register } from "../data/mockauth";

export default function Signup() {
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Account type
  // Default = Customer
  const [role, setRole] = useState("customer");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // BACKEND SIGNUP
  // ==========================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const {
      name,
      phone,
      email,
      password,
      confirmPassword,
    } = form;

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError(
        "Please accept the Terms & Privacy Policy to continue."
      );
      return;
    }

    const result = await register({
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    if (!result.success) {
      setError(result.message || "Registration failed. Please try again.");
      return;
    }

    if (role === "customer") {
      navigate("/dashboard");
    } else if (role === "worker") {
      navigate("/worker-dashboard");
    }
  };

  // ==========================================
  // INPUT HANDLER
  // ==========================================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-card overflow-hidden">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div className="hidden lg:flex bg-navy-700 text-white p-12 flex-col justify-between">

          <div>

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-10">

              <div className="w-11 h-11 rounded-xl bg-coop-500 flex items-center justify-center">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h1 className="font-display font-bold text-xl">
                  ShramSetu
                </h1>

                <p className="text-xs text-slate-300">
                  Skilled Hands. Trusted Services.
                </p>
              </div>

            </div>

            {/* HEADING */}
            <h2 className="font-display text-4xl font-bold leading-tight mb-5">

              Your home problems,

              <span className="text-coop-400">
                {" "}solved simply.
              </span>

            </h2>

            <p className="text-slate-300 leading-relaxed">
              Create your ShramSetu account and connect with
              verified local service professionals for your
              everyday home needs.
            </p>

          </div>

          {/* FEATURES */}
          <div className="space-y-4">

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2
                size={18}
                className="text-coop-400"
              />
              Verified local service workers
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck
                size={18}
                className="text-coop-400"
              />
              Transparent and trusted services
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <LockKeyhole
                size={18}
                className="text-coop-400"
              />
              Secure account experience
            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="p-7 sm:p-10 lg:p-12">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-8">

            <div className="w-10 h-10 rounded-xl bg-coop-500 text-white flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1 className="font-display font-bold text-xl text-navy-700">
                ShramSetu
              </h1>

              <p className="text-xs text-slate-500">
                Trusted local services
              </p>
            </div>

          </div>

          {/* HEADING */}
          <div className="mb-7">

            <h2 className="font-display text-3xl font-bold text-navy-700">
              Create your account
            </h2>

            <p className="text-slate-500 mt-2">
              Get trusted help for your home.
            </p>

          </div>

          {/* =====================================================
              SIGNUP FORM
          ====================================================== */}

          <form
            onSubmit={handleSignup}
            className="space-y-4"
          >

            {/* =================================================
                ACCOUNT TYPE DROPDOWN
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Account type
              </label>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError("");
                }}
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-coop-500
                  focus:border-transparent
                  transition
                  cursor-pointer
                "
              >

                <option value="customer">
                  Customer
                </option>

                <option value="worker">
                  Worker
                </option>

              </select>

            </div>

            {/* =================================================
                FULL NAME
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Full name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleChange(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-coop-500
                    focus:border-transparent
                    transition
                  "
                  required
                />

              </div>

            </div>

            {/* =================================================
                MOBILE NUMBER
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Mobile number
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    handleChange(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-coop-500
                    focus:border-transparent
                    transition
                  "
                  required
                />

              </div>

            </div>

            {/* =================================================
                EMAIL
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="Enter your email"
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-coop-500
                    focus:border-transparent
                    transition
                  "
                  required
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={(e) =>
                    handleChange(
                      "password",
                      e.target.value
                    )
                  }
                  placeholder="Create a password"
                  className="
                    w-full
                    pl-11
                    pr-12
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-coop-500
                    focus:border-transparent
                    transition
                  "
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Confirm password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  className="
                    w-full
                    pl-11
                    pr-12
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-coop-500
                    focus:border-transparent
                    transition
                  "
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >

                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* =================================================
                TERMS
            ================================================== */}

            <div className="flex items-start gap-3 pt-1">

              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(
                    e.target.checked
                  );
                  setError("");
                }}
                className="
                  mt-1
                  w-4
                  h-4
                  rounded
                  border-slate-300
                  text-coop-600
                  focus:ring-coop-500
                "
              />

              <p className="text-xs text-slate-500 leading-relaxed">

                I agree to the{" "}

                <span className="font-medium text-coop-600">
                  Terms of Service
                </span>{" "}

                and{" "}

                <span className="font-medium text-coop-600">
                  Privacy Policy
                </span>

                .

              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  bg-red-50
                  border
                  border-red-200
                  text-red-600
                  text-sm
                  rounded-xl
                  px-4
                  py-3
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                CREATE ACCOUNT
            ================================================== */}

            <button
              type="submit"
              className="
                w-full
                bg-coop-600
                hover:bg-coop-700
                text-white
                font-semibold
                py-3.5
                rounded-xl
                transition
                flex
                items-center
                justify-center
                gap-2
              "
            >

              Create account

              <ArrowRight size={18} />

            </button>

          </form>

          {/* =====================================================
              LOGIN LINK
          ====================================================== */}

          <div className="text-center mt-6">

            <p className="text-sm text-slate-500">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  font-semibold
                  text-coop-600
                  hover:text-coop-700
                "
              >
                Sign in
              </button>

            </p>

          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-slate-400 mt-7">
            ShramSetu • AI-Powered Local Service Marketplace
          </p>

        </div>

      </div>

    </div>
  );
}