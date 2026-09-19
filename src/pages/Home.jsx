import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Users,
  CheckCircle2,
  Building2,
  ShieldCheck,
  IndianRupee,
  HeartHandshake,
  ReceiptText,
  Lock,
  Search,
  Calendar,
  ThumbsUp,
  Camera,
  Video,
  Mic,
  Sparkles,
  MapPin,
  Clock3,
  Star,
  ChevronRight,
  ScanLine,
  Ruler,
  BrainCircuit,
  BadgeCheck,
  Zap,
  Plus,
} from "lucide-react";

import ServiceCard from "../components/ServiceCard";
import { Button } from "../components/UI";
import {
  CATEGORIES,
  getCurrentUser,
} from "../data/mockauth";

import heroImage from "../assets/home-hero.jpg";


/* =========================================================
   STATS
========================================================= */

const STATS = [
  {
    value: "5,000+",
    label: "Verified Workers",
  },
  {
    value: "25,000+",
    label: "Services Completed",
  },
  {
    value: "50+",
    label: "Cooperatives",
  },
  {
    value: "4.8/5",
    label: "Customer Rating",
  },
];


/* =========================================================
   WHY SHRAMSETU
========================================================= */

const WHY = [
  {
    icon: ShieldCheck,
    title: "Verified Workers",
    desc: "Identity and skill checks by the cooperative before anyone joins the platform.",
  },
  {
    icon: IndianRupee,
    title: "Fair Wages",
    desc: "Transparent pricing that ensures workers are paid fairly for every job.",
  },
  {
    icon: Building2,
    title: "Cooperative Owned",
    desc: "Owned and governed by labour cooperatives, not private investors.",
  },
  {
    icon: ReceiptText,
    title: "Transparent Pricing",
    desc: "No hidden charges — customers see the expected cost before booking.",
  },
  {
    icon: HeartHandshake,
    title: "Worker Welfare",
    desc: "Insurance, welfare fund access and emergency support for workers.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    desc: "UPI, card or cash — payments are tracked transparently.",
  },
];


/* =========================================================
   HOW IT WORKS
========================================================= */

const STEPS = [
  {
    number: "01",
    icon: Camera,
    title: "Show the problem",
    desc: "Upload a photo, video or describe the issue with your voice.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "AI understands it",
    desc: "AI identifies the likely issue, service category and severity.",
  },
  {
    number: "03",
    icon: Ruler,
    title: "Measure & estimate",
    desc: "Where supported, spatial data helps estimate the affected area.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Match a worker",
    desc: "Find a verified professional based on skill, rating and availability.",
  },
  {
    number: "05",
    icon: Calendar,
    title: "Book the service",
    desc: "Choose a suitable time and confirm your service request.",
  },
  {
    number: "06",
    icon: ThumbsUp,
    title: "Complete & review",
    desc: "Get the work completed and share your experience.",
  },
];


/* =========================================================
   AI FEATURES
========================================================= */

const AI_FEATURES = [
  {
    icon: Camera,
    title: "Visual Diagnosis",
    desc: "Show the visible problem through a photo or video.",
  },
  {
    icon: ScanLine,
    title: "Spatial Understanding",
    desc: "Use supported depth information to estimate dimensions.",
  },
  {
    icon: Mic,
    title: "Voice Assistance",
    desc: "Describe the problem naturally in your preferred language.",
  },
  {
    icon: IndianRupee,
    title: "Cost Estimation",
    desc: "Receive a preliminary cost range before booking.",
  },
];


/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const navigate = useNavigate();

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const currentUser = getCurrentUser();

  const isWorker = currentUser?.role === "worker";
  const isCustomer = currentUser?.role === "customer";


  /* =======================================================
     AI INPUT PREVIEW
  ======================================================= */

  const [aiInput, setAiInput] = useState("photo");


  /* =======================================================
     GET WORKER PROFILE
  ======================================================= */

  let workerServices = [];

  if (isWorker) {
    try {
      const savedProfile =
        localStorage.getItem("ss_worker_profile");

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);

        if (Array.isArray(profile.services)) {
          workerServices = profile.services;
        } else if (
          typeof profile.services === "string"
        ) {
          workerServices = profile.services
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load worker services:",
        error
      );
    }
  }


  /* =======================================================
     CATEGORY NAME HELPER
  ======================================================= */

  const getCategoryName = (category) => {
    return (
      category.name ||
      category.label ||
      category.title ||
      ""
    );
  };


  /* =======================================================
     MATCH WORKER SERVICES
  ======================================================= */

  const workerCategoryServices =
    workerServices
      .map((serviceName) => {
        const matchingCategory =
          CATEGORIES.find(
            (category) =>
              getCategoryName(category)
                .toLowerCase() ===
              serviceName.toLowerCase()
          );

        return matchingCategory || null;
      })
      .filter(Boolean);


  /* =======================================================
     AI INPUT HANDLER
  ======================================================= */

  const handleAIStart = () => {
    navigate("/ai-insights");
  };


  return (
    <div className="overflow-hidden">


      {/* =====================================================
          CUSTOMER HERO
      ===================================================== */}

      {isCustomer ? (
        <section className="relative bg-navy-500 overflow-hidden">

          {/* Background pattern */}

          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />

          <div className="container-app relative py-12 lg:py-16">

            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 xl:gap-16 items-center">


              {/* =================================================
                  HERO CONTENT
              ================================================= */}

              <div className="animate-fade-up">

                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-coop-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Sparkles size={14} />
                  AI-powered local services
                </div>


                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white mt-5 leading-[1.08] tracking-tight">

                  Don't know what's
                  <br />

                  <span className="text-saffron-300">
                    wrong?
                  </span>{" "}

                  <span>
                    Just show us.
                  </span>

                </h1>


                <p className="text-navy-100 mt-6 text-base sm:text-lg leading-relaxed max-w-xl">
                  Show ShramSetu the problem through a photo,
                  video or voice. Our AI helps understand the
                  issue, estimate the requirement and connect
                  you with a verified local professional.
                </p>


                {/* ===============================================
                    CTA BUTTONS
                =============================================== */}

                <div className="flex flex-wrap gap-3 mt-8">

                  <Button
                    variant="accent"
                    onClick={handleAIStart}
                  >
                    <Camera size={17} />
                    Diagnose a Problem
                    <ArrowRight size={16} />
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/services")
                    }
                    className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/15 transition"
                  >
                    Explore Services
                  </button>

                </div>


                {/* ===============================================
                    TRUST LINE
                =============================================== */}

                <div className="flex flex-wrap items-center gap-5 mt-7 text-xs text-navy-200">

                  <div className="flex items-center gap-2">
                    <BadgeCheck
                      size={16}
                      className="text-coop-300"
                    />
                    Verified professionals
                  </div>

                  <div className="flex items-center gap-2">
                    <Lock
                      size={15}
                      className="text-coop-300"
                    />
                    Secure booking
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee
                      size={15}
                      className="text-coop-300"
                    />
                    Transparent pricing
                  </div>

                </div>

              </div>


              {/* =================================================
                  HERO VISUAL
              ================================================= */}

              <div className="relative animate-fade-up">

                {/* Main image */}

                <div className="relative aspect-[6/5] overflow-hidden rounded-3xl">

                  <img
                    src={heroImage}
                    alt="ShramSetu verified service professional"
                    className="w-full h-[420px] sm:h-[480px] object-cover" 
                  />

                  {/* Image overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-navy-700/90 via-transparent to-transparent" />


                  {/* Image bottom content */}

                  <div className="absolute left-5 right-5 bottom-5">

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2 text-white text-sm font-semibold">

                          <span className="w-2 h-2 rounded-full bg-coop-400 animate-pulse" />

                          Verified worker network

                        </div>

                        <p className="text-white/70 text-xs mt-1">
                          Skilled professionals near you
                        </p>

                      </div>


                      <div className="bg-white rounded-xl px-3 py-2 shadow-lg">

                        <div className="flex items-center gap-1">

                          <Star
                            size={14}
                            className="fill-saffron-500 text-saffron-500"
                          />

                          <span className="font-bold text-navy-700 text-sm">
                            4.8
                          </span>

                        </div>

                        <p className="text-[10px] text-navy-400">
                          Customer rating
                        </p>

                      </div>

                    </div>

                  </div>

                </div>


                {/* ===============================================
                    FLOATING AI CARD
                =============================================== */}

                <div className="absolute -bottom-7 -left-4 sm:-left-8 bg-white rounded-2xl shadow-cardHover border border-navy-100 p-4 w-[250px]">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">
                      <Sparkles size={19} />
                    </div>

                    <div>

                      <p className="text-xs text-navy-400">
                        AI preliminary assessment
                      </p>

                      <p className="font-bold text-sm text-navy-700">
                        Problem understood
                      </p>

                    </div>

                    <CheckCircle2
                      size={18}
                      className="ml-auto text-coop-500"
                    />

                  </div>


                  <div className="grid grid-cols-2 gap-2 mt-3">

                    <div className="bg-navy-50 rounded-lg p-2">

                      <p className="text-[10px] text-navy-400">
                        Category
                      </p>

                      <p className="text-xs font-semibold text-navy-700">
                        Plumbing
                      </p>

                    </div>

                    <div className="bg-navy-50 rounded-lg p-2">

                      <p className="text-[10px] text-navy-400">
                        Estimate
                      </p>

                      <p className="text-xs font-semibold text-coop-600">
                        ₹800–₹1,200
                      </p>

                    </div>

                  </div>

                </div>


                {/* ===============================================
                    FLOATING VERIFIED BADGE
                =============================================== */}

                <div className="absolute -top-4 -right-3 sm:-right-6 bg-white rounded-xl shadow-cardHover border border-navy-100 px-3 py-2.5 flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-coop-50 flex items-center justify-center">
                    <ShieldCheck
                      size={17}
                      className="text-coop-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-navy-700">
                      Verified
                    </p>

                    <p className="text-[10px] text-navy-400">
                      Cooperative worker
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      ) : (

        /* =====================================================
           WORKER / DEFAULT HERO
        ===================================================== */

        <section className="relative overflow-hidden bg-navy-500">

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="container-app relative py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">

            <div className="animate-fade-up">

              <span className="section-label bg-white/10 text-coop-200">
                Cooperative-Owned Marketplace
              </span>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mt-5 leading-tight">

                Skilled Hands.
                <br />

                Trusted Services.
                <br />

                <span className="text-saffron-300">
                  Stronger Communities.
                </span>

              </h1>

              <p className="text-navy-100 mt-5 text-lg leading-relaxed max-w-xl">
                A cooperative-powered digital marketplace
                connecting verified local workers with
                households and institutions.
              </p>


              {isWorker && (
                <div className="flex flex-wrap gap-3 mt-8">

                  <Button
                    variant="accent"
                    onClick={() =>
                      navigate("/WorkerDashboard")
                    }
                  >
                    My Jobs
                    <ArrowRight size={16} />
                  </Button>

                </div>
              )}

            </div>


            <div className="animate-fade-up">

              <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur">

                <div className="flex flex-col items-center gap-3">

                  <div className="w-full bg-white rounded-xl p-4 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-navy-500 flex items-center justify-center text-white">
                      <Users size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-navy-700 text-sm">
                        Customer
                      </p>

                      <p className="text-xs text-navy-400">
                        Requests a trusted service
                      </p>
                    </div>

                  </div>

                  <ArrowRight className="text-coop-300 rotate-90" />

                  <div className="w-full bg-coop-500 rounded-xl p-4 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-display font-bold">
                      S
                    </div>

                    <div>
                      <p className="font-semibold text-white text-sm">
                        ShramSetu
                      </p>

                      <p className="text-xs text-coop-100">
                        Matches with verified worker
                      </p>
                    </div>

                  </div>

                  <ArrowRight className="text-coop-300 rotate-90" />

                  <div className="w-full bg-white rounded-xl p-4 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-saffron-500 flex items-center justify-center text-white">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-navy-700 text-sm">
                        Verified Worker
                      </p>

                      <p className="text-xs text-navy-400">
                        Delivers the service with quality
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="bg-navy-600">

        <div className="container-app py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">

          {STATS.map((s) => (

            <div
              key={s.label}
              className="text-center"
            >

              <p className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                {s.value}
              </p>

              <p className="text-navy-200 text-xs sm:text-sm mt-1">
                {s.label}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          AI QUICK ACTION
          CUSTOMER ONLY
      ===================================================== */}

      {isCustomer && (
        <section className="container-app py-16">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-stretch">


            {/* ===============================================
                LEFT TEXT
            =============================================== */}

            <div className="flex flex-col justify-center">

              <span className="section-label">
                Smart Service Discovery
              </span>

              <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-700 mt-3 leading-tight">

                You don't need to know
                <span className="text-coop-600">
                  {" "}what the problem is.
                </span>

              </h2>

              <p className="text-navy-400 mt-4 leading-relaxed">

                Just show us. ShramSetu helps translate
                your everyday problem into a service
                requirement — before you book a worker.

              </p>


              <div className="flex items-center gap-3 mt-6">

                <div className="w-10 h-10 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">
                  <BrainCircuit size={19} />
                </div>

                <div>

                  <p className="font-semibold text-navy-700 text-sm">
                    AI-assisted, not AI-only
                  </p>

                  <p className="text-xs text-navy-400 mt-0.5">
                    Final diagnosis remains subject to worker verification.
                  </p>

                </div>

              </div>

            </div>


            {/* ===============================================
                AI INTERACTIVE CARD
            =============================================== */}

            <div className="rounded-3xl bg-navy-50 border border-navy-100 p-5 sm:p-7">

              <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="w-9 h-9 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">
                        <Sparkles size={17} />
                      </div>

                      <div>

                        <p className="font-display font-bold text-navy-700">
                          Start with your problem
                        </p>

                        <p className="text-xs text-navy-400">
                          Choose how you want to show us
                        </p>

                      </div>

                    </div>

                  </div>

                  <span className="text-[10px] font-bold text-coop-600 bg-coop-50 px-2 py-1 rounded-full">
                    AI
                  </span>

                </div>


                {/* INPUT OPTIONS */}

                <div className="grid grid-cols-3 gap-2 mt-6">

                  <button
                    type="button"
                    onClick={() =>
                      setAiInput("photo")
                    }
                    className={`p-3 rounded-xl border transition ${
                      aiInput === "photo"
                        ? "border-coop-500 bg-coop-50 text-coop-700"
                        : "border-navy-100 text-navy-500 hover:bg-navy-50"
                    }`}
                  >

                    <Camera
                      size={19}
                      className="mx-auto"
                    />

                    <span className="block text-xs font-semibold mt-2">
                      Photo
                    </span>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setAiInput("video")
                    }
                    className={`p-3 rounded-xl border transition ${
                      aiInput === "video"
                        ? "border-coop-500 bg-coop-50 text-coop-700"
                        : "border-navy-100 text-navy-500 hover:bg-navy-50"
                    }`}
                  >

                    <Video
                      size={19}
                      className="mx-auto"
                    />

                    <span className="block text-xs font-semibold mt-2">
                      Video
                    </span>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setAiInput("voice")
                    }
                    className={`p-3 rounded-xl border transition ${
                      aiInput === "voice"
                        ? "border-coop-500 bg-coop-50 text-coop-700"
                        : "border-navy-100 text-navy-500 hover:bg-navy-50"
                    }`}
                  >

                    <Mic
                      size={19}
                      className="mx-auto"
                    />

                    <span className="block text-xs font-semibold mt-2">
                      Voice
                    </span>

                  </button>

                </div>


                {/* PREVIEW */}

                <div className="mt-4 rounded-2xl bg-navy-500 p-5 relative overflow-hidden">

                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                      backgroundSize: "18px 18px",
                    }}
                  />

                  <div className="relative">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-coop-300">

                          {aiInput === "photo" && (
                            <Camera size={16} />
                          )}

                          {aiInput === "video" && (
                            <Video size={16} />
                          )}

                          {aiInput === "voice" && (
                            <Mic size={16} />
                          )}

                        </div>

                        <p className="text-white text-sm font-semibold">
                          Ready for your input
                        </p>

                      </div>

                      <Zap
                        size={17}
                        className="text-saffron-300"
                      />

                    </div>


                    <p className="text-navy-200 text-xs mt-3 leading-relaxed">

                      {aiInput === "photo" &&
                        "Upload a photo of the visible problem and let AI analyse it."}

                      {aiInput === "video" &&
                        "Show the problem from different angles for better context."}

                      {aiInput === "voice" &&
                        "Describe the problem naturally using your voice."}

                    </p>


                    <button
                      type="button"
                      onClick={handleAIStart}
                      className="mt-4 w-full bg-coop-500 hover:bg-coop-600 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition"
                    >
                      Continue to AI Diagnosis
                      <ArrowRight size={15} />
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          CUSTOMER SERVICE CATEGORIES
      ===================================================== */}

      {isCustomer && (
        <section className="bg-white border-y border-navy-100">

          <div className="container-app py-16">

            <div className="flex items-end justify-between gap-5 mb-10">

              <div>

                <span className="section-label">
                  Explore Services
                </span>

                <h2 className="font-display font-bold text-3xl text-navy-700 mt-3">
                  What can we help you with?
                </h2>

                <p className="text-navy-400 mt-2 text-sm">
                  From everyday repairs to essential home services.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate("/services")
                }
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-coop-600 hover:text-coop-700"
              >
                View all
                <ChevronRight size={16} />
              </button>

            </div>


            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  className="group transition-transform hover:-translate-y-1"
                >
                  <ServiceCard category={c} />
                </div>
              ))}

            </div>


            <button
              type="button"
              onClick={() =>
                navigate("/services")
              }
              className="sm:hidden mt-6 w-full flex items-center justify-center gap-1 text-sm font-semibold text-coop-600"
            >
              View all services
              <ChevronRight size={16} />
            </button>

          </div>

        </section>
      )}


      {/* =====================================================
          AI CAPABILITIES
      ===================================================== */}

      {isCustomer && (
        <section className="bg-navy-50">

          <div className="container-app py-16">

            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center">


              {/* LEFT */}

              <div>

                <span className="section-label">
                  More Than Booking
                </span>

                <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-700 mt-3 leading-tight">

                  A smarter way to
                  <span className="text-coop-600">
                    {" "}solve everyday problems.
                  </span>

                </h2>

                <p className="text-navy-400 mt-4 leading-relaxed">

                  ShramSetu combines AI, spatial understanding
                  and verified local professionals to simplify
                  the entire service journey.

                </p>


                <button
                  type="button"
                  onClick={handleAIStart}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-coop-600 hover:text-coop-700"
                >
                  Try AI Diagnosis
                  <ArrowRight size={16} />
                </button>

              </div>


              {/* RIGHT */}

              <div className="grid sm:grid-cols-2 gap-4">

                {AI_FEATURES.map((feature) => {

                  const FeatureIcon =
                    feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="bg-white border border-navy-100 rounded-2xl p-5 hover:shadow-cardHover hover:-translate-y-1 transition-all"
                    >

                      <div className="w-11 h-11 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">

                        <FeatureIcon size={20} />

                      </div>

                      <h3 className="font-display font-bold text-navy-700 mt-4">
                        {feature.title}
                      </h3>

                      <p className="text-sm text-navy-400 mt-2 leading-relaxed">
                        {feature.desc}
                      </p>

                    </div>
                  );

                })}

              </div>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="container-app py-16">

        <div className="text-center max-w-2xl mx-auto mb-10">

          <span className="section-label">
            Simple Process
          </span>

          <h2 className="font-display font-bold text-3xl text-navy-700 mt-3">
            From problem to solution
          </h2>

          <p className="text-navy-400 mt-3 text-sm">
            A simple workflow designed around how people
            actually solve service problems.
          </p>

        </div>


        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {STEPS.map((step) => {

            const StepIcon = step.icon;

            return (
              <div
                key={step.number}
                className="group card p-6 relative overflow-hidden hover:shadow-cardHover hover:-translate-y-1 transition-all"
              >

                <span className="absolute top-3 right-5 text-4xl font-display font-extrabold text-navy-50">
                  {step.number}
                </span>


                <div className="relative">

                  <div className="w-11 h-11 rounded-xl bg-navy-500 text-white flex items-center justify-center group-hover:bg-coop-500 transition-colors">

                    <StepIcon size={19} />

                  </div>


                  <p className="font-display font-bold text-navy-700 mt-5">
                    {step.title}
                  </p>

                  <p className="text-sm text-navy-400 mt-2 leading-relaxed">
                    {step.desc}
                  </p>

                </div>

              </div>
            );

          })}

        </div>

      </section>


      {/* =====================================================
          TRUST / WORKER NETWORK
      ===================================================== */}

      <section className="bg-white border-y border-navy-100">

        <div className="container-app py-16">

          <div className="grid lg:grid-cols-2 gap-10 items-center">


            {/* LEFT */}

            <div>

              <span className="section-label">
                Built Around People
              </span>

              <h2 className="font-display font-bold text-3xl text-navy-700 mt-3">

                Local expertise,
                <br />

                <span className="text-coop-600">
                  digitally connected.
                </span>

              </h2>

              <p className="text-navy-400 mt-4 leading-relaxed max-w-xl">

                Every worker on ShramSetu is connected
                through a cooperative-led verification system,
                creating a marketplace focused on trust,
                fair work and accountability.

              </p>


              <div className="grid sm:grid-cols-2 gap-4 mt-7">

                <div className="flex gap-3">

                  <div className="w-10 h-10 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>

                  <div>

                    <p className="font-semibold text-sm text-navy-700">
                      Verified identity
                    </p>

                    <p className="text-xs text-navy-400 mt-1">
                      Cooperative-led worker verification.
                    </p>

                  </div>

                </div>


                <div className="flex gap-3">

                  <div className="w-10 h-10 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                    <HeartHandshake size={18} />
                  </div>

                  <div>

                    <p className="font-semibold text-sm text-navy-700">
                      Worker welfare
                    </p>

                    <p className="text-xs text-navy-400 mt-1">
                      Built around dignity and fair earnings.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* RIGHT NETWORK CARD */}

            <div className="bg-navy-500 rounded-3xl p-6 sm:p-8 relative overflow-hidden">

              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "25px 25px",
                }}
              />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-white font-display font-bold text-lg">
                      Verified local network
                    </p>

                    <p className="text-navy-200 text-xs mt-1">
                      Professionals available across service categories
                    </p>

                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Users
                      size={21}
                      className="text-coop-300"
                    />
                  </div>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-6">

                  <div className="bg-white/10 rounded-xl p-4">

                    <p className="text-2xl font-display font-extrabold text-white">
                      5K+
                    </p>

                    <p className="text-xs text-navy-200 mt-1">
                      Verified workers
                    </p>

                  </div>


                  <div className="bg-white/10 rounded-xl p-4">

                    <p className="text-2xl font-display font-extrabold text-white">
                      50+
                    </p>

                    <p className="text-xs text-navy-200 mt-1">
                      Cooperatives
                    </p>

                  </div>


                  <div className="bg-white/10 rounded-xl p-4">

                    <p className="text-2xl font-display font-extrabold text-white">
                      25K+
                    </p>

                    <p className="text-xs text-navy-200 mt-1">
                      Completed services
                    </p>

                  </div>


                  <div className="bg-white/10 rounded-xl p-4">

                    <p className="text-2xl font-display font-extrabold text-white">
                      4.8
                    </p>

                    <p className="text-xs text-navy-200 mt-1">
                      Average rating
                    </p>

                  </div>

                </div>


                <div className="mt-5 flex items-center gap-2 text-xs text-navy-200">

                  <MapPin size={14} className="text-coop-300" />

                  Hyperlocal service discovery

                  <span className="ml-auto flex items-center gap-1">
                    <Clock3 size={13} />
                    Fast matching
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY SHRAMSETU
      ===================================================== */}

      <section className="bg-white">

        <div className="container-app py-16">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <span className="section-label">
              Why ShramSetu?
            </span>

            <h2 className="font-display font-bold text-3xl text-navy-700 mt-3">
              Built on trust, fairness and community
            </h2>

          </div>


          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {WHY.map((w) => {

              const WhyIcon = w.icon;

              return (
                <div
                  key={w.title}
                  className="card p-6 hover:shadow-cardHover hover:-translate-y-1 transition-all"
                >

                  <div className="w-11 h-11 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center mb-4">

                    <WhyIcon size={20} />

                  </div>

                  <p className="font-display font-bold text-navy-700">
                    {w.title}
                  </p>

                  <p className="text-sm text-navy-400 mt-1.5 leading-relaxed">
                    {w.desc}
                  </p>

                </div>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          WORKER SERVICES
          ONLY WORKER SEES THIS
      ===================================================== */}

      {isWorker && (
        <section className="container-app py-16">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <span className="section-label">
              Your Services
            </span>

            <h2 className="font-display font-bold text-3xl text-navy-700 mt-3">
              What services do you provide?
            </h2>

            <p className="text-navy-400 mt-3 text-sm">
              Manage the services you offer to customers
              through ShramSetu.
            </p>

          </div>


          {workerCategoryServices.length > 0 ? (

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

              {workerCategoryServices.map(
                (service) => {

                  const ServiceIcon =
                    service.icon;

                  return (
                    <div
                      key={service.id}
                      className="card p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
                    >

                      <div className="w-14 h-14 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center mb-4">

                        {ServiceIcon ? (
                          <ServiceIcon size={24} />
                        ) : (
                          <ShieldCheck size={24} />
                        )}

                      </div>

                      <p className="font-display font-bold text-navy-700">
                        {getCategoryName(service)}
                      </p>

                      <p className="text-xs text-coop-600 mt-1 font-semibold">
                        Service Offered
                      </p>

                    </div>
                  );
                }
              )}


              {/* ADD SERVICE */}

              <button
                type="button"
                onClick={() =>
                  navigate("/worker-profile")
                }
                className="card p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-navy-200 hover:border-coop-400 hover:bg-coop-50/30 transition-all"
              >

                <div className="w-14 h-14 rounded-xl bg-navy-50 text-navy-500 flex items-center justify-center mb-4">

                  <Plus size={25} />

                </div>

                <p className="font-display font-bold text-navy-700">
                  Add Service
                </p>

                <p className="text-xs text-navy-400 mt-1">
                  Add another skill
                </p>

              </button>

            </div>

          ) : (

            <div className="max-w-md mx-auto">

              <div className="card p-8 text-center border-2 border-dashed border-navy-200">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-coop-50 text-coop-600 flex items-center justify-center">

                  <Plus size={28} />

                </div>

                <h3 className="font-display font-bold text-lg text-navy-700 mt-4">
                  Add Your Services
                </h3>

                <p className="text-sm text-navy-400 mt-2 leading-relaxed">
                  Tell customers what services you provide
                  by adding your skills to your worker profile.
                </p>

                <Button
                  variant="secondary"
                  className="mt-5"
                  onClick={() =>
                    navigate("/WorkerProfile")
                  }
                >
                  Add Service
                  <ArrowRight size={15} />
                </Button>

              </div>

            </div>

          )}

        </section>
      )}


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-gradient-to-r from-navy-600 to-coop-600">

        <div className="container-app py-16 text-center">

          {isCustomer ? (

            <>

              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-semibold">

                <Sparkles size={14} />

                Start with the problem

              </span>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-4">
                Your home problem starts here.
              </h2>

              <p className="text-navy-100 mt-3 max-w-xl mx-auto">
                Show us the issue. We'll help you find
                the right service and a verified professional.
              </p>

              <div className="flex justify-center gap-3 mt-7">

                <Button
                  variant="accent"
                  onClick={handleAIStart}
                >
                  <Camera size={17} />
                  Diagnose a Problem
                  <ArrowRight size={16} />
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/services")
                  }
                  className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/15 transition"
                >
                  Browse Services
                </button>

              </div>

            </>

          ) : (

            <>

              <h2 className="font-display font-extrabold text-3xl text-white">
                Empowering Workers. Serving Communities.
              </h2>

              <p className="text-navy-100 mt-3 max-w-xl mx-auto">
                Join thousands of households and cooperative
                workers building a fairer local services economy.
              </p>

              {isWorker && (
                <div className="flex justify-center gap-3 mt-7">

                  <Button
                    variant="accent"
                    onClick={() =>
                      navigate("/WorkerDashboard")
                    }
                  >
                    My Jobs
                  </Button>

                </div>
              )}

            </>

          )}

        </div>

      </section>

    </div>
  );
}