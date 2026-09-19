import React, { useRef, useState } from "react";
import {
  Brain,
  Lightbulb,
  Sparkles,
  Upload,
  Camera,
  Video,
  Mic,
  ScanLine,
  Ruler,
  AlertTriangle,
  Wrench,
  IndianRupee,
  Clock3,
  MessageCircle,
  Send,
  X,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  FileSearch,
  History,
  ShoppingBag,
  Users,
  CalendarCheck,
} from "lucide-react";

import { Badge } from "../components/UI";

export default function AIInsights() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [diagnosis, setDiagnosis] = useState(null);

  /* =====================================================
     CHATBOT
  ===================================================== */

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        "Hi! I'm the ShramSetu AI Assistant. Tell me about your home problem and I'll help you understand what service you may need.",
    },
  ]);

  /* =====================================================
     CUSTOMER AI RECOMMENDATIONS
  ===================================================== */

  const customerRecommendations = [
    {
      icon: History,
      title: "Home Maintenance Check",
      description:
        "Based on your service history, a routine home maintenance check may help identify small issues before they become expensive repairs.",
      tag: "Based on service history",
      action: "Explore Maintenance",
    },
    {
      icon: Wrench,
      title: "Recommended Service",
      description:
        "AI can recommend the most relevant service category after analyzing the problem you describe, upload or scan.",
      tag: "Personalized",
      action: "Start Diagnosis",
    },
    {
      icon: ShoppingBag,
      title: "Recommended Materials",
      description:
        "Once your problem is assessed, ShramSetu can suggest commonly required materials or equipment for the selected service.",
      tag: "Based on diagnosis",
      action: "View Requirements",
    },
  ];

  /* =====================================================
     UPLOAD
  ===================================================== */

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDiagnosis(null);
  };

  /* =====================================================
     AI ANALYSIS - PROTOTYPE
  ===================================================== */

  const analyzeProblem = () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setDiagnosis(null);

    setTimeout(() => {
      setAnalyzing(false);

      setDiagnosis({
        problem: "Wall Surface Damage",
        category: "Wall Repair / Waterproofing",
        severity: "Moderate",
        area: "4.36 m²",
        depth: "18 mm",
        cost: "₹1,800 – ₹2,600",
        duration: "1–2 days",
        confidence: 86,
        materials: [
          "Surface preparation material",
          "Primer",
          "Wall repair compound",
          "Protective coating",
        ],
      });
    }, 1800);
  };

  /* =====================================================
     LIDAR / 3D SCAN - PROTOTYPE
  ===================================================== */

  const startLidarScan = () => {
    setScanning(true);
    setDiagnosis(null);

    setTimeout(() => {
      setScanning(false);

      setDiagnosis({
        problem: "Surface Irregularity Detected",
        category: "Wall Repair / Waterproofing",
        severity: "Moderate",
        area: "4.36 m²",
        depth: "18 mm",
        cost: "₹1,800 – ₹2,600",
        duration: "1–2 days",
        confidence: 91,
        materials: [
          "Surface preparation material",
          "Primer",
          "Waterproof coating",
          "Repair compound",
        ],
      });
    }, 2500);
  };

  /* =====================================================
     RESET
  ===================================================== */

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setDiagnosis(null);
    setAnalyzing(false);
    setScanning(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     CUSTOMER AI RECOMMENDATION AFTER DIAGNOSIS
  ===================================================== */

  const getPersonalizedRecommendations = () => {
    if (!diagnosis) {
      return customerRecommendations;
    }

    return [
      {
        icon: Wrench,
        title: diagnosis.category,
        description:
          "Based on the current AI assessment, this is the most relevant service category for the detected problem.",
        tag: "AI matched",
        action: "Find Verified Workers",
      },
      {
        icon: ShoppingBag,
        title: "Materials You May Need",
        description:
          "The assessment suggests a few materials that may be required during the repair. Final requirements should be confirmed by the worker.",
        tag: "AI suggested",
        action: "View Materials",
      },
      {
        icon: CalendarCheck,
        title: "Schedule a Service",
        description:
          `The estimated service duration is ${diagnosis.duration}. You can continue to verified worker matching and choose a suitable time slot.`,
        tag: "Recommended next step",
        action: "Book Service",
      },
    ];
  };

  /* =====================================================
     CHATBOT RESPONSE
  ===================================================== */

  const getBotResponse = (text) => {
    const value = text.toLowerCase();

    if (
      value.includes("cost") ||
      value.includes("price") ||
      value.includes("estimate")
    ) {
      if (diagnosis) {
        return `Based on the current prototype analysis, the estimated cost is ${diagnosis.cost}. The final price should be confirmed after on-site worker verification.`;
      }

      return "Upload a photo or run a 3D scan first. I can then provide a preliminary prototype estimate.";
    }

    if (
      value.includes("service") ||
      value.includes("worker") ||
      value.includes("repair")
    ) {
      if (diagnosis) {
        return `The recommended service is ${diagnosis.category}. You can continue to verified worker matching after reviewing the AI assessment.`;
      }

      return "Show me the problem first and I'll suggest the most relevant service category.";
    }

    if (
      value.includes("scan") ||
      value.includes("lidar") ||
      value.includes("3d") ||
      value.includes("measure")
    ) {
      return "The 3D/LiDAR workflow is designed to capture spatial information such as dimensions, depth and affected area. Your partner can later connect the real depth API here.";
    }

    if (
      value.includes("problem") ||
      value.includes("diagnos") ||
      value.includes("analy")
    ) {
      if (diagnosis) {
        return `The current assessment indicates ${diagnosis.problem} with ${diagnosis.severity.toLowerCase()} severity and an affected area of approximately ${diagnosis.area}.`;
      }

      return "Upload an image or start a 3D scan and I'll analyze the visible problem.";
    }

    if (
      value.includes("material") ||
      value.includes("equipment") ||
      value.includes("buy")
    ) {
      if (diagnosis) {
        return `The assessment suggests these materials may be required: ${diagnosis.materials.join(
          ", "
        )}. The final material list should be confirmed by the assigned worker.`;
      }

      return "Once your problem is analyzed, I can show the materials or equipment that may be relevant to the recommended service.";
    }

    return "I can help you understand your problem, recommended service, measurements, estimated cost and possible materials.";
  };

  /* =====================================================
     SEND CHAT MESSAGE
  ===================================================== */

  const sendMessage = (text = chatInput) => {
    const message = text.trim();

    if (!message) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    setTimeout(() => {
      const response = getBotResponse(message);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: response,
        },
      ]);
    }, 500);
  };

  /* =====================================================
     TELL US
  ===================================================== */

  const openTellUs = () => {
    setChatOpen(true);
    setChatInput("");
  };

  const personalizedRecommendations =
    getPersonalizedRecommendations();

  return (
    <div className="container-app py-8 pb-28">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-500 text-white">
            <Brain size={22} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">
                AI Insights
              </h1>

              <Badge color="saffron">
                <Sparkles size={12} />
                AI Powered
              </Badge>

            </div>

            <p className="mt-1 text-sm text-navy-400">
              Understand your problem, get personalized recommendations and
              find the right service.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm">

          <ShieldCheck size={18} className="text-coop-600" />

          <div>

            <p className="text-xs font-bold text-navy-700">
              Personalized AI Assistance
            </p>

            <p className="text-[11px] text-navy-400">
              Customer-side prototype
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="mt-8 overflow-hidden rounded-3xl bg-navy-700 shadow-card">

        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">

          <div className="p-7 sm:p-9 lg:p-12">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
              <Sparkles size={13} />
              Personal Home Problem Diagnosis
            </div>

            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">

              Don't know what's
              <span className="block">
                wrong?
              </span>

              <span className="block text-coop-400">
                Just show us.
              </span>

            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-navy-100 sm:text-base">
              Upload a photo or video, describe the problem using your voice,
              or use a supported 3D/depth scan. ShramSetu helps you understand
              the likely problem and find the service you may need.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              {/* UPLOAD */}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-700 transition hover:bg-slate-100"
              >
                <Upload size={17} />
                Upload Photo / Video
              </button>

              {/* LIDAR */}

              <button
                type="button"
                onClick={startLidarScan}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <ScanLine size={17} />
                Scan with LiDAR / 3D
              </button>

              {/* TELL US */}

              <button
                type="button"
                onClick={openTellUs}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Mic size={17} />
                Tell Us
              </button>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

          </div>

          {/* HERO VISUAL */}

          <div className="relative min-h-[330px] overflow-hidden bg-navy-600 p-6">

            <div className="absolute inset-0 opacity-20">

              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white" />

              <div className="absolute right-10 top-24 h-56 w-56 rounded-full border border-white" />

              <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full border border-white" />

            </div>

            <div className="relative flex h-full items-center justify-center">

              <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coop-500 text-white">
                      <Brain size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-white">
                        Your AI Inspection
                      </p>

                      <p className="text-[11px] text-navy-100">
                        Personalized analysis
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-coop-400/20 px-2.5 py-1 text-[10px] font-bold text-coop-300">
                    READY
                  </span>

                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-white/30 bg-navy-700/50 p-7 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <FileSearch size={30} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-white">
                    Show your problem
                  </p>

                  <p className="mt-1 text-xs leading-5 text-navy-100">
                    AI combines visual information, spatial measurements and
                    your description to provide a preliminary assessment.
                  </p>

                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">

                  {[
                    ["Visual", Camera],
                    ["Spatial", Ruler],
                    ["AI", Brain],
                  ].map(([label, Icon]) => (

                    <div
                      key={label}
                      className="rounded-xl bg-white/10 px-2 py-3 text-center"
                    >

                      <Icon
                        size={16}
                        className="mx-auto text-coop-300"
                      />

                      <p className="mt-1 text-[10px] font-semibold text-white">
                        {label}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          INSPECTION WORKSPACE
      ===================================================== */}

      <section className="mt-8">

        <div className="mb-4">

          <h2 className="font-display text-xl font-bold text-navy-700">
            Inspection Workspace
          </h2>

          <p className="mt-1 text-xs text-navy-400">
            Show or describe your problem to get a personalized assessment.
          </p>

        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* PHOTO / VIDEO */}

          <div className="card overflow-hidden">

            <div className="border-b border-navy-100 px-6 py-4">

              <div className="flex items-center gap-2">

                <Camera
                  size={18}
                  className="text-navy-600"
                />

                <p className="font-display font-bold text-navy-700">
                  1. Show the Problem
                </p>

              </div>

            </div>

            <div className="p-6">

              {!selectedFile ? (

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[270px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-100 bg-navy-50/50 px-6 text-center transition hover:border-coop-400 hover:bg-coop-50/30"
                >

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-navy-500 shadow-sm">
                    <Upload size={25} />
                  </div>

                  <p className="mt-4 font-display font-bold text-navy-700">
                    Upload a photo or video
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-navy-400">
                    Capture the visible problem clearly for better analysis.
                  </p>

                  <div className="mt-5 flex items-center gap-4 text-xs text-navy-400">

                    <span className="flex items-center gap-1">
                      <Camera size={14} />
                      Photo
                    </span>

                    <span className="flex items-center gap-1">
                      <Video size={14} />
                      Video
                    </span>

                  </div>

                </button>

              ) : (

                <div>

                  <div className="relative overflow-hidden rounded-2xl bg-navy-900">

                    {selectedFile.type.startsWith("video/") ? (

                      <video
                        src={previewUrl}
                        controls
                        className="h-[270px] w-full object-cover"
                      />

                    ) : (

                      <img
                        src={previewUrl}
                        alt="Selected problem"
                        className="h-[270px] w-full object-cover"
                      />

                    )}

                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-navy-700">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-navy-400">
                        Ready for AI analysis
                      </p>

                    </div>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={resetAnalysis}
                        className="rounded-xl border border-navy-100 px-3 py-2.5 text-xs font-bold text-navy-600 hover:bg-navy-50"
                      >
                        Reset
                      </button>

                      <button
                        type="button"
                        onClick={analyzeProblem}
                        disabled={analyzing}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                      >

                        <Brain size={15} />

                        {analyzing
                          ? "Analyzing..."
                          : "Analyze Problem"}

                      </button>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* LIDAR */}

          <div className="card overflow-hidden">

            <div className="border-b border-navy-100 px-6 py-4">

              <div className="flex items-center gap-2">

                <ScanLine
                  size={18}
                  className="text-coop-600"
                />

                <p className="font-display font-bold text-navy-700">
                  2. Measure with 3D / LiDAR
                </p>

              </div>

            </div>

            <div className="p-6">

              <div className="relative min-h-[270px] overflow-hidden rounded-2xl bg-navy-700">

                {scanning ? (

                  <div className="relative flex min-h-[270px] flex-col items-center justify-center text-center">

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-coop-400/50">

                      <div className="absolute inset-2 animate-ping rounded-full bg-coop-400/20" />

                      <ScanLine
                        size={30}
                        className="relative text-coop-300"
                      />

                    </div>

                    <p className="mt-5 font-display font-bold text-white">
                      Scanning spatial environment...
                    </p>

                    <p className="mt-1 text-xs text-navy-100">
                      Capturing depth and dimensions
                    </p>

                    <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">

                      <div className="h-full w-2/3 animate-pulse rounded-full bg-coop-400" />

                    </div>

                  </div>

                ) : (

                  <div className="relative flex min-h-[270px] flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-coop-300">
                      <Ruler size={28} />
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold text-white">
                      Measure what a normal camera can't.
                    </h3>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-navy-100">
                      A supported depth/LiDAR device can provide spatial
                      measurements such as area, distance and depth.
                    </p>

                    <button
                      type="button"
                      onClick={startLidarScan}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-coop-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-coop-600"
                    >
                      <ScanLine size={15} />
                      Start 3D Scan
                    </button>

                  </div>

                )}

              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">

                <div className="rounded-xl bg-navy-50 p-3 text-center">

                  <p className="text-[10px] uppercase text-navy-300">
                    Area
                  </p>

                  <p className="mt-1 text-sm font-bold text-navy-700">
                    {diagnosis?.area || "--"}
                  </p>

                </div>

                <div className="rounded-xl bg-navy-50 p-3 text-center">

                  <p className="text-[10px] uppercase text-navy-300">
                    Depth
                  </p>

                  <p className="mt-1 text-sm font-bold text-navy-700">
                    {diagnosis?.depth || "--"}
                  </p>

                </div>

                <div className="rounded-xl bg-navy-50 p-3 text-center">

                  <p className="text-[10px] uppercase text-navy-300">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-coop-600">
                    {diagnosis ? "Captured" : "Waiting"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DIAGNOSIS
      ===================================================== */}

      {diagnosis && (

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="font-display text-xl font-bold text-navy-700">
              Your AI Assessment
            </h2>

            <p className="mt-1 text-xs text-navy-400">
              Personalized assessment based on the information you provided.
            </p>

          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

            <div className="card overflow-hidden">

              <div className="flex flex-col gap-4 border-b border-navy-100 bg-navy-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
                    <CheckCircle2 size={22} />
                  </div>

                  <div>

                    <p className="font-display font-bold text-navy-700">
                      Analysis Complete
                    </p>

                    <p className="text-xs text-navy-400">
                      AI + visual/depth assessment
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-coop-50 px-3 py-1.5 text-xs font-bold text-coop-700">
                  {diagnosis.confidence}% confidence
                </span>

              </div>

              <div className="p-6">

                <div className="grid gap-4 sm:grid-cols-2">

                  <ResultItem
                    icon={AlertTriangle}
                    label="Possible Problem"
                    value={diagnosis.problem}
                  />

                  <ResultItem
                    icon={Wrench}
                    label="Recommended Service"
                    value={diagnosis.category}
                  />

                  <ResultItem
                    icon={AlertTriangle}
                    label="Severity"
                    value={diagnosis.severity}
                  />

                  <ResultItem
                    icon={Ruler}
                    label="Affected Area"
                    value={diagnosis.area}
                  />

                  <ResultItem
                    icon={IndianRupee}
                    label="Estimated Cost"
                    value={diagnosis.cost}
                  />

                  <ResultItem
                    icon={Clock3}
                    label="Estimated Duration"
                    value={diagnosis.duration}
                  />

                </div>

                <div className="mt-6 rounded-2xl bg-navy-50 p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-bold text-navy-700">
                      AI Confidence
                    </p>

                    <p className="text-sm font-bold text-coop-600">
                      {diagnosis.confidence}%
                    </p>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">

                    <div
                      className="h-full rounded-full bg-coop-500"
                      style={{
                        width: `${diagnosis.confidence}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-xs font-bold text-white hover:bg-navy-600"
                  >
                    <Users size={15} />
                    Find Verified Workers
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChatOpen(true);
                      setChatInput("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-5 py-3 text-xs font-bold text-navy-700 hover:bg-navy-50"
                  >
                    <MessageCircle size={15} />
                    Ask AI Assistant
                  </button>

                </div>

              </div>

            </div>

            {/* MATERIALS */}

            <div className="card p-6">

              <div className="flex items-center gap-2">

                <ShoppingBag
                  size={18}
                  className="text-coop-600"
                />

                <p className="font-display font-bold text-navy-700">
                  Suggested Requirements
                </p>

              </div>

              <p className="mt-1 text-xs text-navy-400">
                Materials or equipment that may be required
              </p>

              <div className="mt-5 space-y-3">

                {diagnosis.materials.map((material, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl bg-navy-50 p-3"
                  >

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-coop-600">
                      <CheckCircle2 size={15} />
                    </div>

                    <p className="text-xs font-medium text-navy-600">
                      {material}
                    </p>

                  </div>

                ))}

              </div>

              <button
                type="button"
                onClick={() => {
                  setChatOpen(true);
                  setChatInput("What materials do I need?");
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-3 text-xs font-bold text-white hover:bg-navy-600"
              >
                Ask About Requirements
                <ChevronRight size={15} />
              </button>

            </div>

          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-4">

            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-saffron-600"
            />

            <p className="text-xs leading-5 text-navy-600">

              <strong>Important:</strong> This is an AI-generated prototype
              estimate, not a final diagnosis or quotation. The assigned
              verified worker should inspect the problem on-site before the
              final service and price are confirmed.

            </p>

          </div>

        </section>

      )}

      {/* =====================================================
          CUSTOMER AI RECOMMENDATIONS
      ===================================================== */}

      <section className="mt-10">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coop-50 text-coop-600">
                <Lightbulb size={19} />
              </div>

              <h2 className="font-display text-xl font-bold text-navy-700">
                Recommendations for You
              </h2>

            </div>

            <p className="mt-2 text-xs text-navy-400">
              Personalized suggestions based on your service needs and AI
              assessment.
            </p>

          </div>

          <Badge color="saffron">
            <Sparkles size={12} />
            Personalized AI
          </Badge>

        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">

          {personalizedRecommendations.map((recommendation, index) => {

            const Icon = recommendation.icon;

            return (
              <div
                key={index}
                className="card group p-5 transition hover:-translate-y-1 hover:shadow-card"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <Icon size={19} />
                  </div>

                  <span className="rounded-full bg-coop-50 px-2.5 py-1 text-[10px] font-bold text-coop-700">
                    {recommendation.tag}
                  </span>

                </div>

                <h3 className="mt-5 font-display font-bold text-navy-700">
                  {recommendation.title}
                </h3>

                <p className="mt-2 min-h-[60px] text-xs leading-5 text-navy-400">
                  {recommendation.description}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (recommendation.action.includes("Diagnosis")) {
                      fileInputRef.current?.click();
                    } else {
                      setChatOpen(true);
                      setChatInput(recommendation.title);
                    }
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 transition group-hover:text-coop-600"
                >
                  {recommendation.action}
                  <ChevronRight size={14} />
                </button>

              </div>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          PERSONAL SERVICE INSIGHTS
      ===================================================== */}

      <section className="mt-10">

        <div className="mb-5">

          <h2 className="font-display text-xl font-bold text-navy-700">
            Your Home Service Insights
          </h2>

          <p className="mt-1 text-xs text-navy-400">
            A future personalized layer built from your ShramSetu service
            history.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <InsightCard
            icon={History}
            title="Service History"
            text="Your previous services can help ShramSetu provide more relevant recommendations."
          />

          <InsightCard
            icon={CalendarCheck}
            title="Maintenance Reminder"
            text="The AI can remind you about recurring or seasonal home maintenance."
          />

          <InsightCard
            icon={Users}
            title="Worker Recommendations"
            text="Based on your selected service, verified workers can be recommended by skill, rating, availability and distance."
          />

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="mt-10">

        <div className="mb-5">

          <h2 className="font-display text-xl font-bold text-navy-700">
            How ShramSetu AI Works
          </h2>

          <p className="mt-1 text-xs text-navy-400">
            From your problem to a service you can book.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            {
              number: "01",
              title: "Show",
              text: "Upload a photo, video or describe the issue.",
              icon: Camera,
            },
            {
              number: "02",
              title: "Measure",
              text: "Use supported depth/LiDAR technology for spatial data.",
              icon: Ruler,
            },
            {
              number: "03",
              title: "Understand",
              text: "AI identifies the likely problem and suggests a relevant service.",
              icon: Brain,
            },
            {
              number: "04",
              title: "Connect",
              text: "Find a verified worker suited to your service requirement.",
              icon: Users,
            },
          ].map((step) => {

            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="card p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <Icon size={19} />
                  </div>

                  <span className="font-display text-2xl font-bold text-navy-100">
                    {step.number}
                  </span>

                </div>

                <p className="mt-5 font-display font-bold text-navy-700">
                  {step.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-navy-400">
                  {step.text}
                </p>

              </div>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          CHATBOT
      ===================================================== */}

      {chatOpen && (

        <div className="fixed bottom-24 right-5 z-[2000] flex w-[calc(100vw-40px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-2xl">

          {/* HEADER */}

          <div className="flex items-center justify-between bg-navy-700 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coop-500 text-white">
                <Brain size={19} />
              </div>

              <div>

                <p className="font-display text-sm font-bold text-white">
                  ShramSetu AI Assistant
                </p>

                <div className="flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-coop-400" />

                  <span className="text-[10px] text-navy-100">
                    Ready to help
                  </span>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>

          </div>

          {/* MESSAGES */}

          <div className="h-[330px] space-y-3 overflow-y-auto bg-slate-50 p-4">

            {chatMessages.map((message) => (

              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                    message.sender === "user"
                      ? "rounded-br-md bg-navy-700 text-white"
                      : "rounded-bl-md bg-white text-navy-600 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>

              </div>

            ))}

          </div>

          {/* QUICK ACTIONS */}

          <div className="border-t border-navy-100 bg-white px-4 pt-3">

            <div className="flex gap-2 overflow-x-auto pb-3">

              {[
                "Analyze my problem",
                "What service do I need?",
                "Estimate the cost",
                "What materials do I need?",
              ].map((text) => (

                <button
                  key={text}
                  type="button"
                  onClick={() => sendMessage(text)}
                  className="whitespace-nowrap rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5 text-[10px] font-semibold text-navy-600 hover:border-coop-300 hover:bg-coop-50"
                >
                  {text}
                </button>

              ))}

            </div>

            {/* INPUT */}

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-navy-100 bg-slate-50 p-1.5">

              <button
                type="button"
                onClick={openTellUs}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coop-500 text-white hover:bg-coop-600"
                title="Voice assistant"
              >
                <Mic size={14} />
              </button>

              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask ShramSetu AI..."
                className="min-w-0 flex-1 bg-transparent px-2 text-xs text-navy-700 outline-none placeholder:text-navy-300"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-700 text-white hover:bg-navy-600"
              >
                <Send size={14} />
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          FLOATING AI BUTTON
      ===================================================== */}

      {!chatOpen && (

        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-[2000] flex items-center gap-3 rounded-2xl bg-navy-700 px-4 py-3 text-white shadow-xl transition hover:-translate-y-1 hover:bg-navy-600"
          aria-label="Open ShramSetu AI Assistant"
        >

          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-coop-500">

            <MessageCircle size={18} />

            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-coop-300 ring-2 ring-navy-700" />

          </div>

          <div className="hidden text-left sm:block">

            <p className="text-xs font-bold">
              Ask ShramSetu AI
            </p>

            <p className="text-[10px] text-navy-100">
              Need help with your problem?
            </p>

          </div>

        </button>

      )}

    </div>
  );
}

/* =========================================================
   RESULT ITEM
========================================================= */

function ResultItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4">

      <div className="flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-500">
          <Icon size={15} />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-300">
          {label}
        </p>

      </div>

      <p className="mt-3 font-display text-sm font-bold text-navy-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   CUSTOMER INSIGHT CARD
========================================================= */

function InsightCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="card p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
        <Icon size={19} />
      </div>

      <p className="mt-4 font-display font-bold text-navy-700">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-navy-400">
        {text}
      </p>

    </div>
  );
}   