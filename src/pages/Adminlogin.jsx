import React, {
  useState,
} from "react";

import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  login,
} from "../data/mockauth";

export default function AdminLogin() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /**
   * ==========================================================
   * SUBMIT ADMIN LOGIN
   * ==========================================================
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
     * Basic frontend validation.
     */
    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        "Please enter administrator email and password."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * login() is async, therefore await is required.
       */
      const result =
        await login(
          email,
          password,
          "admin"
        );

      /*
       * Login failed.
       */
      if (!result.success) {
        setError(
          result.message ||
            "Unable to authenticate administrator."
        );

        return;
      }

      /*
       * Extra safety:
       * make sure the backend actually
       * returned an admin session.
       */
      if (
        result.user?.role !==
        "admin"
      ) {
        setError(
          "This account is not authorized as an administrator."
        );

        return;
      }

      /*
       * Admin authenticated.
       */
      navigate(
        "/admin",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ==========================================================
   * DEMO LOGIN
   * ==========================================================
   */
  const handleDemoLogin =
    async () => {
      setEmail(
        "admin@shramsetu.in"
      );

      setPassword(
        "123456"
      );

      setError("");

      setLoading(true);

      try {
        const result =
          await login(
            "admin@shramsetu.in",
            "123456",
            "admin"
          );

        if (!result.success) {
          setError(
            result.message ||
              "Demo admin login failed."
          );

          return;
        }

        if (
          result.user?.role !==
          "admin"
        ) {
          setError(
            "Demo account is not configured as an admin."
          );

          return;
        }

        navigate(
          "/admin",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Demo admin login error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="text-center mb-8">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#050811] flex items-center justify-center shadow-lg">

            <ShieldCheck
              size={42}
              className="text-white"
            />

          </div>

          <h1 className="font-display font-extrabold text-3xl text-navy-700 mt-6">
            ShramSetu
          </h1>

          <p className="font-semibold text-navy-700 mt-2">
            Cooperative Admin Portal
          </p>

          <p className="text-sm text-navy-400 mt-2">
            Authorized administration access only
          </p>

        </div>

        {/* ====================================================
            LOGIN CARD
        ==================================================== */}

        <div className="bg-white border border-navy-100 rounded-2xl shadow-sm p-8">

          {/* RESTRICTED ACCESS */}

          <div className="bg-[#f8fafc] border border-navy-100 rounded-xl p-4 mb-7">

            <div className="flex gap-3">

              <Lock
                size={20}
                className="text-navy-700 mt-0.5"
              />

              <div>

                <p className="font-semibold text-navy-700">
                  Restricted Access
                </p>

                <p className="text-sm text-navy-400 mt-1">
                  This portal is restricted to authorized
                  cooperative administrators.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Administrator Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter administrator email"
                autoComplete="username"
                disabled={loading}
                className="w-full border border-navy-100 rounded-xl px-4 py-4 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 disabled:bg-slate-50"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full border border-navy-100 rounded-xl px-4 py-4 pr-12 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                    />
                  ) : (
                    <Eye
                      size={20}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 flex items-start gap-2">

                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#050811] hover:bg-black text-white rounded-xl py-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Authenticating...
                </>
              ) : (
                <>
                  Access Admin Portal
                </>
              )}

            </button>

          </form>

          {/* ==================================================
              DEMO ACCESS
          ================================================== */}

          <div className="mt-7 bg-coop-50 border border-coop-100 rounded-xl p-4">

            <div className="flex items-center justify-between gap-3">

              <p className="text-sm font-semibold text-coop-700">
                Prototype Admin Access
              </p>

              <button
                type="button"
                onClick={
                  handleDemoLogin
                }
                disabled={loading}
                className="text-xs font-semibold text-coop-700 hover:text-coop-900 disabled:opacity-50"
              >
                Use Demo Login
              </button>

            </div>

            <p className="text-xs text-coop-600 mt-2">
              Email: admin@shramsetu.in
            </p>

            <p className="text-xs text-coop-600">
              Password: 123456
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}