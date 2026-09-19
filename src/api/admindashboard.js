const KEYS = {
  workers: "ss_worker_registry",
  customers: "ss_customer_registry",
  bookings: "ss_bookings",
  workerProfile: "ss_worker_profile",
  workerJobs: "ss_worker_jobs",
  adminWorkers: "ss_admin_workers",
  disputes: "ss_disputes",
  welfare: "ss_welfare",
  activities: "ss_admin_activity",
};

const delay = (ms = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function read(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;

    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix = "SS") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* --------------------------------------------------
   WORKERS
-------------------------------------------------- */

export async function listAdminWorkers() {
  await delay();

  const registry = read(KEYS.workers, []);

  const profile = read(KEYS.workerProfile, null);

  const workers = [...registry];

  if (
    profile &&
    profile.fullName &&
    !workers.some(
      (worker) =>
        worker.email === profile.email ||
        worker.phone === profile.phone
    )
  ) {
    workers.push({
      id: profile.id || makeId("WRK"),
      name: profile.fullName,
      email: profile.email || "",
      phone: profile.phone || "",
      skill: profile.skill || "Service Worker",
      experience: profile.experience || 0,
      city: profile.city || "",
      address: profile.address || "",
      services: profile.services || "",
      serviceArea: profile.serviceArea || "",
      verificationStatus:
        profile.verificationStatus || "pending",
      joinedAt:
        profile.submittedAt ||
        new Date().toISOString(),
      rating: profile.rating || 0,
      jobsCompleted: profile.jobsCompleted || 0,
      suspended: Boolean(profile.suspended),
    });
  }

  return workers;
}

/* --------------------------------------------------
   CUSTOMERS
-------------------------------------------------- */

export async function listAdminCustomers() {
  await delay();

  return read(KEYS.customers, []);
}

/* --------------------------------------------------
   BOOKINGS
-------------------------------------------------- */

export async function listAdminBookings() {
  await delay();

  const bookings = read(KEYS.bookings, []);

  return Array.isArray(bookings) ? bookings : [];
}

/* --------------------------------------------------
   KYC
-------------------------------------------------- */

export async function updateWorkerVerification(
  workerId,
  status,
  adminNote = ""
) {
  await delay();

  const workers = await listAdminWorkers();

  const worker = workers.find(
    (item) => String(item.id) === String(workerId)
  );

  if (!worker) {
    return {
      success: false,
      message: "Worker not found.",
    };
  }

  const updatedWorker = {
    ...worker,
    verificationStatus: status,
    adminNote,
    reviewedAt: new Date().toISOString(),
  };

  const registry = read(KEYS.workers, []);

  const index = registry.findIndex(
    (item) => String(item.id) === String(workerId)
  );

  if (index >= 0) {
    registry[index] = updatedWorker;
    write(KEYS.workers, registry);
  }

  /* Update shared worker profile */
  const profile = read(KEYS.workerProfile, null);

  if (
    profile &&
    (
      String(profile.id) === String(workerId) ||
      profile.phone === worker.phone
    )
  ) {
    write(KEYS.workerProfile, {
      ...profile,
      verificationStatus: status,
      adminNote,
      reviewedAt: new Date().toISOString(),
    });
  }

  addAdminActivity({
    type: "kyc",
    message:
      status === "verified"
        ? `${worker.name} was verified`
        : `${worker.name} KYC was rejected`,
  });

  window.dispatchEvent(new Event("shramsetu:data"));

  return {
    success: true,
    worker: updatedWorker,
  };
}

/* --------------------------------------------------
   SUSPEND / ACTIVATE WORKER
-------------------------------------------------- */

export async function toggleWorkerSuspension(workerId) {
  await delay();

  const workers = await listAdminWorkers();

  const worker = workers.find(
    (item) => String(item.id) === String(workerId)
  );

  if (!worker) {
    return {
      success: false,
      message: "Worker not found.",
    };
  }

  const updated = {
    ...worker,
    suspended: !worker.suspended,
  };

  const registry = read(KEYS.workers, []);

  const index = registry.findIndex(
    (item) => String(item.id) === String(workerId)
  );

  if (index >= 0) {
    registry[index] = updated;
    write(KEYS.workers, registry);
  }

  const profile = read(KEYS.workerProfile, null);

  if (
    profile &&
    (
      String(profile.id) === String(workerId) ||
      profile.phone === worker.phone
    )
  ) {
    write(KEYS.workerProfile, {
      ...profile,
      suspended: updated.suspended,
    });
  }

  addAdminActivity({
    type: "worker",
    message: updated.suspended
      ? `${worker.name} was suspended`
      : `${worker.name} was reactivated`,
  });

  window.dispatchEvent(new Event("shramsetu:data"));

  return {
    success: true,
    worker: updated,
  };
}

/* --------------------------------------------------
   BOOKING STATUS
-------------------------------------------------- */

export async function updateAdminBookingStatus(
  bookingId,
  status
) {
  await delay();

  const bookings = read(KEYS.bookings, []);

  const index = bookings.findIndex(
    (booking) =>
      String(
        booking.id ||
          booking.bookingId
      ) === String(bookingId)
  );

  if (index === -1) {
    return {
      success: false,
      message: "Booking not found.",
    };
  }

  bookings[index] = {
    ...bookings[index],
    status,
    adminUpdatedAt: new Date().toISOString(),
  };

  write(KEYS.bookings, bookings);

  addAdminActivity({
    type: "booking",
    message: `Booking ${bookingId} changed to ${status}`,
  });

  window.dispatchEvent(new Event("shramsetu:data"));

  return {
    success: true,
    booking: bookings[index],
  };
}

/* --------------------------------------------------
   DISPUTES
-------------------------------------------------- */

export async function listDisputes() {
  await delay();

  return read(KEYS.disputes, []);
}

export async function updateDispute(
  disputeId,
  status
) {
  await delay();

  const disputes = read(KEYS.disputes, []);

  const index = disputes.findIndex(
    (item) => String(item.id) === String(disputeId)
  );

  if (index === -1) {
    return {
      success: false,
      message: "Dispute not found.",
    };
  }

  disputes[index] = {
    ...disputes[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  write(KEYS.disputes, disputes);

  addAdminActivity({
    type: "dispute",
    message: `Dispute ${disputeId} marked ${status}`,
  });

  window.dispatchEvent(new Event("shramsetu:data"));

  return {
    success: true,
  };
}

/* --------------------------------------------------
   ACTIVITY LOG
-------------------------------------------------- */

export function addAdminActivity(activity) {
  const activities = read(KEYS.activities, []);

  activities.unshift({
    id: makeId("ACT"),
    ...activity,
    createdAt: new Date().toISOString(),
  });

  write(
    KEYS.activities,
    activities.slice(0, 50)
  );
}

export async function listAdminActivities() {
  await delay();

  return read(KEYS.activities, []);
}

/* --------------------------------------------------
   DASHBOARD SUMMARY
-------------------------------------------------- */

export async function getAdminSummary() {
  const [
    workers,
    customers,
    bookings,
    disputes,
  ] = await Promise.all([
    listAdminWorkers(),
    listAdminCustomers(),
    listAdminBookings(),
    listDisputes(),
  ]);

  const verifiedWorkers = workers.filter(
    (worker) =>
      worker.verificationStatus === "verified" &&
      !worker.suspended
  );

  const pendingKYC = workers.filter(
    (worker) =>
      worker.verificationStatus === "pending"
  );

  const activeBookings = bookings.filter(
    (booking) =>
      [
        "Confirmed",
        "Accepted",
        "In Progress",
        "ongoing",
        "accepted",
        "in-progress",
      ].includes(booking.status)
  );

  const completedBookings = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "cancelled"
  );

  const revenue = completedBookings.reduce(
    (total, booking) =>
      total +
      Number(
        booking.totalAmount ||
          booking.amount ||
          booking.price ||
          0
      ),
    0
  );

  const workerEarnings =
    revenue * 0.85;

  return {
    totalWorkers: workers.length,
    verifiedWorkers: verifiedWorkers.length,
    pendingKYC: pendingKYC.length,

    totalCustomers: customers.length,

    totalBookings: bookings.length,
    activeBookings: activeBookings.length,
    completedBookings: completedBookings.length,
    cancelledBookings: cancelledBookings.length,

    revenue,
    workerEarnings,

    openDisputes: disputes.filter(
      (item) =>
        String(item.status).toLowerCase() ===
        "open"
    ).length,
  };
}