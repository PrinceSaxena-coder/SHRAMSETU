import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  Check,
  Smartphone,
  CreditCard,
  Banknote,
  MapPin,
  Zap,
  CheckCircle2,
  Loader2,
  X,
  RefreshCw,
  Users,
  ShieldCheck,
  IndianRupee,
  AlertCircle,
  Crosshair,
} from "lucide-react";

import NearbyMap from "../components/Nearbymap";
import { reverseGeocode } from "../api/location";

import {
  SERVICES_MENU,
  TIME_SLOTS,
  WEEK_DAYS,
} from "../data/mockauth";

import { getWorkers } from "../data/mockauth";

import { Button } from "../components/UI";

import {
  createBooking,
  getAvailability,
  createJobRequest,
  getJobById,
  updateJobStatus,
} from "../api";

import {
  createPaymentOrder,
  verifyPayment,
} from "../api/payment";

/* ============================================================
   CONSTANTS
   ============================================================ */

const STEPS = [
  "Service",
  "Slot",
  "Address",
  "Payment",
  "Confirm",
];

const TIMEOUT_MINUTES = 15;
const TIMEOUT_SECONDS = TIMEOUT_MINUTES * 60;
const MAX_ATTEMPTS = 3;

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * The API returns worker categories in the
 * casing they were stored in ("Electrical"),
 * while SERVICES_MENU uses lowercase keys
 * ("electrical"). Always compare through this.
 */
function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function weekDayKey(d) {
  return WEEK_DAYS[(d.getDay() + 6) % 7];
}

function nextDays(n) {
  const days = [];

  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return days;
}

function dateTabLabel(d, i) {
  if (i === 0) return "Today";
  if (i === 1) return "Tomorrow";

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

/* ============================================================
   RAZORPAY SCRIPT LOADER
   ============================================================ */

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

/* ============================================================
   SLOT PICKER
   ============================================================ */

function SlotPicker({
  days,
  selectedDayIdx,
  setSelectedDayIdx,
  time,
  setTime,
  availability,
}) {
  const isToday = selectedDayIdx === 0;
  const now = new Date();

  const selectedDay = days[selectedDayIdx];

  const availableTimesToday =
    availability[weekDayKey(selectedDay)] || [];

  const fastestIdx = useMemo(() => {
    if (!isToday) return -1;

    const idx = TIME_SLOTS.findIndex((t) => {
      if (!availableTimesToday.includes(t)) {
        return false;
      }

      const [, hh, mm, ap] = t.match(
        /(\d+):(\d+)\s(AM|PM)/,
      );

      let h = parseInt(hh, 10);

      if (ap === "PM" && h !== 12) {
        h += 12;
      }

      if (ap === "AM" && h === 12) {
        h = 0;
      }

      const slot = new Date();

      slot.setHours(
        h,
        parseInt(mm, 10),
        0,
        0,
      );

      return slot.getTime() > now.getTime();
    });

    return idx;
  }, [isToday, availableTimesToday]);

  return (
    <div>
      <p className="font-semibold text-navy-700 mb-3 flex items-center gap-2">
        <Zap size={16} />
        Choose a slot
      </p>

      {/* DATE TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((d, i) => {
          const hasAnySlot =
            (availability[weekDayKey(d)] || [])
              .length > 0;

          return (
            <button
              key={d.toDateString()}
              type="button"
              onClick={() =>
                hasAnySlot &&
                setSelectedDayIdx(i)
              }
              disabled={!hasAnySlot}
              className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-colors ${
                !hasAnySlot
                  ? "border-navy-50 text-navy-200 cursor-not-allowed opacity-60"
                  : selectedDayIdx === i
                    ? "border-coop-500 bg-coop-50"
                    : "border-navy-100 hover:border-navy-200"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  selectedDayIdx === i &&
                  hasAnySlot
                    ? "text-coop-700"
                    : hasAnySlot
                      ? "text-navy-500"
                      : "text-navy-200"
                }`}
              >
                {dateTabLabel(d, i)}
              </span>

              <span className="text-[11px] text-navy-300">
                {d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </button>
          );
        })}
      </div>

      {/* TIME SLOTS */}
      {availableTimesToday.length === 0 ? (
        <p className="text-sm text-navy-400 mt-4">
          This worker has no slots available
          on this day — try another date.
        </p>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-1 mt-4 -mx-1 px-1">
          {TIME_SLOTS.filter((t) =>
            availableTimesToday.includes(t),
          ).map((t) => {
            const isFastest =
              TIME_SLOTS.indexOf(t) ===
              fastestIdx;

            const isSelected = time === t;

            return (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`relative shrink-0 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? "border-coop-500 bg-coop-500 text-white"
                    : isFastest
                      ? "border-saffron-300 bg-saffron-50 text-saffron-700"
                      : "border-navy-100 text-navy-600 hover:border-navy-200"
                }`}
              >
                {isFastest && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-saffron-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    FASTEST
                  </span>
                )}

                {t}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-navy-300 mt-3">
        Only slots this worker has marked
        available are shown.
      </p>
    </div>
  );
}

/* ============================================================
   WAITING SCREEN
   ============================================================ */

function WaitingForApproval({
  worker,
  elapsed,
  attempt,
  maxAttempts,
  onCancel,
}) {
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const secondsLeft = Math.max(
    0,
    TIMEOUT_SECONDS - elapsed,
  );

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        <span className="absolute inset-0 rounded-full bg-coop-400/30 animate-radar" />

        <span
          className="absolute inset-0 rounded-full bg-coop-400/30 animate-radar"
          style={{
            animationDelay: "0.6s",
          }}
        />

        <span
          className="absolute inset-0 rounded-full bg-coop-400/30 animate-radar"
          style={{
            animationDelay: "1.2s",
          }}
        />

        <div
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white font-display font-bold text-xl"
          style={{
            backgroundColor:
              worker.avatarColor,
          }}
        >
          {initials}
        </div>
      </div>

      <p className="font-display font-bold text-lg text-navy-700">
        Requesting {worker.name}...
      </p>

      <p className="text-sm text-navy-400 mt-1">
        Waiting for them to accept your booking
      </p>

      {attempt > 1 && (
        <p className="text-xs text-saffron-600 font-semibold mt-2">
          Previous worker didn't respond —
          trying the next nearest worker
        </p>
      )}

      <p className="text-xs text-navy-300 mt-3">
        Attempt {attempt} of {maxAttempts} ·
        trying another worker in{" "}
        {secondsLeft}s
      </p>

      <Button
        variant="ghost"
        className="mt-6"
        onClick={onCancel}
      >
        Cancel Request
      </Button>
    </div>
  );
}

/* ============================================================
   DECLINED SCREEN
   ============================================================ */

function DeclinedScreen({
  worker,
  onRetry,
  onFindAnother,
}) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <X size={28} />
      </div>

      <p className="font-display font-bold text-lg text-navy-700">
        {worker.name} isn't available right now
      </p>

      <p className="text-sm text-navy-400 mt-1 max-w-xs">
        Your request was declined. You can
        try requesting again or pick a
        different worker.
      </p>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onRetry}
        >
          <RefreshCw size={14} />
          Request Again
        </Button>

        <Button
          variant="primary"
          onClick={onFindAnother}
        >
          Find Another Worker
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   NO WORKERS SCREEN
   ============================================================ */

function NoWorkersScreen({
  onRetry,
  onBrowse,
}) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-400 flex items-center justify-center mb-4">
        <Users size={28} />
      </div>

      <p className="font-display font-bold text-lg text-navy-700">
        No workers responded right now
      </p>

      <p className="text-sm text-navy-400 mt-1 max-w-xs">
        We tried the nearest available
        workers but none accepted in time.
        You can try again or browse the
        marketplace.
      </p>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onRetry}
        >
          <RefreshCw size={14} />
          Try Again
        </Button>

        <Button
          variant="primary"
          onClick={onBrowse}
        >
          Browse Workers
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   BOOKING COMPONENT
   ============================================================ */

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const workerId = params.get("workerId");

  const isEmergency =
    params.get("emergency") === "1";

  /* ----------------------------------------------------------
     WORKER
     ---------------------------------------------------------- */

  const [workers, setWorkers] = useState([]);

  const [workersLoading, setWorkersLoading] =
    useState(true);

  const [workerError, setWorkerError] =
    useState("");

  const [activeWorker, setActiveWorker] =
    useState(null);

  /* ----------------------------------------------------------
     LOAD WORKERS FROM MONGODB
     ---------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadWorkers() {
      try {
        setWorkersLoading(true);
        setWorkerError("");

        const data = await getWorkers();

        if (cancelled) return;

        setWorkers(data || []);

        const selectedWorker =
          (data || []).find(
            (w) => String(w.id) === String(workerId),
          ) || (data || [])[0];

        if (!selectedWorker) {
          setWorkerError("No workers found.");
          setActiveWorker(null);
          return;
        }

        setActiveWorker(selectedWorker);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Failed to load workers:",
          error,
        );

        setWorkerError(
          "Unable to load workers. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setWorkersLoading(false);
        }
      }
    }

    loadWorkers();

    return () => {
      cancelled = true;
    };
  }, [workerId]);

  /* ----------------------------------------------------------
     BOOKING FORM
     ---------------------------------------------------------- */

  const [step, setStep] = useState(0);

  const [service, setService] =
    useState(null);

  const [selectedDayIdx, setSelectedDayIdx] =
    useState(0);

  const [time, setTime] =
    useState(null);

  const [address, setAddress] =
    useState("");

  /* ----------------------------------------------------------
     ADDRESS MAP (pin location backing the textarea)
     ---------------------------------------------------------- */

  const [mapLocation, setMapLocation] =
    useState(null);

  const [locating, setLocating] =
    useState(false);

  const [locateError, setLocateError] =
    useState("");

  const [resolvingAddress, setResolvingAddress] =
    useState(false);

  function applyPickedLocation(coords) {
    setMapLocation(coords);
    setLocateError("");
    setResolvingAddress(true);

    reverseGeocode(
      coords.latitude,
      coords.longitude,
    )
      .then((result) => {
        if (result?.formattedAddress) {
          setAddress(
            result.formattedAddress,
          );
        }
      })
      .catch((error) => {
        console.error(
          "Reverse geocode failed:",
          error,
        );

        setLocateError(
          "Pin placed, but we couldn't fill in the address automatically. Please type it in.",
        );
      })
      .finally(() => {
        setResolvingAddress(false);
      });
  }

  function useMyLocation() {
    if (
      !("geolocation" in navigator)
    ) {
      setLocateError(
        "Your browser doesn't support location detection.",
      );
      return;
    }

    setLocating(true);
    setLocateError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);

        applyPickedLocation({
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        });
      },
      (error) => {
        setLocating(false);

        setLocateError(
          error.code ===
            error.PERMISSION_DENIED
            ? "Location permission denied. Drag the pin or tap the map instead."
            : "Couldn't get your location. Drag the pin or tap the map instead.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  const [payment, setPayment] =
    useState(null);

  const [confirmedBooking, setConfirmedBooking] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [availability, setAvailabilityState] =
    useState(null);

  /* ----------------------------------------------------------
     RAZORPAY STATES
     ---------------------------------------------------------- */

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentCompleted, setPaymentCompleted] =
    useState(false);

  const [razorpayPaymentId, setRazorpayPaymentId] =
    useState(null);

  const [razorpayOrderId, setRazorpayOrderId] =
    useState(null);

  /* ----------------------------------------------------------
     APPROVAL FLOW
     ---------------------------------------------------------- */

  const [phase, setPhase] =
    useState("form");

  const [jobId, setJobId] =
    useState(null);

  const [elapsed, setElapsed] =
    useState(0);

  const [attempt, setAttempt] =
    useState(1);

  const [triedWorkerIds, setTriedWorkerIds] =
    useState([]);

  const [reassigning, setReassigning] =
    useState(false);

  /* ----------------------------------------------------------
     SERVICES
     ---------------------------------------------------------- */

  const availableServices = useMemo(
    () => {
      if (!activeWorker) return [];

      const workerCategory =
        normalizeCategory(
          activeWorker.category ||
            activeWorker.skill,
        );

      const matches =
        SERVICES_MENU.filter(
          (s) =>
            normalizeCategory(
              s.category,
            ) === workerCategory,
        );

      // A worker whose category is missing or
      // unknown (e.g. the 'General' fallback)
      // would otherwise leave this step empty
      // and un-completable.
      return matches.length
        ? matches
        : SERVICES_MENU;
    },
    [activeWorker],
  );

  useEffect(() => {
    if (
      availableServices.length &&
      !service
    ) {
      setService(
        availableServices[0],
      );
    }
  }, [
    availableServices,
    service,
  ]);

  /* ----------------------------------------------------------
     DAYS
     ---------------------------------------------------------- */

  const days = useMemo(
    () => nextDays(7),
    [],
  );

  /* ----------------------------------------------------------
     AVAILABILITY
     ---------------------------------------------------------- */

  useEffect(() => {
    if (!activeWorker?.id) {
      setAvailabilityState(null);
      return;
    }

    let cancelled = false;

    setAvailabilityState(null);

    getAvailability(
      activeWorker.id,
    ).then((data) => {
      if (cancelled) return;

      setAvailabilityState(data);

      const firstOpenIdx =
        days.findIndex(
          (d) =>
            (
              data[
                weekDayKey(d)
              ] || []
            ).length > 0,
        );

      if (firstOpenIdx !== -1) {
        setSelectedDayIdx(
          firstOpenIdx,
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeWorker?.id, days]);

  /* ----------------------------------------------------------
     CURRENT BOOKING DATA
     ---------------------------------------------------------- */

  const date =
    days[selectedDayIdx];

  const amount =
    (service?.basePrice || 0) +
    (isEmergency ? 100 : 0);

  /* ----------------------------------------------------------
     NEXT BUTTON VALIDATION
     ---------------------------------------------------------- */

  const canNext = () => {
    if (step === 0) {
      return !!service;
    }

    if (step === 1) {
      return !!time;
    }

    if (step === 2) {
      return (
        address.trim().length > 3
      );
    }

    if (step === 3) {
      return !!payment;
    }

    return true;
  };

  /* ==========================================================
     WORKER REQUEST
     ========================================================== */

  const requestSpecificWorker =
    async (targetWorker) => {
      const job =
        await createJobRequest({
          workerId:
            targetWorker.id,

          customer: "You",

          service:
            service?.name,

          location:
            address,

          date:
            date?.toDateString(),

          time,

          distance:
            targetWorker.distance ?? 0,

          earnings:
            amount,

          paymentMethod:
            payment,

          paymentStatus:
            payment === "Cash"
              ? "Pending"
              : paymentCompleted
                ? "Paid"
                : "Pending",

          razorpayPaymentId:
            razorpayPaymentId,

          razorpayOrderId:
            razorpayOrderId,
        });

      setJobId(job.id);

      setPhase("waiting");
    };

  /* ==========================================================
     CASH / PAID REQUEST
     ========================================================== */

  const sendWorkerRequest =
    async () => {
      setSubmitting(true);

      try {
        await requestSpecificWorker(
          activeWorker,
        );
      } catch (error) {
        console.error(
          "Worker request error:",
          error,
        );

        setPaymentError(
          "Unable to send booking request. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* ==========================================================
     RAZORPAY PAYMENT
     ========================================================== */

  const handleRazorpayPayment =
    async () => {
      try {
        setPaymentLoading(true);
        setPaymentError("");

        /* ----------------------------------------------------
           Load Razorpay Checkout
           ---------------------------------------------------- */

        const loaded =
          await loadRazorpay();

        if (!loaded) {
          throw new Error(
            "Unable to load Razorpay Checkout. Please check your internet connection.",
          );
        }

        /* ----------------------------------------------------
           Create a real booking record first so the backend
           can verify ownership and determine the payable amount.
           ---------------------------------------------------- */

        const pendingBooking =
          await createBooking({
            workerId: activeWorker.id,
            serviceId: service?.name || service?.category || "General Service",
            address,
            latitude: 26.9124,
            longitude: 75.7873,
            scheduledAt: new Date(date).toISOString(),
            amount,
          });

        if (!pendingBooking?.id) {
          throw new Error(
            "Unable to create the booking before payment.",
          );
        }

        const order =
          await createPaymentOrder(
            pendingBooking.id,
          );

        if (!order?.id) {
          throw new Error(
            "Razorpay order was not created.",
          );
        }

        setRazorpayOrderId(
          order.id,
        );

        /* ----------------------------------------------------
           Razorpay Checkout
           ---------------------------------------------------- */

        const options = {
          key:
            order.key ||
            import.meta.env
              .VITE_RAZORPAY_KEY_ID,

          amount:
            order.amount,

          currency:
            order.currency || "INR",

          name: "ShramSetu",

          description:
            `${service?.name || "Service"} Booking`,

          order_id:
            order.id,

          handler:
            async function (
              response,
            ) {
              try {
                setPaymentError("");

                /* --------------------------------------------
                   Server-side verification
                   -------------------------------------------- */

                const verification =
                  await verifyPayment(
                    response,
                  );

                if (
                  !verification.success
                ) {
                  throw new Error(
                    "Payment verification failed.",
                  );
                }

                /* --------------------------------------------
                   Save successful payment
                   -------------------------------------------- */

                setPaymentCompleted(
                  true,
                );

                setRazorpayPaymentId(
                  response.razorpay_payment_id,
                );

                setRazorpayOrderId(
                  response.razorpay_order_id,
                );

                /*
                 * For display and downstream booking data.
                 */
                setPayment(
                  payment === "Card"
                    ? "Card - Paid"
                    : "UPI - Paid",
                );

                /*
                 * The worker request happens only
                 * after successful payment verification.
                 */
                await requestSpecificWorker(
                  activeWorker,
                );
              } catch (error) {
                console.error(
                  "Payment verification error:",
                  error,
                );

                setPaymentCompleted(
                  false,
                );

                setPaymentError(
                  error.message ||
                    "Payment verification failed.",
                );
              } finally {
                setPaymentLoading(
                  false,
                );
              }
            },

          prefill: {
            name: "ShramSetu Customer",

            email:
              "customer@shramsetu.in",
          },

          notes: {
            workerId:
              activeWorker.id,

            service:
              service?.name || "",

            emergency:
              isEmergency
                ? "yes"
                : "no",
          },

          theme: {
            color: "#2563eb",
          },

          modal: {
            ondismiss:
              function () {
                setPaymentLoading(
                  false,
                );
              },
          },
        };

        const razorpay =
          new window.Razorpay(
            options,
          );

        /* ----------------------------------------------------
           PAYMENT FAILURE EVENT
           ---------------------------------------------------- */

        razorpay.on(
          "payment.failed",
          function (response) {
            console.error(
              "Razorpay payment failed:",
              response,
            );

            setPaymentError(
              response?.error
                ?.description ||
                "Payment failed. Please try again.",
            );

            setPaymentCompleted(
              false,
            );

            setPaymentLoading(
              false,
            );
          },
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Razorpay error:",
          error,
        );

        setPaymentError(
          error.message ||
            "Unable to start payment.",
        );

        setPaymentLoading(false);
      }
    };

  /* ==========================================================
     FINAL REQUEST BUTTON
     ========================================================== */

  const handleRequestWorker =
    async () => {
      setPaymentError("");

      /*
       * CASH:
       * No Razorpay required.
       */
      if (payment === "Cash") {
        await sendWorkerRequest();
        return;
      }

      /*
       * UPI / CARD:
       * Payment must be completed before
       * sending the worker request.
       */
      if (
        payment === "UPI" ||
        payment === "Card"
      ) {
        if (paymentCompleted) {
          await sendWorkerRequest();
          return;
        }

        await handleRazorpayPayment();
        return;
      }

      setPaymentError(
        "Please select a payment method.",
      );
    };

  /* ==========================================================
     FINALIZE BOOKING
     ========================================================== */

  const finalizeBooking =
    async (bookedWorker) => {
      try {
        const booking =
          await createBooking({
            workerId:
              bookedWorker.id,

            workerName:
              bookedWorker.name,

            service:
              service?.name,

            date:
              date?.toDateString(),

            time,

            address,

            payment:
              payment || "Cash",

            amount,

            emergency:
              isEmergency,

            paymentStatus:
              paymentCompleted ||
              payment === "Cash"
                ? payment === "Cash"
                  ? "Pending"
                  : "Paid"
                : "Pending",

            razorpayPaymentId:
              razorpayPaymentId,

            razorpayOrderId:
              razorpayOrderId,
          });

        setConfirmedBooking(
          booking,
        );

        setPhase("confirmed");
      } catch (error) {
        console.error(
          "Finalize booking error:",
          error,
        );

        setPaymentError(
          "Worker accepted, but the booking could not be finalized.",
        );
      }
    };

  /* ==========================================================
     CANCEL
     ========================================================== */

  const handleCancel =
    async () => {
      try {
        if (jobId) {
          await updateJobStatus(
            jobId,
            "Cancelled",
          );
        }
      } finally {
        setJobId(null);
        setPhase("form");
      }
    };

  /* ==========================================================
     NEXT WORKER
     ========================================================== */

  const attemptNextWorker =
    async () => {
      if (jobId) {
        await updateJobStatus(
          jobId,
          "Cancelled",
        );
      }

      const newTried = [
        ...triedWorkerIds,
        activeWorker.id,
      ];

      const candidates =
        workers
          .filter(
            (w) =>
              normalizeCategory(
                w.category,
              ) ===
                normalizeCategory(
                  activeWorker.category,
                ) &&
              !newTried.includes(w.id) &&
              (w.availability || "")
                .toLowerCase()
                .includes("available"),
          )
          .sort(
            (a, b) =>
              (a.distance ?? 999) -
              (b.distance ?? 999),
          );

      if (
        attempt >= MAX_ATTEMPTS ||
        candidates.length === 0
      ) {
        setTriedWorkerIds(
          newTried,
        );

        setPhase(
          "no-workers",
        );

        return;
      }

      const next =
        candidates[0];

      setTriedWorkerIds(
        newTried,
      );

      setActiveWorker(next);

      setAttempt(
        (a) => a + 1,
      );

      setElapsed(0);

      setJobId(null);

      await requestSpecificWorker(
        next,
      );
    };

  /* ==========================================================
     RETRY
     ========================================================== */

  const handleRetryFromScratch =
    () => {
      setTriedWorkerIds([]);

      setAttempt(1);

      setActiveWorker(
        workers.find(
          (w) =>
            String(w.id) ===
            String(workerId),
        ) || workers[0],
      );

      setJobId(null);

      setElapsed(0);

      setPhase("form");
    };

  /* ==========================================================
     POLL JOB STATUS
     ========================================================== */

  useEffect(() => {
    if (
      phase !== "waiting" ||
      !jobId
    ) {
      return;
    }

    const interval =
      setInterval(async () => {
        try {
          const job =
            await getJobById(
              jobId,
            );

          if (!job) {
            return;
          }

          if (
            [
              "Accepted",
              "In Progress",
              "Completed",
            ].includes(job.status)
          ) {
            clearInterval(
              interval,
            );

            await finalizeBooking(
              activeWorker,
            );
          } else if (
            job.status ===
            "Rejected"
          ) {
            clearInterval(
              interval,
            );

            setPhase(
              "declined",
            );
          }
        } catch (error) {
          console.error(
            "Job polling error:",
            error,
          );
        }
      }, 1500);

    return () =>
      clearInterval(
        interval,
      );
  }, [
    phase,
    jobId,
  ]);

  /* ==========================================================
     WAITING TIMER
     ========================================================== */

  useEffect(() => {
    if (
      phase !== "waiting"
    ) {
      setElapsed(0);
      return;
    }

    const t =
      setInterval(
        () =>
          setElapsed(
            (e) => e + 1,
          ),
        1000,
      );

    return () =>
      clearInterval(t);
  }, [phase]);

  /* ==========================================================
     TIMEOUT
     ========================================================== */

  useEffect(() => {
    if (
      phase !== "waiting" ||
      reassigning
    ) {
      return;
    }

    if (
      elapsed >=
      TIMEOUT_SECONDS
    ) {
      setReassigning(
        true,
      );

      attemptNextWorker().finally(
        () =>
          setReassigning(
            false,
          ),
      );
    }
  }, [
    elapsed,
    phase,
    reassigning,
  ]);

  /* ==========================================================
     WORKER LOADING / ERROR
     ========================================================== */

  if (workersLoading) {
    return (
      <div className="container-app py-14 flex justify-center">
        <div className="card p-8 text-center">
          <Loader2
            size={28}
            className="animate-spin mx-auto mb-3 text-coop-500"
          />
          <p className="text-sm text-navy-500">
            Loading worker details...
          </p>
        </div>
      </div>
    );
  }

  if (workerError || !activeWorker) {
    return (
      <div className="container-app py-14 flex justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle
            size={28}
            className="mx-auto mb-3 text-red-500"
          />

          <p className="font-semibold text-navy-700">
            {workerError || "Worker not found."}
          </p>

          <Button
            variant="primary"
            className="mt-5"
            onClick={() => navigate("/services")}
          >
            Browse Workers
          </Button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     CONFIRMED SCREEN
     ========================================================== */

  if (
    phase === "confirmed" &&
    confirmedBooking
  ) {
    const isPaid =
      paymentCompleted ||
      payment !== "Cash";

    return (
      <div className="container-app py-14 flex justify-center">
        <div className="card p-8 max-w-lg w-full text-center animate-fade-up">

          <div className="w-16 h-16 rounded-full bg-coop-50 text-coop-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2
              size={32}
            />
          </div>

          <h2 className="font-display font-bold text-2xl text-navy-700">
            BOOKING CONFIRMED
          </h2>

          <p className="text-navy-400 text-sm mt-1">
            {
              confirmedBooking.workerName
            }{" "}
            accepted your request.
          </p>

          <div className="text-left bg-navy-50 rounded-xl p-5 mt-6 space-y-2 text-sm">

            <Row
              label="Booking ID"
              value={
                confirmedBooking.id
              }
            />

            <Row
              label="Worker"
              value={
                confirmedBooking.workerName
              }
            />

            <Row
              label="Service"
              value={
                confirmedBooking.service
              }
            />

            <Row
              label="Date"
              value={
                confirmedBooking.date
              }
            />

            <Row
              label="Time"
              value={
                confirmedBooking.time
              }
            />

            <Row
              label="Address"
              value={
                confirmedBooking.address
              }
            />

            <Row
              label="Amount"
              value={`₹${confirmedBooking.amount}`}
            />

            <Row
              label="Payment Method"
              value={
                payment ||
                "Cash"
              }
            />

            <Row
              label="Payment Status"
              value={
                payment === "Cash"
                  ? "Pay on service"
                  : isPaid
                    ? "Paid"
                    : "Pending"
              }
            />

          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={() =>
              navigate(
                "/dashboard/bookings",
              )
            }
          >
            View My Bookings
          </Button>

        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="container-app py-8">

      <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy-700">
        {isEmergency
          ? "Emergency Booking"
          : "Book a Service"}
      </h1>

      <p className="text-navy-400 text-sm mt-1">
        with{" "}
        {activeWorker.name}{" "}
        ·{" "}
        {activeWorker.skill}
      </p>

      {/* ------------------------------------------------------
          STEP INDICATOR
      ------------------------------------------------------ */}

      {phase === "form" && (
        <div className="flex items-center gap-1 sm:gap-2 mt-6 mb-8 overflow-x-auto pb-1">

          {STEPS.map(
            (s, i) => (
              <div
                key={s}
                className="flex items-center gap-1 sm:gap-2 shrink-0"
              >

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < step
                      ? "bg-coop-500 text-white"
                      : i === step
                        ? "bg-navy-500 text-white"
                        : "bg-navy-100 text-navy-400"
                  }`}
                >
                  {i < step ? (
                    <Check size={13} />
                  ) : (
                    i + 1
                  )}
                </div>

                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    i === step
                      ? "text-navy-700"
                      : "text-navy-300"
                  }`}
                >
                  {s}
                </span>

                {i <
                  STEPS.length -
                    1 && (
                  <div className="w-4 sm:w-8 h-px bg-navy-100" />
                )}

              </div>
            ),
          )}

        </div>
      )}

      {/* ------------------------------------------------------
          PAYMENT ERROR
      ------------------------------------------------------ */}

      {paymentError && (
        <div className="mb-5 max-w-2xl p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">

          <AlertCircle
            size={19}
            className="text-red-500 shrink-0 mt-0.5"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Payment / Booking Error
            </p>

            <p className="text-xs text-red-600 mt-1">
              {paymentError}
            </p>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------
          MAIN CARD
      ------------------------------------------------------ */}

      <div className="card p-6 max-w-2xl mt-6">

        {/* WAITING */}
        {phase === "waiting" && (
          <WaitingForApproval
            worker={activeWorker}
            elapsed={elapsed}
            attempt={attempt}
            maxAttempts={
              MAX_ATTEMPTS
            }
            onCancel={
              handleCancel
            }
          />
        )}

        {/* DECLINED */}
        {phase === "declined" && (
          <DeclinedScreen
            worker={activeWorker}
            onRetry={
              handleRetryFromScratch
            }
            onFindAnother={() =>
              navigate(
                "/services",
              )
            }
          />
        )}

        {/* NO WORKERS */}
        {phase === "no-workers" && (
          <NoWorkersScreen
            onRetry={
              handleRetryFromScratch
            }
            onBrowse={() =>
              navigate(
                "/services",
              )
            }
          />
        )}

        {/* FORM */}
        {phase === "form" && (
          <>

            {/* ================================================
                STEP 0 — SERVICE
                ================================================= */}

            {step === 0 && (
              <div>

                <p className="font-semibold text-navy-700 mb-4">
                  Select a service
                </p>

                <div className="grid sm:grid-cols-2 gap-3">

                  {availableServices.map(
                    (s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setService(s)
                        }
                        className={`text-left p-4 rounded-xl border-2 transition-colors ${
                          service?.id ===
                          s.id
                            ? "border-coop-500 bg-coop-50"
                            : "border-navy-100 hover:border-navy-200"
                        }`}
                      >

                        <p className="font-semibold text-sm text-navy-700">
                          {s.name}
                        </p>

                        <p className="text-xs text-navy-400 mt-1">
                          Starting ₹
                          {s.basePrice}
                        </p>

                      </button>
                    ),
                  )}

                </div>
              </div>
            )}

            {/* ================================================
                STEP 1 — SLOT
                ================================================= */}

            {step === 1 &&
              (availability ? (
                <SlotPicker
                  days={days}
                  selectedDayIdx={
                    selectedDayIdx
                  }
                  setSelectedDayIdx={(
                    i,
                  ) => {
                    setSelectedDayIdx(
                      i,
                    );

                    setTime(null);
                  }}
                  time={time}
                  setTime={setTime}
                  availability={
                    availability
                  }
                />
              ) : (
                <div className="flex items-center gap-2 text-navy-400 text-sm py-6">

                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Checking{" "}
                  {
                    activeWorker.name.split(
                      " ",
                    )[0]
                  }
                  's availability...

                </div>
              ))}

            {/* ================================================
                STEP 2 — ADDRESS
                ================================================= */}

            {step === 2 && (
              <div>

                <p className="font-semibold text-navy-700 mb-4 flex items-center gap-2">
                  <MapPin size={16} />
                  Enter your address
                </p>

                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-navy-400">
                    Tap the map or drag the
                    pin to set your exact
                    location.
                  </p>

                  <button
                    type="button"
                    onClick={
                      useMyLocation
                    }
                    disabled={
                      locating
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-coop-600 hover:text-coop-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    {locating ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Crosshair
                        size={14}
                      />
                    )}
                    Use my location
                  </button>
                </div>

                <div className="mb-3 rounded-2xl border border-navy-100 overflow-hidden">
                  <NearbyMap
                    pickable
                    location={
                      mapLocation
                    }
                    onLocationChange={
                      applyPickedLocation
                    }
                    heightClassName="h-[280px]"
                  />
                </div>

                {locateError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mb-3">
                    <AlertCircle
                      size={13}
                    />
                    {locateError}
                  </p>
                )}

                {resolvingAddress && (
                  <p className="flex items-center gap-1.5 text-xs text-navy-400 mb-3">
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                    Looking up address
                    for the pin...
                  </p>
                )}

                <textarea
                  value={
                    address
                  }
                  onChange={(e) =>
                    setAddress(
                      e.target
                        .value,
                    )
                  }
                  placeholder="House no, street, area, city, PIN code"
                  rows={4}
                  className="input-field resize-none"
                />

              </div>
            )}

            {/* ================================================
                STEP 3 — PAYMENT
                ================================================= */}

            {step === 3 && (
              <div>

                <p className="font-semibold text-navy-700 mb-4">
                  Select payment method
                </p>

                <div className="grid sm:grid-cols-3 gap-3">

                  {[
                    {
                      id: "upi",
                      label: "UPI",
                      icon: Smartphone,
                    },

                    {
                      id: "card",
                      label: "Card",
                      icon: CreditCard,
                    },

                    {
                      id: "cash",
                      label: "Cash",
                      icon: Banknote,
                    },
                  ].map(
                    (p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setPayment(
                            p.label,
                          )
                        }
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                          payment ===
                          p.label
                            ? "border-coop-500 bg-coop-50"
                            : "border-navy-100 hover:border-navy-200"
                        }`}
                      >

                        <p.icon
                          size={20}
                          className="text-navy-500"
                        />

                        <span className="text-sm font-semibold text-navy-700">
                          {
                            p.label
                          }
                        </span>

                      </button>
                    ),
                  )}

                </div>

                {/* PAYMENT INFORMATION */}

                <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">

                  <div className="flex items-start gap-3">

                    {payment ===
                    "Cash" ? (
                      <Banknote
                        size={20}
                        className="text-green-600 shrink-0 mt-0.5"
                      />
                    ) : (
                      <ShieldCheck
                        size={20}
                        className="text-blue-600 shrink-0 mt-0.5"
                      />
                    )}

                    <div>

                      <p className="text-sm font-semibold text-navy-700">

                        {payment ===
                        "Cash"
                          ? "Cash Payment"
                          : "Secure Online Payment"}

                      </p>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                        {payment ===
                        "Cash"
                          ? "You will pay the worker directly after the service is completed."
                          : "You will be securely redirected to Razorpay Checkout when you place the booking request."}

                      </p>

                    </div>

                  </div>
                </div>

                {/* AMOUNT */}

                <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-coop-50 border border-coop-100">

                  <span className="text-sm font-semibold text-navy-700">
                    Total Amount
                  </span>

                  <div className="flex items-center gap-1 text-lg font-bold text-coop-700">
                    <IndianRupee
                      size={18}
                    />

                    {amount}
                  </div>

                </div>

              </div>
            )}

            {/* ================================================
                STEP 4 — CONFIRM
                ================================================= */}

            {step === 4 && (
              <div>

                <p className="font-semibold text-navy-700 mb-4">
                  Review your request
                </p>

                <div className="bg-navy-50 rounded-xl p-5 space-y-2 text-sm">

                  <Row
                    label="Worker"
                    value={
                      activeWorker.name
                    }
                  />

                  <Row
                    label="Service"
                    value={
                      service?.name
                    }
                  />

                  <Row
                    label="Date"
                    value={date?.toDateString()}
                  />

                  <Row
                    label="Time"
                    value={
                      time
                    }
                  />

                  <Row
                    label="Address"
                    value={
                      address
                    }
                  />

                  <Row
                    label="Payment"
                    value={
                      payment
                    }
                  />

                  <Row
                    label="Amount"
                    value={`₹${amount}`}
                    bold
                  />

                </div>

                {/* ONLINE PAYMENT NOTICE */}

                {payment !==
                  "Cash" && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">

                    <div className="flex gap-3">

                      <ShieldCheck
                        size={19}
                        className="text-blue-600 shrink-0"
                      />

                      <div>

                        <p className="text-sm font-semibold text-blue-800">
                          Secure Razorpay Payment
                        </p>

                        <p className="text-xs text-blue-700 mt-1">
                          Clicking{" "}
                          <strong>
                            Request Worker
                          </strong>{" "}
                          will open Razorpay
                          Checkout for{" "}
                          <strong>
                            ₹{amount}
                          </strong>
                          . Your booking request
                          will be sent after successful
                          payment verification.
                        </p>

                      </div>
                    </div>
                  </div>
                )}

                {payment ===
                  "Cash" && (
                  <p className="text-xs text-navy-300 mt-3">
                    You selected cash payment.
                    No online transaction will
                    be made.
                  </p>
                )}

                <p className="text-xs text-navy-300 mt-3">
                  Your request goes to{" "}
                  {activeWorker.name}{" "}
                  first — if they don't respond
                  within{" "}
                  {TIMEOUT_SECONDS}s, we'll
                  automatically try the next nearest
                  worker (up to{" "}
                  {MAX_ATTEMPTS} attempts).
                </p>

              </div>
            )}

            {/* ================================================
                NAVIGATION BUTTONS
                ================================================= */}

            <div className="flex justify-between mt-7">

              <Button
                variant="ghost"
                disabled={
                  step === 0 ||
                  paymentLoading ||
                  submitting
                }
                onClick={() =>
                  setStep(
                    (s) =>
                      Math.max(
                        0,
                        s - 1,
                      ),
                  )
                }
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  variant="primary"
                  disabled={
                    !canNext()
                  }
                  onClick={() =>
                    setStep(
                      (s) =>
                        s + 1,
                    )
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={
                    handleRequestWorker
                  }
                  disabled={
                    submitting ||
                    paymentLoading
                  }
                >

                  {paymentLoading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Opening Payment...
                    </>
                  ) : submitting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Sending Request...
                    </>
                  ) : payment ===
                    "Cash" ? (
                    "Request Worker"
                  ) : paymentCompleted ? (
                    "Request Worker"
                  ) : (
                    <>
                      <CreditCard
                        size={16}
                      />

                      Pay ₹
                      {amount} & Request
                    </>
                  )}

                </Button>
              )}

            </div>

          </>
        )}

      </div>
    </div>
  );
}

/* ============================================================
   ROW
   ============================================================ */

function Row({
  label,
  value,
  bold,
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-navy-400">
        {label}
      </span>

      <span
        className={`text-right text-navy-700 ${
          bold
            ? "font-bold"
            : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}