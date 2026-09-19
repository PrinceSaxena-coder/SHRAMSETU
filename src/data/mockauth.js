// ======================================================
// SHRAMSETU STATIC / MOCK DATA
// ======================================================
// This file contains frontend-only prototype data.
//
// Authentication utilities are NOT stored here.
// Authentication is handled by:
//     src/data/mockAuth.js
//
// Backend / MongoDB integration can be connected later.
// ======================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function notifyAuthChange() {
  window.dispatchEvent(new Event('auth:updated'));
}

function persistSession(user, token) {
  const safeUser = {
    ...user,
    authenticated: true,
    role: user?.role || user?.user?.role || 'customer',
    email: user?.email || user?.user?.email,
    name: user?.name || user?.user?.name,
  };

  localStorage.setItem('shramsetu_token', token || '');
  localStorage.setItem('shramsetu_user', JSON.stringify(safeUser));
  localStorage.setItem('ss_auth', JSON.stringify(safeUser));
  localStorage.setItem('ss_token', token || '');
  notifyAuthChange();
}

function clearSession() {
  localStorage.removeItem('shramsetu_token');
  localStorage.removeItem('shramsetu_user');
  localStorage.removeItem('ss_auth');
  localStorage.removeItem('ss_token');
  notifyAuthChange();
}

export async function getWorkers(category = '') {
  const params = new URLSearchParams();

  if (category) {
    params.set('category', category);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE}/workers${query}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch workers');
  }

  return Array.isArray(data.workers) ? data.workers : [];
}

export async function getNearbyWorkers({ latitude, longitude, radius, category } = {}) {
  const params = new URLSearchParams({ latitude, longitude, radius });

  if (category) {
    params.set('category', category);
  }

  const response = await fetch(`${API_BASE}/workers/nearby?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch nearby workers');
  }

  return Array.isArray(data.workers) ? data.workers : [];
}

export function logout() {
  clearSession();
}

export function getCurrentUser() {
  try {
    const savedUser = localStorage.getItem('shramsetu_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }

    const savedAuth = localStorage.getItem('ss_auth');
    if (!savedAuth) {
      return null;
    }

    return JSON.parse(savedAuth);
  } catch (error) {
    clearSession();
    return null;
  }
}

export async function refreshUser() {
  const token = localStorage.getItem('shramsetu_token');

  if (!token) {
    clearSession();
    return { success: false, message: 'No session available.' };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      clearSession();
      return { success: false, message: data?.message || 'Session expired.' };
    }

    const user = {
      ...data.user,
      id: data.user?.id || data.user?._id,
      authenticated: true,
      role: data.user?.role,
    };

    persistSession(user, token);

    return { success: true, user };
  } catch (error) {
    clearSession();
    return { success: false, message: 'Unable to refresh session.' };
  }
}

export async function login(email, password, role = 'customer') {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: String(email).trim(), password, role }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || 'Invalid email or password.',
      };
    }

    const token = data.token;
    const user = {
      ...data.user,
      id: data.user?.id || data.user?._id,
      authenticated: true,
      role: data.user?.role || role,
    };

    persistSession(user, token);

    return {
      success: true,
      token,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to log in. Please try again.',
    };
  }
}

export async function register(payload) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || 'Registration failed.',
      };
    }

    const token = data.token;
    const user = {
      ...data.user,
      id: data.user?.id || data.user?._id,
      authenticated: true,
      role: data.user?.role || payload.role,
    };

    persistSession(user, token);

    return {
      success: true,
      token,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to register. Please try again.',
    };
  }
}

export const TIME_SLOTS = [
  "9:00 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:00 PM",
  "7:00 PM",
];

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ======================================================
// SERVICE CATEGORIES
// ======================================================

export const CATEGORIES = [
  {
    id: "electrical",
    name: "Electrical",
    icon: "Zap",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "Wrench",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: "Hammer",
  },
  {
    id: "painting",
    name: "Painting",
    icon: "PaintRoller",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "Sparkles",
  },
  {
    id: "caregiving",
    name: "Caregiving",
    icon: "HeartHandshake",
  },
  {
    id: "driving",
    name: "Driving",
    icon: "Car",
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: "Flower2",
  },
  {
    id: "appliance",
    name: "Appliance Repair",
    icon: "Cog",
  },
];

// ======================================================
// COOPERATIVES
// ======================================================

export const COOPERATIVES = [
  {
    id: "coop-raj",
    name: "Rajasthan Labour Cooperative",
    members: 1240,
    activeWorkers: 860,
    services: 12,
    rating: 4.7,
  },
  {
    id: "coop-del",
    name: "Delhi Labour Cooperative",
    members: 980,
    activeWorkers: 640,
    services: 10,
    rating: 4.6,
  },
  {
    id: "coop-mh",
    name: "Maharashtra Labour Cooperative",
    members: 1510,
    activeWorkers: 1020,
    services: 14,
    rating: 4.8,
  },
  {
    id: "coop-guj",
    name: "Gujarat Labour Cooperative",
    members: 890,
    activeWorkers: 520,
    services: 9,
    rating: 4.5,
  },
];

// ======================================================
// SERVICES MENU
// ======================================================

export const SERVICES_MENU = [
  {
    id: "s1",
    category: "electrical",
    name: "Wiring Repair",
    basePrice: 250,
  },
  {
    id: "s2",
    category: "electrical",
    name: "Switchboard Installation",
    basePrice: 300,
  },
  {
    id: "s3",
    category: "plumbing",
    name: "Leak Fixing",
    basePrice: 220,
  },
  {
    id: "s4",
    category: "plumbing",
    name: "Pipe Installation",
    basePrice: 350,
  },
  {
    id: "s5",
    category: "carpentry",
    name: "Furniture Repair",
    basePrice: 300,
  },
  {
    id: "s6",
    category: "painting",
    name: "Room Painting",
    basePrice: 260,
  },
  {
    id: "s7",
    category: "cleaning",
    name: "Deep Home Cleaning",
    basePrice: 180,
  },
  {
    id: "s8",
    category: "caregiving",
    name: "Elderly Care (per visit)",
    basePrice: 400,
  },
  {
    id: "s9",
    category: "appliance",
    name: "Appliance Repair",
    basePrice: 280,
  },
];

// ======================================================
// AI DEMAND FORECAST
// Prototype / demo data.
// Later this can come from the AI/backend service.
// ======================================================

export const AI_DEMAND_FORECAST = [
  {
    skill: "Electrical",
    change: 24,
    trend: [40, 44, 48, 46, 52, 58, 62],
  },
  {
    skill: "Plumbing",
    change: 17,
    trend: [30, 32, 35, 33, 37, 39, 41],
  },
  {
    skill: "Caregiving",
    change: 31,
    trend: [20, 24, 27, 30, 34, 39, 44],
  },
  {
    skill: "Cleaning",
    change: 12,
    trend: [50, 51, 53, 52, 55, 56, 58],
  },
];

export const AI_RECOMMENDATIONS = [
  "Increase electrician availability in Zone A by 15% for the coming weekend.",
  "3 additional caregivers may be required during weekends in South Delhi.",
  "Plumbing demand expected to peak between 6 PM and 9 PM on weekdays.",
  "5 workers are currently underutilized and can be reassigned to high-demand zones.",
  "Painting requests typically rise 20% during the post-monsoon season.",
];

// ======================================================
// NEARBY MAP POSITIONS
// Temporary frontend/map data.
// Actual worker information can come from the API later.
// ======================================================

export const NEARBY_WORKERS = [
  {
    id: "n1",
    name: "Rajesh Kumar",
    skill: "Electrician",
    category: "electrical",
    distance: 1.2,
    top: 22,
    left: 38,
    rating: 4.8,
  },
  {
    id: "n2",
    name: "Amit Verma",
    skill: "Plumber",
    category: "plumbing",
    distance: 2.4,
    top: 55,
    left: 62,
    rating: 4.6,
  },
  {
    id: "n3",
    name: "Mohammed Arif",
    skill: "Carpenter",
    category: "carpentry",
    distance: 3.1,
    top: 70,
    left: 25,
    rating: 4.5,
  },
  {
    id: "n4",
    name: "Meena Patel",
    skill: "Cleaner",
    category: "cleaning",
    distance: 1.8,
    top: 35,
    left: 72,
    rating: 4.6,
  },
  {
    id: "n5",
    name: "Ravi Singh",
    skill: "Painter",
    category: "painting",
    distance: 4.0,
    top: 15,
    left: 60,
    rating: 4.4,
  },
];

// ======================================================
// EMERGENCY SERVICES
// ======================================================

export const EMERGENCY_TYPES = [
  {
    id: "e1",
    name: "Electrical Emergency",
    category: "electrical",
    icon: "Zap",
  },
  {
    id: "e2",
    name: "Plumbing Emergency",
    category: "plumbing",
    icon: "Wrench",
  },
  {
    id: "e3",
    name: "Caregiver Assistance",
    category: "caregiving",
    icon: "HeartHandshake",
  },
  {
    id: "e4",
    name: "Appliance Failure",
    category: "appliance",
    icon: "Cog",
  },
  {
    id: "e5",
    name: "Other",
    category: "electrical",
    icon: "AlertTriangle",
  },
];

// ======================================================
// LANGUAGES
// ======================================================

export const LANGUAGES = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "hi",
    label: "हिंदी",
  },
  {
    code: "mr",
    label: "मराठी",
  },
  {
    code: "bn",
    label: "বাংলা",
  },
  {
    code: "ta",
    label: "தமிழ்",
  },
];

// ======================================================
// TRANSLATIONS
// ======================================================

export const TRANSLATIONS = {
  en: {
    home: "Home",
    services: "Services",
    nearby: "Nearby",
    bookings: "Bookings",
    dashboard: "Dashboard",
    profile: "Profile",
  },

  hi: {
    home: "होम",
    services: "सेवाएं",
    nearby: "आस-पास",
    bookings: "बुकिंग",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
  },

  mr: {
    home: "मुख्यपृष्ठ",
    services: "सेवा",
    nearby: "जवळपास",
    bookings: "बुकिंग",
    dashboard: "डॅशबोर्ड",
    profile: "प्रोफाइल",
  },

  bn: {
    home: "হোম",
    services: "সেবা",
    nearby: "কাছাকাছি",
    bookings: "বুকিং",
    dashboard: "ড্যাশবোর্ড",
    profile: "প্রোফাইল",
  },

  ta: {
    home: "முகப்பு",
    services: "சேவைகள்",
    nearby: "அருகில்",
    bookings: "முன்பதிவுகள்",
    dashboard: "டாஷ்போர்டு",
    profile: "சுயவிவரம்",
  },
};

// ======================================================
// NOTIFICATIONS
// Temporary prototype data.
// ======================================================

export const DEFAULT_NOTIFICATIONS = [
  {
    id: "note1",
    text: "Your electrician booking is confirmed.",
    time: "5 min ago",
    read: false,
  },
  {
    id: "note2",
    text: "New worker request received.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "note3",
    text: "Your service has been completed.",
    time: "3 hr ago",
    read: true,
  },
  {
    id: "note4",
    text: "Payment received.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "note5",
    text: "New cooperative opportunity available.",
    time: "2 days ago",
    read: true,
  },
];

// ======================================================
// WELFARE INFORMATION
// Temporary prototype data.
// ======================================================

export const WELFARE_INFO = {
  insuranceStatus: "ACTIVE",
  coverage: 500000,
  welfareFund: 12500,
  membershipStatus: "ACTIVE",
  emergencySupport: "AVAILABLE",

  benefits: [
    "Group accident insurance coverage up to ₹5,00,000",
    "Cooperative welfare fund contribution matching",
    "Emergency medical assistance within 24 hours",
    "Skill upgrade training sponsored by the cooperative",
    "Pension contribution scheme for members above 5 years tenure",
  ],
};

// ======================================================
// JOB REQUESTS
// Temporary prototype data.
// ======================================================

export const JOB_REQUESTS = [
  {
    id: "jr1",
    customer: "Anita Sharma",
    service: "Wiring Repair",
    location: "Vaishali Nagar, Jaipur",
    date: "2026-08-22",
    time: "11:00 AM",
    distance: 1.4,
    earnings: 250,
  },

  {
    id: "jr2",
    customer: "Karan Mehta",
    service: "Switchboard Installation",
    location: "C-Scheme, Jaipur",
    date: "2026-08-22",
    time: "3:00 PM",
    distance: 3.2,
    earnings: 300,
  },

  {
    id: "jr3",
    customer: "Neha Agarwal",
    service: "Fan Installation",
    location: "Mansarovar, Jaipur",
    date: "2026-08-23",
    time: "10:00 AM",
    distance: 2.1,
    earnings: 180,
  },
];

// ======================================================
// ADMIN BOOKINGS
// Temporary prototype data.
// ======================================================

export const ADMIN_BOOKINGS = [
  {
    id: "BK-1001",
    customer: "Anita Sharma",
    worker: "Rajesh Kumar",
    service: "Wiring Repair",
    location: "Jaipur",
    date: "2026-08-20",
    amount: 250,
    status: "Completed",
  },

  {
    id: "BK-1002",
    customer: "Vikram Joshi",
    worker: "Amit Verma",
    service: "Leak Fixing",
    location: "Jaipur",
    date: "2026-08-21",
    amount: 220,
    status: "In Progress",
  },

  {
    id: "BK-1003",
    customer: "Meera Nair",
    worker: "Sunita Devi",
    service: "Deep Home Cleaning",
    location: "Mumbai",
    date: "2026-08-21",
    amount: 180,
    status: "Confirmed",
  },

  {
    id: "BK-1004",
    customer: "Falguni Patel",
    worker: "Mohammed Arif",
    service: "Furniture Repair",
    location: "Ahmedabad",
    date: "2026-08-19",
    amount: 300,
    status: "Cancelled",
  },

  {
    id: "BK-1005",
    customer: "Deepak Kulkarni",
    worker: "Arjun Yadav",
    service: "Appliance Repair",
    location: "Pune",
    date: "2026-08-20",
    amount: 280,
    status: "Completed",
  },
];

// ======================================================
// ADMIN ANALYTICS
// Temporary prototype data.
// ======================================================

export const MONTHLY_BOOKINGS = [120, 145, 132, 168, 190, 210, 238];

export const MONTHLY_REVENUE = [
  180000, 210000, 198000, 245000, 268000, 292000, 315000,
];

export const MOST_DEMANDED_SERVICES = [
  {
    name: "Electrical",
    value: 34,
  },
  {
    name: "Plumbing",
    value: 22,
  },
  {
    name: "Cleaning",
    value: 18,
  },
  {
    name: "Caregiving",
    value: 16,
  },
  {
    name: "Carpentry",
    value: 10,
  },
];
