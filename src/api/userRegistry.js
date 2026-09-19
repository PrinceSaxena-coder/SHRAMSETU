const CUSTOMER_KEY =
  "ss_customer_registry";

const WORKER_KEY =
  "ss_worker_registry";

function read(key) {
  try {
    return JSON.parse(
      localStorage.getItem(key) || "[]"
    );
  } catch {
    return [];
  }
}

function write(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify(data)
  );
}

export function registerCustomer(
  customer
) {
  const customers =
    read(CUSTOMER_KEY);

  const existing =
    customers.find(
      (item) =>
        item.email === customer.email ||
        item.phone === customer.phone
    );

  if (existing) {
    return existing;
  }

  const record = {
    id: `CUS-${Date.now()}`,
    name: customer.name || "Customer",
    email: customer.email || "",
    phone: customer.phone || "",
    city: customer.city || "",
    address: customer.address || "",
    status: "active",
    bookingsCount: 0,
    createdAt:
      new Date().toISOString(),
  };

  customers.push(record);

  write(
    CUSTOMER_KEY,
    customers
  );

  window.dispatchEvent(
    new Event("shramsetu:data")
  );

  return record;
}

export function registerWorker(
  worker
) {
  const workers =
    read(WORKER_KEY);

  const existing =
    workers.find(
      (item) =>
        item.email === worker.email ||
        item.phone === worker.phone
    );

  if (existing) {
    return existing;
  }

  const record = {
    id: `WRK-${Date.now()}`,
    name:
      worker.name ||
      worker.fullName ||
      "Worker",
    email: worker.email || "",
    phone: worker.phone || "",
    skill: worker.skill || "",
    experience:
      worker.experience || 0,
    city: worker.city || "",
    address: worker.address || "",
    services: worker.services || "",
    serviceArea:
      worker.serviceArea || "",
    verificationStatus:
      "pending",
    suspended: false,
    joinedAt:
      new Date().toISOString(),
  };

  workers.push(record);

  write(
    WORKER_KEY,
    workers
  );

  window.dispatchEvent(
    new Event("shramsetu:data")
  );

  return record;
}