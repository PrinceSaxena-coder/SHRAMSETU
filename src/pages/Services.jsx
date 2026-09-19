import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  Plus,
  Check,
  Star,
  ShieldCheck,
  MapPin,
  Clock3,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  SprayCan,
  HeartHandshake,
  Car,
  Leaf,
  Snowflake,
  ArrowRight,
  Package,
  ShoppingBag,
} from 'lucide-react'

import WorkerCard from '../components/WorkerCard'
import { getWorkers } from '../api'
import { CATEGORIES } from '../data/mockauth'

/* =========================================================
   SERVICE CATALOGUE
   ========================================================= */

const SERVICE_DETAILS = {
  electrical: {
    icon: Zap,
    color: 'bg-amber-50 text-amber-600',
    subServices: [
      {
        id: 'fan-installation',
        name: 'Fan Installation',
        description:
          'Installation and replacement of ceiling and exhaust fans.',
        price: '₹250–₹500',
        duration: '30–60 min',
        equipment: [
          {
            id: 'electrical-tester',
            name: 'Digital Electrical Tester',
            price: 249,
            purpose: 'For checking electrical connections safely.',
          },
          {
            id: 'insulation-tape',
            name: 'Electrical Insulation Tape',
            price: 59,
            purpose: 'For insulating electrical connections.',
          },
          {
            id: 'wire-connectors',
            name: 'Wire Connector Set',
            price: 129,
            purpose: 'Useful for secure wire connections.',
          },
        ],
      },
      {
        id: 'switch-repair',
        name: 'Switch & Socket Repair',
        description:
          'Repair or replacement of damaged switches and sockets.',
        price: '₹150–₹400',
        duration: '20–45 min',
        equipment: [
          {
            id: 'modular-switch',
            name: 'Modular Switch',
            price: 99,
            purpose: 'Replacement for damaged wall switches.',
          },
          {
            id: 'socket',
            name: '16A Electrical Socket',
            price: 149,
            purpose: 'Replacement socket for household appliances.',
          },
        ],
      },
      {
        id: 'wiring',
        name: 'Electrical Wiring',
        description:
          'Minor wiring, rewiring and connection work.',
        price: '₹300–₹1,500',
        duration: '1–3 hrs',
        equipment: [
          {
            id: 'copper-wire',
            name: 'Copper Wire',
            price: 399,
            purpose: 'For household electrical connections.',
          },
          {
            id: 'insulation-tape-2',
            name: 'Insulation Tape Pack',
            price: 89,
            purpose: 'For electrical insulation.',
          },
        ],
      },
      {
        id: 'light-installation',
        name: 'Light Installation',
        description:
          'Installation of lights, fixtures and LED fittings.',
        price: '₹200–₹600',
        duration: '30–60 min',
        equipment: [
          {
            id: 'led-bulb',
            name: 'LED Bulb',
            price: 149,
            purpose: 'Energy-efficient lighting replacement.',
          },
          {
            id: 'ceiling-fixture',
            name: 'Ceiling Light Fixture',
            price: 499,
            purpose: 'Replacement or new ceiling installation.',
          },
        ],
      },
    ],
  },

  plumbing: {
    icon: Droplets,
    color: 'bg-blue-50 text-blue-600',
    subServices: [
      {
        id: 'tap-repair',
        name: 'Tap & Faucet Repair',
        description:
          'Repair leaking, loose or damaged taps and faucets.',
        price: '₹200–₹500',
        duration: '30–60 min',
        equipment: [
          {
            id: 'ptfe-tape',
            name: 'PTFE / Teflon Tape',
            price: 49,
            purpose: 'Helps seal threaded plumbing connections.',
          },
          {
            id: 'washer-set',
            name: 'Faucet Washer Set',
            price: 99,
            purpose: 'Replacement washers for common faucet leaks.',
          },
          {
            id: 'flexible-hose',
            name: 'Flexible Water Hose',
            price: 149,
            purpose: 'For replacing damaged flexible connections.',
          },
        ],
      },
      {
        id: 'pipe-leakage',
        name: 'Pipe Leakage',
        description:
          'Detection and repair of visible water pipe leaks.',
        price: '₹300–₹1,000',
        duration: '45–90 min',
        equipment: [
          {
            id: 'pipe-sealant',
            name: 'Pipe Thread Sealant',
            price: 179,
            purpose: 'For sealing suitable threaded connections.',
          },
          {
            id: 'ptfe-tape-2',
            name: 'PTFE Tape Pack',
            price: 49,
            purpose: 'For threaded pipe joints.',
          },
          {
            id: 'pipe-clamp',
            name: 'Pipe Repair Clamp',
            price: 199,
            purpose: 'Temporary repair support for suitable pipe leaks.',
          },
        ],
      },
      {
        id: 'drain-cleaning',
        name: 'Drain Cleaning',
        description:
          'Cleaning and unclogging of household drains.',
        price: '₹250–₹600',
        duration: '30–60 min',
        equipment: [
          {
            id: 'drain-auger',
            name: 'Drain Cleaning Tool',
            price: 299,
            purpose: 'For basic household drain blockage removal.',
          },
          {
            id: 'rubber-plunger',
            name: 'Heavy-Duty Plunger',
            price: 199,
            purpose: 'For common sink and drain blockages.',
          },
        ],
      },
      {
        id: 'bathroom-fitting',
        name: 'Bathroom Fitting',
        description:
          'Installation of bathroom fixtures and fittings.',
        price: '₹300–₹1,500',
        duration: '1–3 hrs',
        equipment: [
          {
            id: 'flexible-hose-2',
            name: 'Flexible Hose',
            price: 149,
            purpose: 'For suitable water connections.',
          },
          {
            id: 'sealant',
            name: 'Bathroom Sealant',
            price: 229,
            purpose: 'For sealing suitable bathroom joints.',
          },
        ],
      },
    ],
  },

  carpentry: {
    icon: Hammer,
    color: 'bg-orange-50 text-orange-600',
    subServices: [
      {
        id: 'furniture-repair',
        name: 'Furniture Repair',
        description:
          'Repair chairs, tables, beds and household furniture.',
        price: '₹300–₹1,500',
        duration: '1–3 hrs',
        equipment: [
          {
            id: 'wood-adhesive',
            name: 'Wood Adhesive',
            price: 159,
            purpose: 'For suitable furniture repair work.',
          },
          {
            id: 'screw-kit',
            name: 'Wood Screw Kit',
            price: 199,
            purpose: 'Replacement screws for furniture repair.',
          },
        ],
      },
      {
        id: 'door-repair',
        name: 'Door Repair',
        description:
          'Door alignment, hinge and minor repair work.',
        price: '₹250–₹900',
        duration: '45–90 min',
        equipment: [
          {
            id: 'hinge-set',
            name: 'Door Hinge Set',
            price: 199,
            purpose: 'Replacement hinges for suitable doors.',
          },
          {
            id: 'wood-screws',
            name: 'Wood Screws',
            price: 99,
            purpose: 'For common wood fixture repairs.',
          },
        ],
      },
      {
        id: 'shelf-installation',
        name: 'Shelf Installation',
        description:
          'Installation of wall shelves and storage fixtures.',
        price: '₹300–₹700',
        duration: '45–90 min',
        equipment: [
          {
            id: 'wall-plugs',
            name: 'Wall Plug & Screw Set',
            price: 129,
            purpose: 'For suitable wall mounting applications.',
          },
          {
            id: 'shelf-brackets',
            name: 'Shelf Bracket Pair',
            price: 249,
            purpose: 'Supports suitable wall-mounted shelves.',
          },
        ],
      },
    ],
  },

  painting: {
    icon: Paintbrush,
    color: 'bg-purple-50 text-purple-600',
    subServices: [
      {
        id: 'wall-painting',
        name: 'Wall Painting',
        description:
          'Interior wall painting for rooms and living spaces.',
        price: '₹1,500+',
        duration: '1–2 days',
        equipment: [
          {
            id: 'paint-roller',
            name: 'Paint Roller',
            price: 199,
            purpose: 'For smooth wall paint application.',
          },
          {
            id: 'masking-tape',
            name: "Painter's Masking Tape",
            price: 99,
            purpose: 'Helps protect edges during painting.',
          },
          {
            id: 'paint-tray',
            name: 'Paint Tray',
            price: 149,
            purpose: 'For holding paint during roller application.',
          },
        ],
      },
      {
        id: 'touch-up',
        name: 'Wall Touch-Up',
        description:
          'Small-area paint correction and touch-up work.',
        price: '₹300–₹800',
        duration: '1–3 hrs',
        equipment: [
          {
            id: 'small-roller',
            name: 'Mini Paint Roller',
            price: 129,
            purpose: 'For small paint correction areas.',
          },
          {
            id: 'putty',
            name: 'Wall Repair Putty',
            price: 179,
            purpose: 'For suitable minor surface repairs.',
          },
        ],
      },
    ],
  },

  cleaning: {
    icon: SprayCan,
    color: 'bg-cyan-50 text-cyan-600',
    subServices: [
      {
        id: 'deep-cleaning',
        name: 'Home Deep Cleaning',
        description:
          'Detailed cleaning of rooms, surfaces and common areas.',
        price: '₹999+',
        duration: '2–5 hrs',
        equipment: [
          {
            id: 'microfiber-pack',
            name: 'Microfiber Cloth Pack',
            price: 199,
            purpose: 'Reusable cloths for surface cleaning.',
          },
          {
            id: 'surface-cleaner',
            name: 'Multi-Surface Cleaner',
            price: 179,
            purpose: 'For suitable household surfaces.',
          },
          {
            id: 'cleaning-brush',
            name: 'Household Cleaning Brush Set',
            price: 249,
            purpose: 'For detailed cleaning of difficult areas.',
          },
        ],
      },
      {
        id: 'kitchen-cleaning',
        name: 'Kitchen Cleaning',
        description:
          'Cleaning of kitchen surfaces, cabinets and common areas.',
        price: '₹499+',
        duration: '1–3 hrs',
        equipment: [
          {
            id: 'degreaser',
            name: 'Kitchen Degreaser',
            price: 199,
            purpose: 'For suitable grease removal.',
          },
          {
            id: 'microfiber-pack-2',
            name: 'Microfiber Cleaning Pack',
            price: 199,
            purpose: 'For reusable surface cleaning.',
          },
        ],
      },
      {
        id: 'bathroom-cleaning',
        name: 'Bathroom Cleaning',
        description:
          'Deep cleaning of bathroom surfaces and fixtures.',
        price: '₹399+',
        duration: '1–2 hrs',
        equipment: [
          {
            id: 'bathroom-cleaner',
            name: 'Bathroom Surface Cleaner',
            price: 179,
            purpose: 'For suitable bathroom surfaces.',
          },
          {
            id: 'scrub-brush',
            name: 'Scrub Brush Set',
            price: 149,
            purpose: 'For detailed surface cleaning.',
          },
        ],
      },
    ],
  },

  caregiving: {
    icon: HeartHandshake,
    color: 'bg-rose-50 text-rose-600',
    subServices: [
      {
        id: 'elder-care',
        name: 'Elder Care Assistance',
        description:
          'Companionship and everyday assistance for elderly people.',
        price: '₹500+/visit',
        duration: 'As scheduled',
        equipment: [],
      },
      {
        id: 'patient-care',
        name: 'Patient Care Assistance',
        description:
          'Non-clinical everyday support and assistance.',
        price: '₹600+/visit',
        duration: 'As scheduled',
        equipment: [],
      },
    ],
  },

  driving: {
    icon: Car,
    color: 'bg-indigo-50 text-indigo-600',
    subServices: [
      {
        id: 'personal-driver',
        name: 'Personal Driver',
        description:
          'Verified drivers for scheduled local requirements.',
        price: '₹400+/trip',
        duration: 'As scheduled',
        equipment: [],
      },
      {
        id: 'outstation-driver',
        name: 'Outstation Driver',
        description:
          'Driver assistance for longer-distance journeys.',
        price: 'Custom',
        duration: 'As scheduled',
        equipment: [],
      },
    ],
  },

  gardening: {
    icon: Leaf,
    color: 'bg-green-50 text-green-600',
    subServices: [
      {
        id: 'garden-maintenance',
        name: 'Garden Maintenance',
        description:
          'Routine garden cleaning, pruning and maintenance.',
        price: '₹300+',
        duration: '1–2 hrs',
        equipment: [
          {
            id: 'pruning-shear',
            name: 'Garden Pruning Shears',
            price: 299,
            purpose: 'For trimming suitable plants and branches.',
          },
          {
            id: 'gardening-gloves',
            name: 'Gardening Gloves',
            price: 149,
            purpose: 'Basic hand protection for gardening.',
          },
        ],
      },
      {
        id: 'plant-care',
        name: 'Plant Care',
        description:
          'Plant maintenance, repotting and basic care.',
        price: '₹250+',
        duration: '1–2 hrs',
        equipment: [
          {
            id: 'plant-pot',
            name: 'Plant Pot',
            price: 249,
            purpose: 'For suitable plant repotting.',
          },
          {
            id: 'garden-tool-set',
            name: 'Garden Tool Set',
            price: 399,
            purpose: 'Basic tools for plant maintenance.',
          },
        ],
      },
    ],
  },

  'appliance-repair': {
    icon: Snowflake,
    color: 'bg-sky-50 text-sky-600',
    subServices: [
      {
        id: 'ac-service',
        name: 'AC Service',
        description:
          'Inspection and routine servicing of air conditioners.',
        price: '₹499+',
        duration: '1–2 hrs',
        equipment: [
          {
            id: 'ac-cleaning-spray',
            name: 'AC Cleaning Solution',
            price: 299,
            purpose: 'For suitable AC cleaning work.',
          },
        ],
      },
      {
        id: 'washing-machine',
        name: 'Washing Machine Repair',
        description:
          'Inspection and repair of common washing machine issues.',
        price: '₹350+',
        duration: '1–2 hrs',
        equipment: [
          {
            id: 'universal-hose',
            name: 'Universal Drain Hose',
            price: 249,
            purpose: 'Replacement for compatible damaged hoses.',
          },
        ],
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator Repair',
        description:
          'Inspection of common refrigerator problems.',
        price: '₹350+',
        duration: '1–2 hrs',
        equipment: [],
      },
    ],
  },
}

/* =========================================================
   CATEGORY HELPERS
   ========================================================= */

const normalizeCategory = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

const getCategoryDetails = (category) => {
  if (!category) return null

  const id = normalizeCategory(
    category.id || category.name
  )

  if (SERVICE_DETAILS[id]) {
    return SERVICE_DETAILS[id]
  }

  const aliases = {
    electrical: 'electrical',
    electrician: 'electrical',

    plumbing: 'plumbing',
    plumber: 'plumbing',

    carpentry: 'carpentry',
    carpenter: 'carpentry',

    painting: 'painting',
    painter: 'painting',

    cleaning: 'cleaning',
    cleaner: 'cleaning',

    caregiving: 'caregiving',
    'care-giving': 'caregiving',
    caregiver: 'caregiving',

    driving: 'driving',
    driver: 'driving',

    gardening: 'gardening',
    gardener: 'gardening',

    'appliance-repair': 'appliance-repair',
    appliance: 'appliance-repair',
    'appliance-technician': 'appliance-repair',
  }

  const key = aliases[id]

  return key ? SERVICE_DETAILS[key] : null
}

/* =========================================================
   WORKER NORMALIZER
   ---------------------------------------------------------
   WorkerCard expects some fields to exist.
   This prevents undefined.includes() errors.
   ========================================================= */

const normalizeWorker = (worker, index) => {
  const safeWorker = worker || {}

  const rawServices = Array.isArray(safeWorker.services)
    ? safeWorker.services
    : Array.isArray(safeWorker.skills)
      ? safeWorker.skills
      : []

  const categoryValue =
    safeWorker.category ||
    safeWorker.serviceCategory ||
    safeWorker.skill ||
    ''

  const categoryId = normalizeCategory(categoryValue)

  const services = rawServices.length
    ? rawServices.filter(Boolean)
    : [
        safeWorker.skill,
        safeWorker.category,
      ].filter(Boolean)

  const locationValue =
    typeof safeWorker.location === 'string'
      ? safeWorker.location
      : safeWorker.address ||
        safeWorker.city ||
        'Jaipur'

  return {
    ...safeWorker,

    id:
      safeWorker.id ||
      safeWorker._id ||
      `mock-worker-${index + 1}`,

    name:
      safeWorker.name ||
      safeWorker.fullName ||
      'Verified Worker',

    skill:
      safeWorker.skill ||
      safeWorker.primarySkill ||
      safeWorker.category ||
      'Home Services',

    category: categoryId,

    rating:
      Number(safeWorker.rating) || 4.5,

    price:
      Number(safeWorker.price) || 300,

    availability:
      safeWorker.availability ||
      (safeWorker.isAvailable ? 'Available today' : 'Busy today'),

    location: locationValue,
    distance:
      Number(safeWorker.distance) ||
      Number(safeWorker.distanceKm) ||
      3,
    jobsCompleted:
      Number(safeWorker.jobsCompleted) ||
      Number(safeWorker.completedJobs) ||
      18,
    cooperative:
      safeWorker.cooperative ||
      safeWorker.cooperativeName ||
      'ShramSetu Cooperative',

    services,

    // Important for WorkerCard compatibility
    skills: Array.isArray(safeWorker.skills)
      ? safeWorker.skills
      : services,

    serviceTypes: Array.isArray(
      safeWorker.serviceTypes
    )
      ? safeWorker.serviceTypes
      : services,

    verified:
      safeWorker.verified !== false,
  }
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Services() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const initialCategory =
    params.get('category') || 'all'

  const [query, setQuery] = useState('')
  const [category, setCategory] =
    useState(initialCategory)

  const [selectedSubService, setSelectedSubService] =
    useState(null)

  const [minRating, setMinRating] =
    useState(0)

  const [maxPrice, setMaxPrice] =
    useState(500)

  const [availableOnly, setAvailableOnly] =
    useState(false)

  const [location, setLocation] =
    useState('')

  const [showFilters, setShowFilters] =
    useState(false)

  const [expandedCategory, setExpandedCategory] =
    useState(
      initialCategory !== 'all'
        ? initialCategory
        : null
    )

  const [cart, setCart] = useState([])
  const [workers, setWorkers] = useState([])
  const [workersLoading, setWorkersLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadWorkers() {
      setWorkersLoading(true)

      try {
        const nextWorkers = await getWorkers(
          category === 'all' ? undefined : category
        )

        if (!isActive) return

        setWorkers(Array.isArray(nextWorkers) ? nextWorkers.map(normalizeWorker) : [])
      } catch (error) {
        console.error('Unable to load workers from backend:', error)

        if (isActive) {
          setWorkers([])
        }
      } finally {
        if (isActive) {
          setWorkersLoading(false)
        }
      }
    }

    loadWorkers()

    return () => {
      isActive = false
    }
  }, [category])

  /* =========================================================
     WORKERS
     ========================================================= */

  /* =========================================================
     CATEGORIES
     ========================================================= */

  const visibleCategories = useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      details: getCategoryDetails(c),
    }))
  }, [])

  const activeCategory = useMemo(() => {
    if (category === 'all') return null

    return visibleCategories.find(
      (c) => c.id === category
    )
  }, [category, visibleCategories])

  /* =========================================================
     SEARCH
     ========================================================= */

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const search = query
      .toLowerCase()
      .trim()

    const results = []

    visibleCategories.forEach((cat) => {
      const categoryName =
        String(cat.name || '').toLowerCase()

      if (categoryName.includes(search)) {
        results.push({
          type: 'category',
          category: cat,
          subService: null,
        })
      }

      cat.details?.subServices?.forEach(
        (sub) => {
          const name =
            String(sub.name || '').toLowerCase()

          const description =
            String(sub.description || '').toLowerCase()

          if (
            name.includes(search) ||
            description.includes(search)
          ) {
            results.push({
              type: 'subservice',
              category: cat,
              subService: sub,
            })
          }
        }
      )
    })

    return results.slice(0, 8)
  }, [query, visibleCategories])

  /* =========================================================
     WORKER FILTER
     ========================================================= */

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const workerCategory =
        normalizeCategory(
          worker.category ||
            worker.skill ||
            ''
        )

      const workerServices = Array.isArray(
        worker.services
      )
        ? worker.services
        : []

      /* Category */

      if (
        category !== 'all' &&
        workerCategory !==
          normalizeCategory(category) &&
        !workerServices.some(
          (service) =>
            normalizeCategory(service) ===
            normalizeCategory(category)
        )
      ) {
        return false
      }

      /* Search */

      if (query.trim()) {
        const searchable = [
          worker.name,
          worker.skill,
          worker.category,
          ...workerServices,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (
          !searchable.includes(
            query.toLowerCase()
          )
        ) {
          return false
        }
      }

      /* Rating */

      if (
        Number(worker.rating || 0) <
        minRating
      ) {
        return false
      }

      /* Price */

      if (
        worker.price !== undefined &&
        Number(worker.price) > maxPrice
      ) {
        return false
      }

      /* Availability */

      if (
        availableOnly &&
        !String(
          worker.availability || ''
        )
          .toLowerCase()
          .includes('today')
      ) {
        return false
      }

      /* Location */

      if (
        location.trim() &&
        !String(
          worker.location || ''
        )
          .toLowerCase()
          .includes(
            location.toLowerCase()
          )
      ) {
        return false
      }

      return true
    })
  }, [
    workers,
    query,
    category,
    minRating,
    maxPrice,
    availableOnly,
    location,
  ])

  /* =========================================================
     HANDLERS
     ========================================================= */

  const setCategoryAndUrl = (id) => {
    setCategory(id)
    setSelectedSubService(null)

    setParams(
      id === 'all'
        ? {}
        : { category: id }
    )

    setExpandedCategory(
      id === 'all' ? null : id
    )
  }

  const selectSubService = (
    categoryItem,
    subService
  ) => {
    setCategory(
      categoryItem.id
    )

    setParams({
      category: categoryItem.id,
    })

    setExpandedCategory(
      categoryItem.id
    )

    setSelectedSubService(
      subService
    )

    window.setTimeout(() => {
      document
        .getElementById(
          'selected-service'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 50)
  }

  const addToCart = (item) => {
    setCart((current) => {
      const exists = current.some(
        (product) =>
          product.id === item.id
      )

      if (exists) {
        return current
      }

      return [...current, item]
    })
  }

  const removeFromCart = (itemId) => {
    setCart((current) =>
      current.filter(
        (item) =>
          item.id !== itemId
      )
    )
  }

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0),
    0
  )

  const clearFilters = () => {
    setMinRating(0)
    setMaxPrice(500)
    setAvailableOnly(false)
    setLocation('')
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="bg-slate-50 min-h-screen">

      <div className="container-app py-8">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-7">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>

              <p className="section-label mb-2">
                SHRAMSETU MARKETPLACE
              </p>

              <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy-700">
                Find the right service for your home
              </h1>

              <p className="text-navy-400 mt-2 max-w-2xl">
                Choose a service, explore
                sub-services, find verified
                cooperative workers and get
                the materials you need.
              </p>

            </div>

            {/* CART */}

            <button
              onClick={() => {
                document
                  .getElementById(
                    'equipment-section'
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }}
              className="relative self-start lg:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-navy-600 font-semibold shadow-sm hover:shadow-card transition"
            >
              <ShoppingCart size={18} />

              Equipment Cart

              {cart.length > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-coop-600 text-white text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* ===================================================
            AI PROBLEM FINDER
        =================================================== */}

        <div className="relative overflow-hidden rounded-3xl bg-navy-700 p-6 sm:p-8 mb-8 shadow-card">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-coop-500/10" />

          <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-saffron-500/10" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">

                <Sparkles
                  size={23}
                  className="text-saffron-400"
                />

              </div>

              <div>

                <p className="text-saffron-300 text-xs font-bold uppercase tracking-wider mb-1">
                  Not sure what service you need?
                </p>

                <h2 className="text-white font-display font-bold text-xl sm:text-2xl">
                  Show us the problem. We'll help you understand it.
                </h2>

                <p className="text-white/70 text-sm mt-1 max-w-xl">
                  Upload a photo or describe
                  your problem and ShramSetu
                  can suggest a likely service,
                  preliminary estimate and
                  relevant materials.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                navigate('/ai-insights')
              }
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-navy-700 font-bold hover:bg-slate-100 transition"
            >
              <Sparkles size={17} />
              Show Your Problem
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="card p-4 sm:p-5 mb-7">

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search a service or sub-service..."
                className="input-field pl-11"
              />

              {query && (
                <button
                  onClick={() =>
                    setQuery('')
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600"
                >
                  <X size={17} />
                </button>
              )}

              {/* SEARCH RESULTS */}

              {query &&
                searchResults.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

                    {searchResults.map(
                      (result, index) => (
                        <button
                          key={`${result.category.id}-${result.subService?.id || index}`}
                          onClick={() => {
                            if (
                              result.subService
                            ) {
                              selectSubService(
                                result.category,
                                result.subService
                              )
                            } else {
                              setCategoryAndUrl(
                                result.category.id
                              )
                            }

                            setQuery('')
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3"
                        >

                          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">

                            {result.category.details?.icon ? (
                              React.createElement(
                                result.category.details.icon,
                                { size: 17 }
                              )
                            ) : (
                              <Wrench size={17} />
                            )}

                          </div>

                          <div className="flex-1">

                            <p className="font-semibold text-sm text-navy-700">
                              {result.subService
                                ? result.subService.name
                                : result.category.name}
                            </p>

                            <p className="text-xs text-navy-400">
                              {result.category.name}
                            </p>

                          </div>

                          <ChevronRight
                            size={16}
                            className="text-navy-300"
                          />

                        </button>
                      )
                    )}

                  </div>
                )}

            </div>

            {/* LOCATION */}

            <div className="relative lg:w-56">

              <MapPin
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
              />

              <input
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                placeholder="Your location"
                className="input-field pl-10"
              />

            </div>

            {/* FILTER */}

            <button
              onClick={() =>
                setShowFilters(
                  (value) => !value
                )
              }
              className="btn-outline lg:w-auto"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-3 gap-5">

              <div>

                <p className="text-xs font-semibold text-navy-500 mb-2">
                  Minimum Rating:{' '}
                  {minRating.toFixed(1)}+
                </p>

                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-coop-500"
                />

              </div>

              <div>

                <p className="text-xs font-semibold text-navy-500 mb-2">
                  Maximum Worker Price: ₹
                  {maxPrice}
                </p>

                <input
                  type="range"
                  min="100"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-coop-500"
                />

              </div>

              <div className="flex items-end justify-between gap-3">

                <label className="flex items-center gap-2 text-sm text-navy-600 pb-2">

                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) =>
                      setAvailableOnly(
                        e.target.checked
                      )
                    }
                    className="accent-coop-500 w-4 h-4"
                  />

                  Available today

                </label>

                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-navy-500 hover:text-coop-600"
                >
                  Clear
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            SERVICE CATEGORIES
        =================================================== */}

        <section className="mb-10">

          <div className="mb-4">

            <p className="section-label mb-1">
              EXPLORE
            </p>

            <h2 className="font-display font-bold text-2xl text-navy-700">
              Services for every home need
            </h2>

            <p className="text-sm text-navy-400 mt-1">
              Select a category to see its
              available services.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {visibleCategories.map((c) => {

              const details = c.details
              const Icon =
                details?.icon || Wrench

              const isActive =
                category === c.id

              const isExpanded =
                expandedCategory === c.id

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isActive
                      ? 'border-navy-500 shadow-card'
                      : 'border-slate-200 hover:border-navy-200 hover:shadow-card'
                  }`}
                >

                  <button
                    onClick={() => {

                      if (isExpanded) {
                        setExpandedCategory(
                          null
                        )
                      } else {
                        setExpandedCategory(
                          c.id
                        )
                      }

                      setCategoryAndUrl(
                        c.id
                      )
                    }}
                    className="w-full p-4 text-left"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          details?.color ||
                          'bg-navy-50 text-navy-600'
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="font-bold text-navy-700">
                          {c.name}
                        </p>

                        <p className="text-xs text-navy-400 mt-0.5">
                          {details?.subServices?.length || 0}{' '}
                          services
                        </p>

                      </div>

                      <ChevronDown
                        size={17}
                        className={`text-navy-300 transition-transform ${
                          isExpanded
                            ? 'rotate-180'
                            : ''
                        }`}
                      />

                    </div>

                  </button>

                  {isExpanded &&
                    details?.subServices
                      ?.length > 0 && (
                      <div className="px-3 pb-3">

                        <div className="border-t border-slate-100 pt-2">

                          {details.subServices.map(
                            (sub) => (
                              <button
                                key={sub.id}
                                onClick={() =>
                                  selectSubService(
                                    c,
                                    sub
                                  )
                                }
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition ${
                                  selectedSubService?.id ===
                                  sub.id
                                    ? 'bg-navy-50 text-navy-700'
                                    : 'hover:bg-slate-50 text-navy-500'
                                }`}
                              >

                                <span className="text-sm font-medium">
                                  {sub.name}
                                </span>

                                <ChevronRight
                                  size={15}
                                  className="text-navy-300"
                                />

                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                </div>
              )
            })}

          </div>

        </section>

        {/* ===================================================
            SELECTED SERVICE
        =================================================== */}

        {selectedSubService && (
          <section
            id="selected-service"
            className="mb-10 scroll-mt-24"
          >

            <div className="card overflow-hidden">

              {/* SERVICE HEADER */}

              <div className="p-5 sm:p-6 bg-white">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">
                      <Wrench size={21} />
                    </div>

                    <div>

                      <p className="text-xs uppercase tracking-wider font-bold text-coop-600">
                        Selected Service
                      </p>

                      <h2 className="font-display font-bold text-xl text-navy-700 mt-1">
                        {selectedSubService.name}
                      </h2>

                      <p className="text-sm text-navy-400 mt-1 max-w-2xl">
                        {selectedSubService.description}
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <div className="px-3 py-2 rounded-lg bg-slate-50">

                      <p className="text-[10px] uppercase font-bold text-navy-300">
                        Estimated
                      </p>

                      <p className="text-sm font-bold text-navy-700">
                        {selectedSubService.price}
                      </p>

                    </div>

                    <div className="px-3 py-2 rounded-lg bg-slate-50 flex items-center gap-2">

                      <Clock3
                        size={14}
                        className="text-navy-400"
                      />

                      <span className="text-sm font-semibold text-navy-600">
                        {selectedSubService.duration}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* EQUIPMENT */}

              <div
                id="equipment-section"
                className="bg-slate-50 border-t border-slate-100 p-5 sm:p-6"
              >

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                  <div>

                    <div className="flex items-center gap-2">

                      <ShoppingBag
                        size={18}
                        className="text-coop-600"
                      />

                      <h3 className="font-display font-bold text-lg text-navy-700">
                        Recommended materials & equipment
                      </h3>

                    </div>

                    <p className="text-sm text-navy-400 mt-1">
                      Buy what you need or add
                      materials to your service
                      request.
                    </p>

                  </div>

                  {cart.length > 0 && (
                    <div className="flex items-center gap-3">

                      <span className="text-sm font-semibold text-navy-600">
                        {cart.length} item
                        {cart.length > 1
                          ? 's'
                          : ''}{' '}
                        · ₹{cartTotal}
                      </span>

                      <button
                        onClick={() =>
                          alert(
                            `Equipment cart ready. Total: ₹${cartTotal}`
                          )
                        }
                        className="btn-primary"
                      >
                        View Cart
                      </button>

                    </div>
                  )}

                </div>

                {selectedSubService.equipment
                  ?.length > 0 ? (

                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {selectedSubService.equipment.map(
                      (item) => {

                        const alreadyAdded =
                          cart.some(
                            (product) =>
                              product.id ===
                              item.id
                          )

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-card transition"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center">
                                <Package size={18} />
                              </div>

                              <span className="text-sm font-bold text-navy-700">
                                ₹{item.price}
                              </span>

                            </div>

                            <h4 className="font-bold text-navy-700 mt-4">
                              {item.name}
                            </h4>

                            <p className="text-xs text-navy-400 mt-1 min-h-[36px]">
                              {item.purpose}
                            </p>

                            <div className="flex gap-2 mt-4">

                              <button
                                onClick={() =>
                                  addToCart(
                                    item
                                  )
                                }
                                disabled={
                                  alreadyAdded
                                }
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition ${
                                  alreadyAdded
                                    ? 'bg-coop-50 text-coop-700'
                                    : 'bg-navy-700 text-white hover:bg-navy-600'
                                }`}
                              >

                                {alreadyAdded ? (
                                  <>
                                    <Check
                                      size={15}
                                    />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus
                                      size={15}
                                    />
                                    Add to Service
                                  </>
                                )}

                              </button>

                              <button
                                onClick={() =>
                                  addToCart(
                                    item
                                  )
                                }
                                className="px-3 py-2.5 rounded-lg border border-slate-200 text-navy-600 hover:bg-slate-50"
                                title="Add to equipment cart"
                              >
                                <ShoppingCart
                                  size={16}
                                />
                              </button>

                            </div>

                          </div>
                        )
                      }
                    )}

                  </div>

                ) : (

                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-7 text-center">

                    <Package
                      size={25}
                      className="mx-auto text-navy-300"
                    />

                    <p className="font-semibold text-navy-600 mt-3">
                      No standard equipment recommendation
                    </p>

                    <p className="text-sm text-navy-400 mt-1">
                      A verified worker can
                      determine the required
                      materials after inspecting
                      the job.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            POPULAR SERVICES
        =================================================== */}

        {!selectedSubService && (
          <section className="mb-10">

            <div className="mb-4">

              <p className="section-label mb-1">
                POPULAR
              </p>

              <h2 className="font-display font-bold text-2xl text-navy-700">
                Services people book frequently
              </h2>

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {visibleCategories
                .flatMap((cat) =>
                  (
                    cat.details
                      ?.subServices || []
                  ).map((sub) => ({
                    ...sub,
                    category: cat,
                  }))
                )
                .slice(0, 8)
                .map((service) => {

                  const Icon =
                    service.category
                      .details?.icon ||
                    Wrench

                  return (
                    <button
                      key={service.id}
                      onClick={() =>
                        selectSubService(
                          service.category,
                          service
                        )
                      }
                      className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-card hover:-translate-y-0.5 transition"
                    >

                      <div className="flex items-center justify-between">

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            service.category
                              .details?.color ||
                            'bg-navy-50 text-navy-600'
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <ArrowRight
                          size={16}
                          className="text-navy-300"
                        />

                      </div>

                      <h3 className="font-bold text-navy-700 mt-4">
                        {service.name}
                      </h3>

                      <p className="text-xs text-navy-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between mt-4">

                        <span className="text-sm font-bold text-coop-600">
                          {service.price}
                        </span>

                        <span className="text-xs text-navy-400">
                          {service.category.name}
                        </span>

                      </div>

                    </button>
                  )
                })}

            </div>

          </section>
        )}

        {/* ===================================================
            WORKER MARKETPLACE
        =================================================== */}

        <section className="mb-10">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

            <div>

              <p className="section-label mb-1">
                VERIFIED PROFESSIONALS
              </p>

              <h2 className="font-display font-bold text-2xl text-navy-700">
                Find a worker
              </h2>

              <p className="text-sm text-navy-400 mt-1">

                {filteredWorkers.length > 0
                  ? `${filteredWorkers.length} verified cooperative worker${filteredWorkers.length > 1 ? 's' : ''} match your search`
                  : 'Worker availability can vary by location and time'}

              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-navy-400">

              <ShieldCheck
                size={16}
                className="text-coop-600"
              />

              Verified cooperative workers

            </div>

          </div>

          {filteredWorkers.length > 0 ? (

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

              {filteredWorkers.map(
                (worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                  />
                )
              )}

            </div>

          ) : (

            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center">

              <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy-500 flex items-center justify-center mx-auto">

                <MapPin size={23} />

              </div>

              <h3 className="font-display font-bold text-lg text-navy-700 mt-4">
                No matching workers right now
              </h3>

              <p className="text-sm text-navy-400 max-w-md mx-auto mt-2">
                You can still explore the
                service catalogue and
                recommended equipment.
              </p>

              <button
                onClick={() => {
                  clearFilters()
                  setCategory('all')
                  setSelectedSubService(null)
                  setParams({})
                }}
                className="btn-outline mt-5"
              >
                Browse all services
              </button>

            </div>

          )}

        </section>

        {/* ===================================================
            EQUIPMENT STORE
        =================================================== */}

        {!selectedSubService && (
          <section className="mb-10">

            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8">

              <div className="absolute right-0 top-0 w-48 h-48 bg-coop-50 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div>

                  <div className="flex items-center gap-2">

                    <ShoppingBag
                      size={19}
                      className="text-coop-600"
                    />

                    <p className="section-label">
                      SHRAMSETU ESSENTIALS
                    </p>

                  </div>

                  <h2 className="font-display font-bold text-2xl text-navy-700 mt-2">
                    Need the tools or materials too?
                  </h2>

                  <p className="text-sm text-navy-400 mt-2 max-w-2xl">
                    Select a service to see
                    equipment and materials
                    that may be relevant to
                    the job. Buy them yourself
                    or add them to your service
                    request.
                  </p>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {[
                    ['Plumbing', Droplets],
                    ['Electrical', Zap],
                    ['Cleaning', SprayCan],
                    ['Carpentry', Hammer],
                  ].map(
                    ([name, Icon]) => {

                      const target =
                        visibleCategories.find(
                          (item) =>
                            String(
                              item.name
                            )
                              .toLowerCase()
                              .includes(
                                name.toLowerCase()
                              )
                        )

                      return (
                        <button
                          key={name}
                          onClick={() => {

                            if (!target) return

                            setCategoryAndUrl(
                              target.id
                            )

                            setExpandedCategory(
                              target.id
                            )
                          }}
                          className="px-4 py-3 rounded-xl bg-slate-50 hover:bg-navy-50 transition text-left"
                        >

                          <Icon
                            size={18}
                            className="text-navy-500"
                          />

                          <p className="text-xs font-bold text-navy-600 mt-2">
                            {name}
                          </p>

                        </button>
                      )
                    }
                  )}

                </div>

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            TRUST STRIP
        =================================================== */}

        <section className="pb-5">

          <div className="grid sm:grid-cols-3 gap-4">

            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">

              <div className="w-10 h-10 rounded-lg bg-coop-50 text-coop-600 flex items-center justify-center">

                <ShieldCheck size={19} />

              </div>

              <div>

                <p className="text-sm font-bold text-navy-700">
                  Verified workers
                </p>

                <p className="text-xs text-navy-400">
                  Cooperative-verified professionals
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">

              <div className="w-10 h-10 rounded-lg bg-saffron-50 text-saffron-600 flex items-center justify-center">

                <Star size={19} />

              </div>

              <div>

                <p className="text-sm font-bold text-navy-700">
                  Transparent estimates
                </p>

                <p className="text-xs text-navy-400">
                  Understand the likely cost before booking
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                <ShoppingCart size={19} />

              </div>

              <div>

                <p className="text-sm font-bold text-navy-700">
                  Materials when needed
                </p>

                <p className="text-xs text-navy-400">
                  Buy or add recommended items to your job
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          FLOATING CART
      ===================================================== */}

      {cart.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40">

          <div className="bg-navy-700 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">

              <ShoppingCart size={18} />

            </div>

            <div className="hidden sm:block">

              <p className="text-xs text-white/60">
                Equipment cart
              </p>

              <p className="text-sm font-bold">
                {cart.length} item
                {cart.length > 1
                  ? 's'
                  : ''}{' '}
                · ₹{cartTotal}
              </p>

            </div>

            <button
              onClick={() =>
                alert(
                  `Your equipment cart contains ${cart.length} item(s) worth ₹${cartTotal}.`
                )
              }
              className="px-3 py-2 rounded-lg bg-coop-600 hover:bg-coop-500 text-sm font-bold"
            >
              View
            </button>

            <button
              onClick={() => setCart([])}
              className="p-2 text-white/60 hover:text-white"
              title="Clear cart"
            >
              <X size={17} />
            </button>

          </div>

        </div>
      )}

    </div>
  )
}