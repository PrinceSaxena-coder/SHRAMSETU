import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  TrendingUp,
  MapPin,
  Clock3,
  IndianRupee,
  Zap,
  Target,
  Star,
  Award,
  Wrench,
  ChevronRight,
  Sparkles,
  Navigation,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Route,
  Briefcase,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Timer,
  Activity,
  Gauge,
  CircleDollarSign,
  Map,
  ArrowUp,
  Flame,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   MOCK AI DATA
   Frontend prototype only
========================================================= */

const DEMAND_ZONES = [
  {
    id: "zone-1",
    area: "Vaishali Nagar",
    distance: "3.2 km",
    requests: 18,
    demand: "Very High",
    growth: "+32%",
    earning: "₹650–₹900",
    score: 94,
    reason: "High electrical and appliance-service demand.",
  },
  {
    id: "zone-2",
    area: "Mansarovar",
    distance: "5.1 km",
    requests: 14,
    demand: "High",
    growth: "+24%",
    earning: "₹550–₹800",
    score: 86,
    reason: "Strong demand with moderate travel distance.",
  },
  {
    id: "zone-3",
    area: "Malviya Nagar",
    distance: "7.4 km",
    requests: 9,
    demand: "Medium",
    growth: "+11%",
    earning: "₹450–₹650",
    score: 68,
    reason: "Moderate demand but longer travel distance.",
  },
  {
    id: "zone-4",
    area: "C-Scheme",
    distance: "6.2 km",
    requests: 11,
    demand: "High",
    growth: "+19%",
    earning: "₹500–₹750",
    score: 81,
    reason: "Consistent household repair requests.",
  },
];

const WORKING_SLOTS = [
  {
    id: "slot-1",
    time: "08:00 AM – 10:00 AM",
    demand: "Medium",
    earning: "₹350–₹500",
    score: 64,
    requests: 7,
  },
  {
    id: "slot-2",
    time: "10:00 AM – 12:00 PM",
    demand: "High",
    earning: "₹500–₹700",
    score: 82,
    requests: 13,
  },
  {
    id: "slot-3",
    time: "12:00 PM – 02:00 PM",
    demand: "Medium",
    earning: "₹400–₹550",
    score: 69,
    requests: 8,
  },
  {
    id: "slot-4",
    time: "02:00 PM – 04:00 PM",
    demand: "Medium",
    earning: "₹400–₹600",
    score: 71,
    requests: 9,
  },
  {
    id: "slot-5",
    time: "04:00 PM – 06:00 PM",
    demand: "High",
    earning: "₹550–₹750",
    score: 84,
    requests: 14,
  },
  {
    id: "slot-6",
    time: "06:00 PM – 08:00 PM",
    demand: "Very High",
    earning: "₹650–₹900",
    score: 94,
    requests: 18,
  },
  {
    id: "slot-7",
    time: "08:00 PM – 10:00 PM",
    demand: "High",
    earning: "₹550–₹750",
    score: 87,
    requests: 15,
  },
];

const SMART_GIGS = [
  {
    id: "gig-101",
    service: "Electrical Repair",
    customer: "Amit Kumar",
    area: "Vaishali Nagar",
    distance: "3.2 km",
    time: "06:00 PM – 08:00 PM",
    earning: "₹750–₹900",
    match: 96,
    reason: "Matches your primary skill and preferred distance.",
  },
  {
    id: "gig-102",
    service: "Appliance Installation",
    customer: "Neha Sharma",
    area: "Mansarovar",
    distance: "5.1 km",
    time: "04:00 PM – 06:00 PM",
    earning: "₹600–₹750",
    match: 89,
    reason: "Strong demand and good earning potential.",
  },
  {
    id: "gig-103",
    service: "Electrical Inspection",
    customer: "Rahul Mehta",
    area: "C-Scheme",
    distance: "6.2 km",
    time: "08:00 PM – 10:00 PM",
    earning: "₹650–₹800",
    match: 84,
    reason: "Good earning opportunity during peak demand.",
  },
];

const SKILL_INSIGHTS = [
  {
    title: "Electrical Repair",
    demand: "+28%",
    level: "Very High",
    description:
      "Electrical repair requests are currently one of the strongest demand categories in your service area.",
    action: "View matching gigs",
    icon: Zap,
  },
  {
    title: "AC Servicing",
    demand: "+24%",
    level: "High",
    description:
      "AC-related requests are increasing and could create additional earning opportunities.",
    action: "Explore training",
    icon: Wrench,
  },
  {
    title: "Appliance Installation",
    demand: "+16%",
    level: "Growing",
    description:
      "Installation requests are trending upward across nearby residential zones.",
    action: "Explore skill",
    icon: Award,
  },
];

const PERFORMANCE_DATA = {
  rating: 4.7,
  completion: 96,
  response: 94,
  repeatCustomers: 82,
  completedJobs: 47,
  weeklyGrowth: 14,
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WorkerAIInsights() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [selectedZone, setSelectedZone] = useState(DEMAND_ZONES[0]);
  const [selectedSlot, setSelectedSlot] = useState(WORKING_SLOTS[5]);

  /* =======================================================
     AI OPPORTUNITY SCORE
  ======================================================= */

  const aiScore = useMemo(() => {
    return Math.round(
      (PERFORMANCE_DATA.rating * 20 +
        PERFORMANCE_DATA.completion +
        PERFORMANCE_DATA.response +
        PERFORMANCE_DATA.repeatCustomers) /
        4
    );
  }, []);

  /* =======================================================
     FORECAST
  ======================================================= */

  const forecast = useMemo(() => {
    const completed = Number(
      localStorage.getItem("ss_worker_completed_jobs") || 47
    );

    const baseDaily = 1250;
    const predicted = Math.round(
      baseDaily + completed * 8 + PERFORMANCE_DATA.weeklyGrowth * 5
    );

    return {
      today: predicted,
      week: predicted * 6,
      month: predicted * 24,
    };
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshInsights = () => {
    setLastUpdated("Updated just now");
  };

  /* =======================================================
     GIG NAVIGATION
  ======================================================= */

  const viewGigs = () => {
    navigate("/worker-gigs");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>

              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-coop-600">
                  ShramSetu Worker Intelligence
                </p>

                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-700">
                  AI Insights
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshInsights}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
              title="Refresh AI insights"
            >
              <RefreshCw size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* =================================================
            AI HERO
        ================================================= */}

        <section className="rounded-3xl bg-navy-700 text-white p-5 sm:p-7 mb-6 overflow-hidden relative">
          <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute right-20 bottom-[-90px] w-60 h-60 rounded-full bg-coop-500/10" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold">
                <Sparkles size={13} />
                AI-powered worker intelligence
              </span>

              <span className="text-xs text-white/50">
                {lastUpdated}
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight max-w-3xl">
                  Know where to work,
                  <br />
                  when to work and what to expect.
                </h2>

                <p className="text-sm sm:text-base text-white/70 mt-4 max-w-2xl leading-relaxed">
                  ShramSetu AI analyzes local demand, your skills,
                  availability, gig distance and past performance to
                  recommend better earning opportunities.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="button"
                    onClick={viewGigs}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-navy-700 text-sm font-extrabold hover:bg-slate-100 transition"
                  >
                    <Briefcase size={16} />
                    View matching gigs
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("demand")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-bold hover:bg-white/15 transition"
                  >
                    <Map size={16} />
                    Explore demand
                  </button>
                </div>
              </div>

              {/* SCORE */}

              <div className="rounded-3xl bg-white/10 border border-white/10 p-6 min-w-[220px]">
                <p className="text-xs text-white/60 font-semibold">
                  Worker Opportunity Score
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="relative w-24 h-24 rounded-full border-[7px] border-white/15 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[7px] border-coop-400 border-r-transparent border-b-transparent rotate-[-35deg]" />

                    <span className="text-2xl font-extrabold">
                      {aiScore}
                    </span>
                  </div>

                  <div>
                    <p className="font-extrabold text-lg">
                      Strong
                    </p>

                    <p className="text-xs text-white/55 mt-1 leading-relaxed">
                      Based on performance,
                      demand and skill fit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            TODAY'S SNAPSHOT
        ================================================= */}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-coop-600">
                Today's AI snapshot
              </p>

              <h2 className="font-extrabold text-xl text-navy-700">
                Your best opportunities
              </h2>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
              <Activity size={14} />
              Live prototype data
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InsightStatCard
              icon={Flame}
              label="Demand increase"
              value="+24%"
              description="vs last week"
            />

            <InsightStatCard
              icon={CircleDollarSign}
              label="Best estimated earning"
              value="₹900"
              description="peak slot"
            />

            <InsightStatCard
              icon={MapPin}
              label="Best area"
              value="Vaishali"
              description="18 nearby requests"
            />

            <InsightStatCard
              icon={Clock3}
              label="Best slot"
              value="6–8 PM"
              description="94/100 opportunity"
            />
          </div>
        </section>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 mb-6 flex overflow-x-auto gap-1">
          {[
            ["overview", "Overview"],
            ["demand", "Demand"],
            ["earnings", "Earnings"],
            ["gigs", "Smart Gigs"],
            ["skills", "Skills"],
            ["performance", "Performance"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 min-w-[105px] px-4 py-2.5
                rounded-xl text-sm font-bold transition
                ${
                  activeTab === id
                    ? "bg-navy-700 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* AI RECOMMENDATION */}

            <section className="rounded-2xl border border-coop-200 bg-coop-50 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <Lightbulb size={22} className="text-coop-600" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-navy-700">
                      AI recommendation for you
                    </h3>

                    <span className="px-2 py-1 rounded-full bg-coop-100 text-coop-700 text-[10px] font-bold">
                      HIGH OPPORTUNITY
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Your electrical skill has strong demand today.
                    Vaishali Nagar currently shows the highest
                    opportunity score, especially during the 6:00 PM –
                    8:00 PM slot. The estimated earning range is
                    ₹650–₹900.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-3 mt-4">
                    <RecommendationMetric
                      icon={MapPin}
                      label="Recommended area"
                      value="Vaishali Nagar"
                    />

                    <RecommendationMetric
                      icon={Clock3}
                      label="Recommended slot"
                      value="06:00–08:00 PM"
                    />

                    <RecommendationMetric
                      icon={IndianRupee}
                      label="Estimated earning"
                      value="₹650–₹900"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={viewGigs}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 text-white text-sm font-bold"
                    >
                      Find matching gigs
                      <ChevronRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("demand")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-coop-200 text-navy-700 text-sm font-bold"
                    >
                      <MapPin size={16} />
                      View demand
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SMART GIGS */}

            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionHeader
                icon={Target}
                title="Gigs AI recommends for you"
                subtitle="Matched using skill, distance, demand and estimated earning"
              />

              <div className="grid lg:grid-cols-3 gap-4 mt-5">
                {SMART_GIGS.map((gig) => (
                  <SmartGigCard
                    key={gig.id}
                    gig={gig}
                    onView={viewGigs}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={viewGigs}
                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-navy-700 text-sm font-bold hover:bg-slate-100"
              >
                View all available gigs
                <ArrowUpRight size={16} />
              </button>
            </section>

            {/* BEST TIME + HOT ZONE */}

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-5">
                <SectionHeader
                  icon={Clock3}
                  title="Best time to work"
                  subtitle="Today's predicted demand by 2-hour slot"
                />

                <div className="space-y-3 mt-5">
                  {WORKING_SLOTS.map((slot) => (
                    <TimeSlot
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot.id === slot.id}
                      onClick={() => setSelectedSlot(slot)}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <Gauge
                      size={19}
                      className="text-coop-600 mt-0.5"
                    />

                    <div>
                      <p className="font-bold text-sm text-navy-700">
                        AI-selected slot
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {selectedSlot.time} currently has a{" "}
                        <strong>{selectedSlot.score}/100</strong>{" "}
                        opportunity score.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-5">
                <SectionHeader
                  icon={MapPin}
                  title="High-demand zones"
                  subtitle="Where your skills may have better opportunities"
                />

                <div className="space-y-3 mt-5">
                  {DEMAND_ZONES.slice(0, 3).map((zone) => (
                    <DemandZone
                      key={zone.id}
                      zone={zone}
                      selected={selectedZone.id === zone.id}
                      onClick={() => setSelectedZone(zone)}
                    />
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-navy-700">
                        {selectedZone.area}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {selectedZone.distance} away
                      </p>
                    </div>

                    <Navigation
                      size={20}
                      className="text-coop-600"
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {selectedZone.reason}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <MiniStat
                      label="Requests"
                      value={selectedZone.requests}
                    />

                    <MiniStat
                      label="Estimated earning"
                      value={selectedZone.earning}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* TRAVEL VS EARNING */}

            <TravelEarningSection />

            {/* SKILLS */}

            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionHeader
                icon={Wrench}
                title="Skill demand intelligence"
                subtitle="Where your existing skills are showing stronger demand"
              />

              <div className="grid md:grid-cols-3 gap-4 mt-5">
                {SKILL_INSIGHTS.map((skill) => (
                  <SkillCard
                    key={skill.title}
                    skill={skill}
                    onAction={
                      skill.title === "Electrical Repair"
                        ? viewGigs
                        : () => navigate("/knowledge-resource")
                    }
                  />
                ))}
              </div>
            </section>

            {/* PERFORMANCE */}

            <PerformanceSection />
          </div>
        )}

        {/* =================================================
            DEMAND TAB
        ================================================= */}

        {activeTab === "demand" && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionHeader
                icon={TrendingUp}
                title="Demand intelligence"
                subtitle="AI prediction based on nearby service requests"
              />

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {DEMAND_ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-coop-200 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-coop-50 flex items-center justify-center">
                          <MapPin
                            size={21}
                            className="text-coop-600"
                          />
                        </div>

                        <div>
                          <p className="font-bold text-navy-700">
                            {zone.area}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {zone.distance} away
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          zone.demand === "Very High"
                            ? "bg-emerald-50 text-emerald-700"
                            : zone.demand === "High"
                            ? "bg-coop-50 text-coop-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {zone.demand}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <MiniStat
                        label="Requests"
                        value={zone.requests}
                      />

                      <MiniStat
                        label="Growth"
                        value={zone.growth}
                      />

                      <MiniStat
                        label="Opportunity"
                        value={`${zone.score}/100`}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">
                          Demand strength
                        </span>

                        <span className="text-xs font-bold text-navy-700">
                          {zone.score}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coop-500"
                          style={{
                            width: `${zone.score}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                      {zone.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-navy-700 text-white p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Brain size={22} />
                </div>

                <div>
                  <p className="font-extrabold">
                    How ShramSetu AI uses demand
                  </p>

                  <p className="text-sm text-white/65 mt-2 leading-relaxed">
                    The prototype combines nearby request volume,
                    historical demand patterns, service category and
                    estimated earning potential to calculate an
                    opportunity score for each zone.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =================================================
            EARNINGS TAB
        ================================================= */}

        {activeTab === "earnings" && (
          <div className="space-y-6">
            <section className="grid sm:grid-cols-3 gap-4">
              <ForecastCard
                icon={IndianRupee}
                title="Today's forecast"
                value={`₹${forecast.today.toLocaleString("en-IN")}`}
                subtitle="AI estimated"
              />

              <ForecastCard
                icon={TrendingUp}
                title="Weekly forecast"
                value={`₹${forecast.week.toLocaleString("en-IN")}`}
                subtitle="Based on available slots"
              />

              <ForecastCard
                icon={BarChart3}
                title="Monthly forecast"
                value={`₹${forecast.month.toLocaleString("en-IN")}`}
                subtitle="Prototype projection"
              />
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionHeader
                icon={IndianRupee}
                title="Earning opportunities"
                subtitle="AI-estimated earning potential by 2-hour slot"
              />

              <div className="space-y-4 mt-6">
                {WORKING_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    className="border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center">
                          <Clock3
                            size={19}
                            className="text-coop-600"
                          />
                        </div>

                        <div>
                          <p className="font-bold text-navy-700">
                            {slot.time}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {slot.requests} predicted requests ·{" "}
                            {slot.demand} demand
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-extrabold text-coop-600">
                          {slot.earning}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          Estimated earning
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">
                          Opportunity score
                        </span>

                        <span className="text-xs font-bold">
                          {slot.score}/100
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-coop-500"
                          style={{
                            width: `${slot.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
              <div className="flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-amber-600 shrink-0 mt-0.5"
                />

                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Important:</strong> All earnings shown
                  here are AI-generated estimates for the prototype.
                  Actual earnings depend on the selected gig, service
                  conditions, distance and final job outcome.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* =================================================
            SMART GIGS TAB
        ================================================= */}

        {activeTab === "gigs" && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5">
            <SectionHeader
              icon={Target}
              title="Smart gig recommendations"
              subtitle="Gigs ranked according to your skill and opportunity fit"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {SMART_GIGS.map((gig) => (
                <SmartGigCard
                  key={gig.id}
                  gig={gig}
                  onView={viewGigs}
                />
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <Brain
                  size={20}
                  className="text-coop-600 shrink-0 mt-0.5"
                />

                <div>
                  <p className="font-bold text-navy-700">
                    How the recommendation works
                  </p>

                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Each gig receives a prototype opportunity score
                    based on skill match, estimated earning, travel
                    distance, demand level and your availability.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            SKILLS TAB
        ================================================= */}

        {activeTab === "skills" && (
          <section className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <SectionHeader
                icon={Wrench}
                title="Skill intelligence"
                subtitle="Use demand trends to decide which skills to strengthen"
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {SKILL_INSIGHTS.map((skill) => (
                  <SkillCard
                    key={skill.title}
                    skill={skill}
                    large
                    onAction={
                      skill.title === "Electrical Repair"
                        ? viewGigs
                        : () => navigate("/knowledge-resource")
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-navy-700 text-white p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <p className="font-extrabold">
                    AI learning recommendation
                  </p>

                  <p className="text-sm text-white/65 mt-2 leading-relaxed">
                    Adding verified skills can increase the number
                    of service categories available to you and may
                    improve future gig matching.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/knowledge-resource")
                    }
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-navy-700 text-sm font-bold"
                  >
                    Explore training
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          </section>
        )}

        {/* =================================================
            PERFORMANCE TAB
        ================================================= */}

        {activeTab === "performance" && (
          <PerformanceSection detailed />
        )}
      </main>

      {/* ===================================================
          MOBILE BOTTOM NAV
      =================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900 text-white border-t border-white/10">
        <div className="max-w-lg mx-auto grid grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="py-3 flex flex-col items-center gap-1 text-xs text-white/60"
          >
            <CalendarDays size={20} />
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/worker-pocket")}
            className="py-3 flex flex-col items-center gap-1 text-xs text-white/60"
          >
            <IndianRupee size={20} />
            Pocket
          </button>

          <button
            type="button"
            onClick={() => navigate("/worker-gigs")}
            className="py-3 flex flex-col items-center gap-1 text-xs text-white/60"
          >
            <Zap size={20} />
            Gigs
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INSIGHT STAT CARD
========================================================= */

function InsightStatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon size={19} className="text-coop-600" />
      </div>

      <p className="text-xs text-slate-400">{label}</p>

      <p className="text-lg sm:text-xl font-extrabold text-navy-700 mt-1 truncate">
        {value}
      </p>

      <p className="text-[11px] text-slate-400 mt-1">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-coop-600" />
      </div>

      <div>
        <h2 className="font-extrabold text-lg text-navy-700">
          {title}
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   RECOMMENDATION METRIC
========================================================= */

function RecommendationMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white border border-coop-100 p-3">
      <Icon size={17} className="text-coop-600" />

      <p className="text-[10px] text-slate-400 mt-2">
        {label}
      </p>

      <p className="text-sm font-extrabold text-navy-700 mt-1">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TIME SLOT
========================================================= */

function TimeSlot({
  slot,
  selected,
  onClick,
}) {
  const isVeryHigh = slot.demand === "Very High";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
        selected
          ? "border-coop-300 bg-coop-50"
          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="w-28 sm:w-32 shrink-0">
        <p className="text-sm font-bold text-navy-700">
          {slot.time}
        </p>

        <p className="text-[10px] text-slate-400 mt-1">
          {slot.requests} requests
        </p>
      </div>

      <div className="flex-1">
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-coop-500"
            style={{
              width: `${slot.score}%`,
            }}
          />
        </div>
      </div>

      <div className="text-right min-w-[85px]">
        <p
          className={`text-xs font-bold ${
            isVeryHigh
              ? "text-emerald-600"
              : "text-slate-600"
          }`}
        >
          {slot.demand}
        </p>

        <p className="text-[10px] text-slate-400">
          {slot.earning}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   DEMAND ZONE
========================================================= */

function DemandZone({
  zone,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition ${
        selected
          ? "border-coop-300 bg-coop-50"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <MapPin size={18} className="text-coop-600" />
          </div>

          <div>
            <p className="font-bold text-sm text-navy-700">
              {zone.area}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {zone.distance} · {zone.requests} requests
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-extrabold text-emerald-600">
            {zone.growth}
          </p>

          <p className="text-[10px] text-slate-400">
            growth
          </p>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-extrabold text-navy-700 mt-1">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SMART GIG CARD
========================================================= */

function SmartGigCard({
  gig,
  onView,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 hover:border-coop-200 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center">
            <Wrench size={19} className="text-coop-600" />
          </div>

          <div>
            <p className="font-bold text-sm text-navy-700">
              {gig.service}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {gig.customer}
            </p>
          </div>
        </div>

        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
          {gig.match}% match
        </span>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={14} className="text-coop-600" />
          {gig.area} · {gig.distance}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={14} className="text-coop-600" />
          {gig.time}
        </div>

        <div className="flex items-center gap-2 text-xs text-coop-600 font-bold">
          <IndianRupee size={14} />
          {gig.earning} estimated earning
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Why recommended:</strong>{" "}
          {gig.reason}
        </p>
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 text-white text-xs font-bold"
      >
        View gig
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* =========================================================
   TRAVEL VS EARNING
========================================================= */

function TravelEarningSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <SectionHeader
        icon={Route}
        title="Travel vs earning intelligence"
        subtitle="AI helps compare travel distance with potential earning"
      />

      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <TravelCard
          location="Vaishali Nagar"
          distance="3.2 km"
          travel="10–15 min"
          earning="₹650–₹900"
          verdict="Worth considering"
          positive
        />

        <TravelCard
          location="Mansarovar"
          distance="5.1 km"
          travel="18–25 min"
          earning="₹550–₹800"
          verdict="Good opportunity"
          positive
        />

        <TravelCard
          location="Malviya Nagar"
          distance="7.4 km"
          travel="25–35 min"
          earning="₹450–₹650"
          verdict="Lower priority"
        />
      </div>

      <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={18}
            className="text-amber-600 shrink-0 mt-0.5"
          />

          <p className="text-xs text-amber-800 leading-relaxed">
            Travel estimates are illustrative. Actual travel time
            depends on traffic, route and current location.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TRAVEL CARD
========================================================= */

function TravelCard({
  location,
  distance,
  travel,
  earning,
  verdict,
  positive = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm text-navy-700">
          {location}
        </p>

        <MapPin size={17} className="text-coop-600" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniStat label="Distance" value={distance} />
        <MiniStat label="Travel" value={travel} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] text-slate-400">
          Estimated earning
        </p>

        <p className="font-extrabold text-coop-600 mt-1">
          {earning}
        </p>
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${
          positive ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {positive ? (
          <CheckCircle2 size={14} />
        ) : (
          <AlertCircle size={14} />
        )}

        {verdict}
      </div>
    </div>
  );
}

/* =========================================================
   SKILL CARD
========================================================= */

function SkillCard({
  skill,
  onAction,
  large = false,
}) {
  const Icon = skill.icon;

  return (
    <div
      className={`border border-slate-200 rounded-2xl p-4 hover:border-coop-300 transition ${
        large ? "min-h-[220px]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center">
          <Icon size={20} className="text-coop-600" />
        </div>

        <span className="text-xs font-extrabold text-emerald-600">
          {skill.demand}
        </span>
      </div>

      <h3 className="font-bold text-navy-700 mt-4">
        {skill.title}
      </h3>

      <p className="text-[10px] font-bold text-coop-600 mt-1">
        {skill.level} demand
      </p>

      <p className="text-xs text-slate-500 leading-relaxed mt-2">
        {skill.description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-coop-700"
      >
        {skill.action}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* =========================================================
   FORECAST CARD
========================================================= */

function ForecastCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center">
        <Icon size={20} className="text-coop-600" />
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {title}
      </p>

      <p className="text-xl font-extrabold text-navy-700 mt-1">
        {value}
      </p>

      <p className="text-[10px] text-slate-400 mt-1">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   PERFORMANCE SECTION
========================================================= */

function PerformanceSection({
  detailed = false,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <SectionHeader
        icon={Star}
        title="Performance intelligence"
        subtitle="How your performance affects future gig matching"
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        <PerformanceCard
          icon={Star}
          label="Rating"
          value={`${PERFORMANCE_DATA.rating} / 5`}
          trend="+0.2"
        />

        <PerformanceCard
          icon={CheckCircle2}
          label="Completion"
          value={`${PERFORMANCE_DATA.completion}%`}
          trend="+3%"
        />

        <PerformanceCard
          icon={Zap}
          label="Response rate"
          value={`${PERFORMANCE_DATA.response}%`}
          trend="+2%"
        />

        <PerformanceCard
          icon={Award}
          label="Repeat customers"
          value={`${PERFORMANCE_DATA.repeatCustomers}%`}
          trend="+5%"
        />

        <PerformanceCard
          icon={Briefcase}
          label="Completed jobs"
          value={PERFORMANCE_DATA.completedJobs}
          trend="+6"
        />
      </div>

      {detailed && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <Brain size={20} className="text-coop-600" />
              </div>

              <div>
                <p className="font-bold text-navy-700">
                  AI performance observation
                </p>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Your completion and response rates are strong.
                  Maintaining a high response rate can improve
                  your position in future gig matching.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-coop-50 border border-coop-100 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="text-coop-600 mt-0.5"
              />

              <div>
                <p className="font-bold text-navy-700">
                  What improves your opportunity score?
                </p>

                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-coop-600 shrink-0"
                    />
                    Respond quickly to new requests.
                  </li>

                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-coop-600 shrink-0"
                    />
                    Complete accepted jobs reliably.
                  </li>

                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-coop-600 shrink-0"
                    />
                    Maintain strong customer ratings.
                  </li>

                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-coop-600 shrink-0"
                    />
                    Keep your availability updated.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PERFORMANCE CARD
========================================================= */

function PerformanceCard({
  icon: Icon,
  label,
  value,
  trend,
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-coop-600" />

        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
          <ArrowUp size={10} />
          {trend}
        </span>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {label}
      </p>

      <p className="text-lg font-extrabold text-navy-700 mt-1">
        {value}
      </p>
    </div>
  );
}