import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

import { login } from "../data/mockauth";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // BACKEND LOGIN
  // ================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const result = await login(email, password, role);

    if (!result.success) {
      setError(result.message || "Invalid email or password.");
      return;
    }

    if (role === "customer") {
      navigate("/dashboard");
    } else if (role === "worker") {
      navigate("/worker-dashboard");
    }
  };

  // ================================
  // DEMO CREDENTIALS
  // ================================
  const fillDemoCredentials = () => {
    if (role === "customer") {
      setEmail("customer@shramsetu.in");
      setPassword("123456");
    } else if (role === "worker") {
      setEmail("worker@shramsetu.in");
      setPassword("123456");
    }

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
                <h1 className="font-display font-bold text-xl">ShramSetu</h1>

                <p className="text-xs text-slate-300">
                  Skilled Hands. Trusted Services.
                </p>
              </div>
            </div>

            {/* HEADING */}
            <h2 className="font-display text-4xl font-bold leading-tight mb-5">
              Welcome back to
              <span className="text-coop-400"> ShramSetu</span>
            </h2>

            <p className="text-slate-300 leading-relaxed">
              Connect with verified cooperative workers and access trusted local
              services through a transparent and worker-first platform.
            </p>
          </div>

          {/* FEATURES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck size={18} className="text-coop-400" />
              Verified cooperative workers
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <LockKeyhole size={18} className="text-coop-400" />
              Secure account access
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Briefcase size={18} className="text-coop-400" />
              Fair and transparent services
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

              <p className="text-xs text-slate-500">Trusted local services</p>
            </div>
          </div>

          {/* HEADING */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-navy-700">
              Sign in
            </h2>

            <p className="text-slate-500 mt-2">Access your ShramSetu account</p>
          </div>

          {/* =====================================================
              ROLE SELECTOR
          ====================================================== */}

          <div className="grid grid-cols-2 gap-2 mb-7">
            {/* CUSTOMER */}
            <RoleButton
              active={role === "customer"}
              onClick={() => {
                setRole("customer");
                setError("");
              }}
              icon={<User size={18} />}
              label="Customer"
            />

            {/* WORKER */}
            <RoleButton
              active={role === "worker"}
              onClick={() => {
                setRole("worker");
                setError("");
              }}
              icon={<Briefcase size={18} />}
              label="Worker"
            />
          </div>

          {/* =====================================================
              LOGIN FORM
          ====================================================== */}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                className="
                  w-full
                  px-4
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

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="
                    w-full
                    px-4
                    py-3
                    pr-12
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

                {/* SHOW / HIDE PASSWORD */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
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

            {/* LOGIN BUTTON */}
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
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          {/* =====================================================
              DEMO ACCESS
          ====================================================== */}

          <div
            className="
            mt-7
            p-4
            rounded-xl
            bg-slate-50
            border
            border-slate-200
          "
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-navy-700">
                Prototype Demo
              </p>

              <button
                type="button"
                onClick={fillDemoCredentials}
                className="
                  text-xs
                  font-semibold
                  text-coop-600
                  hover:text-coop-700
                "
              >
                Use demo login
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Demo credentials are available for the selected role.
            </p>

            {/* DEMO CREDENTIALS */}
            <div className="mt-3 text-xs text-slate-500">
              <p>
                Email:{" "}
                <span className="font-medium text-slate-700">
                  {role === "customer"
                    ? "customer@shramsetu.in"
                    : "worker@shramsetu.in"}
                </span>
              </p>

              <p>
                Password:{" "}
                <span className="font-medium text-slate-700">123456</span>
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="
        font-semibold
        text-coop-600
        hover:text-coop-700
      "
              >
                Create one
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

/* ============================================================
   ROLE BUTTON COMPONENT
============================================================ */

function RoleButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-1.5
        py-3
        rounded-xl
        border
        text-xs
        font-semibold
        transition

        ${
          active
            ? "border-coop-500 bg-coop-50 text-coop-700"
            : "border-slate-200 text-slate-500 hover:border-slate-300"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
