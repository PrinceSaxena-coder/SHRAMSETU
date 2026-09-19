import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  IndianRupee,
  Heart,
  Bell,
  Star,
  ArrowRight,
  MapPin,
  Clock3,
  ShieldCheck,
  History,
  UserRound,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react'

import {
  StatCard,
  Button,
  StatusPill,
  Modal,
  RatingStars,
} from '../components/UI'

import {
  listBookings,
  submitRating as submitRatingApi,
  listNotifications,
} from '../api'

import { getWorkers } from '../api/workers'

export default function CustomerDashboard() {
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [workers, setWorkers] = useState([])

  const [loading, setLoading] = useState(true)

  const [rateTarget, setRateTarget] = useState(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [bookingsResult, notificationsResult, workersResult] =
          await Promise.all([
            listBookings(),
            listNotifications(),
            getWorkers(),
          ])

        if (!cancelled) {
          setBookings(Array.isArray(bookingsResult) ? bookingsResult : [])
          setNotifications(
            Array.isArray(notificationsResult)
              ? notificationsResult
              : []
          )
          setWorkers(Array.isArray(workersResult) ? workersResult : [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load customer dashboard:', error)

        if (!cancelled) {
          setBookings([])
          setNotifications([])
          setWorkers([])
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  /* =========================================================
     BOOKING GROUPS
  ========================================================= */

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === 'In Progress' ||
          b.status === 'Worker Assigned' ||
          b.status === 'On The Way' ||
          b.status === 'Arrived'
      ),
    [bookings]
  )

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === 'Confirmed' ||
          b.status === 'Scheduled'
      ),
    [bookings]
  )

  const previousBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === 'Completed' ||
          b.status === 'Cancelled'
      ),
    [bookings]
  )

  const totalSpend = useMemo(
    () =>
      bookings.reduce(
        (sum, b) => sum + Number(b.amount || 0),
        0
      ),
    [bookings]
  )

  /*
   * Until a real favourites system is connected,
   * retain the existing behaviour of showing the first
   * few workers as saved/frequently used workers.
   */
  const savedWorkers = workers.slice(0, 3)

  /*
   * Workers from previous completed bookings.
   * This gives the dashboard a lightweight preview.
   * The complete worker history will live in My Bookings.
   */
  const previousWorkers = useMemo(() => {
    const map = new Map()

    previousBookings.forEach((booking) => {
      if (!booking.workerName) return

      const key = booking.workerId || booking.workerName

      if (!map.has(key)) {
        map.set(key, {
          id: booking.workerId || key,
          name: booking.workerName,
          rating: booking.workerRating || booking.rating || 0,
          lastService: booking.date,
          service: booking.service,
        })
      }
    })

    return Array.from(map.values()).slice(0, 3)
  }, [previousBookings])

  /* =========================================================
     RATING
  ========================================================= */

  const submitRating = async () => {
    if (!rateTarget) return

    setSubmitting(true)

    try {
      await submitRatingApi({
        bookingId: rateTarget.id,
        worker: rateTarget.workerName,
        rating: ratingValue,
        review: reviewText,
      })

      setRateTarget(null)
      setReviewText('')
      setRatingValue(5)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="flex items-center justify-center min-h-[420px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
              <Loader2
                size={22}
                className="text-navy-600 animate-spin"
              />
            </div>

            <p className="font-display font-semibold text-navy-700">
              Loading your dashboard...
            </p>

            <p className="text-sm text-navy-400 mt-1">
              Getting your latest service information
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-8 pb-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coop-50 text-coop-700 text-xs font-semibold mb-3">
            <Sparkles size={13} />
            Customer Space
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy-700">
            Welcome back
          </h1>

          <p className="text-navy-400 text-sm mt-1">
            Here's a quick overview of your ShramSetu services.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/services')}
        >
          Book a Service
          <ArrowRight size={15} />
        </Button>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">

        <StatCard
          icon={CalendarCheck}
          label="Upcoming Bookings"
          value={upcomingBookings.length}
          color="navy"
        />

        <StatCard
          icon={IndianRupee}
          label="Total Spending"
          value={`₹${totalSpend}`}
          color="coop"
        />

        <StatCard
          icon={Heart}
          label="Saved Workers"
          value={savedWorkers.length}
          color="saffron"
        />

        <StatCard
          icon={Bell}
          label="Active Services"
          value={activeBookings.length}
          color="navy"
        />

      </div>

      {/* =====================================================
          ACTIVE SERVICE BANNER
      ===================================================== */}

      {activeBookings.length > 0 && (
        <div className="mt-7 rounded-2xl overflow-hidden border border-coop-200 bg-gradient-to-r from-coop-50 to-white">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-coop-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-navy-700">
                      Active Service
                    </p>

                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-coop-100 text-coop-700 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-coop-600 animate-pulse" />
                      In progress
                    </span>
                  </div>

                  {activeBookings[0]?.service && (
                    <p className="text-sm font-medium text-navy-600 mt-1">
                      {activeBookings[0].service}
                    </p>
                  )}

                  {activeBookings[0]?.workerName && (
                    <p className="text-xs text-navy-400 mt-1">
                      Worker: {activeBookings[0].workerName}
                    </p>
                  )}
                </div>

              </div>

              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard/bookings')}
              >
                Track Service
                <ArrowRight size={14} />
              </Button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid lg:grid-cols-3 gap-6 mt-7">

        {/* ===================================================
            LEFT / MAIN COLUMN
        =================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* -------------------------------------------------
              UPCOMING SERVICE PREVIEW
          ------------------------------------------------- */}

          <section>

            <div className="flex items-center justify-between mb-3">

              <div>
                <p className="font-display font-bold text-navy-700">
                  Upcoming Services
                </p>

                <p className="text-xs text-navy-400 mt-0.5">
                  Your next scheduled services
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="text-xs font-semibold text-coop-600 hover:text-coop-700 flex items-center gap-1"
              >
                View all
                <ChevronRight size={14} />
              </button>

            </div>

            {upcomingBookings.length === 0 ? (
              <div className="card p-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  <div>
                    <p className="font-semibold text-sm text-navy-700">
                      No upcoming services
                    </p>

                    <p className="text-xs text-navy-400 mt-1">
                      Need help at home? Find a verified worker.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => navigate('/services')}
                  >
                    Find a Service
                  </Button>

                </div>

              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <DashboardBookingCard
                    key={booking.id}
                    booking={booking}
                    onView={() => navigate('/dashboard/bookings')}
                  />
                ))}
              </div>
            )}

          </section>

          {/* -------------------------------------------------
              PREVIOUS BOOKINGS PREVIEW
          ------------------------------------------------- */}

          <section>

            <div className="flex items-center justify-between mb-3">

              <div>
                <p className="font-display font-bold text-navy-700">
                  Recent Service History
                </p>

                <p className="text-xs text-navy-400 mt-0.5">
                  Your most recent completed services
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="text-xs font-semibold text-coop-600 hover:text-coop-700 flex items-center gap-1"
              >
                Full history
                <ChevronRight size={14} />
              </button>

            </div>

            {previousBookings.length === 0 ? (
              <div className="card p-6 text-sm text-navy-400">
                Your completed services will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {previousBookings.slice(0, 3).map((booking) => (
                  <PreviousBookingPreview
                    key={booking.id}
                    booking={booking}
                    onRate={() => setRateTarget(booking)}
                  />
                ))}
              </div>
            )}

          </section>

        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <div className="space-y-6">

          {/* -------------------------------------------------
              SAVED / FREQUENT WORKERS
          ------------------------------------------------- */}

          <section className="card p-5">

            <div className="flex items-center justify-between mb-4">

              <div>
                <p className="font-display font-bold text-navy-700">
                  Saved Workers
                </p>

                <p className="text-xs text-navy-400 mt-0.5">
                  Workers you may want to use again
                </p>
              </div>

              <Heart
                size={17}
                className="text-saffron-500"
              />

            </div>

            {savedWorkers.length === 0 ? (
              <div className="text-sm text-navy-400">
                No saved workers yet.
              </div>
            ) : (
              <div className="space-y-4">

                {savedWorkers.map((worker) => (
                  <WorkerPreview
                    key={worker.id}
                    worker={worker}
                    onView={() =>
                      navigate(`/service/${worker.id}`)
                    }
                  />
                ))}

              </div>
            )}

          </section>

          {/* -------------------------------------------------
              PREVIOUS WORKERS
          ------------------------------------------------- */}

          {previousWorkers.length > 0 && (
            <section className="card p-5">

              <div className="flex items-center gap-2 mb-1">
                <History
                  size={17}
                  className="text-coop-600"
                />

                <p className="font-display font-bold text-navy-700">
                  Previous Workers
                </p>
              </div>

              <p className="text-xs text-navy-400 mb-4">
                Workers from your previous services
              </p>

              <div className="space-y-3">

                {previousWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3"
                  >

                    <WorkerAvatar worker={worker} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-700 truncate">
                        {worker.name}
                      </p>

                      <p className="text-[11px] text-navy-400 truncate">
                        {worker.service || 'Previous service'}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        navigate('/dashboard/bookings')
                      }
                      className="text-coop-600 hover:text-coop-700"
                      title="View booking history"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                ))}

              </div>

              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="w-full mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-coop-600 hover:text-coop-700 flex items-center justify-center gap-1"
              >
                View worker history
                <ArrowRight size={13} />
              </button>

            </section>
          )}

          {/* -------------------------------------------------
              NOTIFICATIONS
          ------------------------------------------------- */}

          <section className="card p-5">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">
                <Bell
                  size={17}
                  className="text-navy-600"
                />

                <p className="font-display font-bold text-navy-700">
                  Notifications
                </p>
              </div>

              {notifications.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-saffron-50 text-saffron-700">
                  {notifications.length}
                </span>
              )}

            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-navy-400">
                You're all caught up.
              </p>
            ) : (
              <div className="space-y-4">

                {notifications.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex gap-3"
                  >

                    <div className="w-2 h-2 rounded-full bg-coop-500 mt-1.5 shrink-0" />

                    <div className="min-w-0">
                      <p className="text-sm text-navy-600 leading-relaxed">
                        {notification.text}
                      </p>

                      <p className="text-[11px] text-navy-300 mt-1">
                        {notification.time}
                      </p>
                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>

        </div>

      </div>

      {/* =====================================================
          MY BOOKINGS CTA
      ===================================================== */}

      <div className="mt-8 rounded-2xl bg-navy-700 text-white p-5 sm:p-6 overflow-hidden relative">

        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-coop-500/10" />
        <div className="absolute right-20 -bottom-16 w-40 h-40 rounded-full bg-saffron-500/10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div>

            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck
                size={18}
                className="text-coop-400"
              />

              <span className="text-xs font-semibold text-coop-300 uppercase tracking-wide">
                Your Service History
              </span>
            </div>

            <h2 className="font-display font-bold text-lg sm:text-xl">
              Everything about your services in one place
            </h2>

            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track active workers, view previous bookings,
              revisit trusted workers and manage your service history.
            </p>

          </div>

          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard/bookings')}
            className="shrink-0"
          >
            Open My Bookings
            <ArrowRight size={15} />
          </Button>

        </div>

      </div>

      {/* =====================================================
          RATING MODAL
      ===================================================== */}

      <Modal
        open={!!rateTarget}
        onClose={() => setRateTarget(null)}
        title={`Rate ${rateTarget?.workerName || ''}`}
        footer={
          <Button
            variant="secondary"
            onClick={submitRating}
            disabled={submitting}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Rating'}
          </Button>
        }
      >

        <div className="space-y-4">

          <div>
            <p className="text-sm font-semibold text-navy-600 mb-2">
              Overall Rating
            </p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setRatingValue(number)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={
                      number <= ratingValue
                        ? 'fill-saffron-400 text-saffron-400'
                        : 'fill-gray-200 text-gray-200'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(event) =>
              setReviewText(event.target.value)
            }
            placeholder="Share your experience — service quality, punctuality, professionalism..."
            rows={3}
            className="input-field resize-none"
          />

        </div>

      </Modal>

    </div>
  )
}


/* =========================================================
   UPCOMING BOOKING PREVIEW
========================================================= */

function DashboardBookingCard({ booking, onView }) {
  return (
    <div className="card p-4 sm:p-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-start gap-3 min-w-0">

          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
            <CalendarCheck size={18} />
          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-navy-700 truncate">
                {booking.service || 'Service'}
              </p>

              <StatusPill status={booking.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-navy-400">

              {booking.workerName && (
                <span className="flex items-center gap-1">
                  <UserRound size={12} />
                  {booking.workerName}
                </span>
              )}

              {booking.date && (
                <span className="flex items-center gap-1">
                  <CalendarCheck size={12} />
                  {booking.date}
                </span>
              )}

              {booking.time && (
                <span className="flex items-center gap-1">
                  <Clock3 size={12} />
                  {booking.time}
                </span>
              )}

            </div>

            {booking.address && (
              <p className="text-[11px] text-navy-300 mt-1 truncate max-w-md">
                {booking.address}
              </p>
            )}

          </div>

        </div>

        <div className="flex items-center gap-3 shrink-0">

          {booking.amount !== undefined && (
            <p className="font-display font-bold text-navy-700">
              ₹{booking.amount}
            </p>
          )}

          <Button
            variant="ghost"
            className="!px-3"
            onClick={onView}
          >
            View
            <ChevronRight size={14} />
          </Button>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   PREVIOUS BOOKING PREVIEW
========================================================= */

function PreviousBookingPreview({ booking, onRate }) {
  return (
    <div className="card p-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="min-w-0">

          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-navy-700">
              {booking.service || 'Service'}
            </p>

            <StatusPill status={booking.status} />
          </div>

          <p className="text-xs text-navy-400 mt-1">
            {booking.workerName || 'Worker not available'}
            {booking.date && ` · ${booking.date}`}
          </p>

        </div>

        <div className="flex items-center gap-2 shrink-0">

          {booking.amount !== undefined && (
            <span className="font-semibold text-sm text-navy-700">
              ₹{booking.amount}
            </span>
          )}

          {booking.status === 'Completed' && (
            <Button
              variant="outline"
              onClick={onRate}
            >
              <Star size={14} />
              Rate
            </Button>
          )}

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   WORKER PREVIEW
========================================================= */

function WorkerPreview({ worker, onView }) {
  return (
    <div className="flex items-center gap-3">

      <WorkerAvatar worker={worker} />

      <div className="flex-1 min-w-0">

        <p className="text-sm font-semibold text-navy-700 truncate">
          {worker.name || 'Worker'}
        </p>

        <div className="flex items-center gap-1 mt-0.5">
          <RatingStars
            rating={Number(worker.rating) || 0}
            size={11}
          />

          {worker.verified !== false && (
            <ShieldCheck
              size={12}
              className="text-coop-600 ml-1"
            />
          )}
        </div>

      </div>

      <button
        onClick={onView}
        className="w-8 h-8 rounded-lg hover:bg-slate-50 text-navy-400 hover:text-navy-700 flex items-center justify-center transition-colors"
        title="View worker"
      >
        <ChevronRight size={16} />
      </button>

    </div>
  )
}


/* =========================================================
   WORKER AVATAR
========================================================= */

function WorkerAvatar({ worker }) {
  const initials =
    worker?.name
      ?.split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'SW'

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
      style={{
        backgroundColor:
          worker?.avatarColor || '#1f2937',
      }}
    >
      {initials}
    </div>
  )
}