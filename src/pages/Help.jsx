import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  Phone,
  MessageCircle,
  Ticket,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Wallet,
  ShieldCheck,
  UserRound,
  Smartphone,
  MapPin,
  FileText,
  Headphones,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPPORT_PHONE = "1800-XXX-XXXX";

const FAQS = [
  {
    id: 1,
    category: "Jobs",
    question: "How do I accept a new service request?",
    answer:
      "When a customer request is assigned to you, it appears in your job requests. Review the service, location, estimated earning and scheduled slot before accepting it.",
  },
  {
    id: 2,
    category: "Jobs",
    question: "What happens if I cannot reach the customer?",
    answer:
      "Use the On the Way and Reached options to update your job status. If you cannot complete the job, contact support as early as possible so the request can be reassigned when required.",
  },
  {
    id: 3,
    category: "Earnings",
    question: "Where can I see my earnings?",
    answer:
      "Your completed-job earnings and payout information are available in the Pocket section.",
  },
  {
    id: 4,
    category: "Earnings",
    question: "When will my earnings be available?",
    answer:
      "Earnings are recorded after the service is successfully completed and verified. The actual payout timing depends on the configured payout process.",
  },
  {
    id: 5,
    category: "Verification",
    question: "Why do I need worker verification?",
    answer:
      "Worker verification helps ShramSetu maintain a trusted service network. Your identity, professional information and required documents may be reviewed before you become eligible for jobs.",
  },
  {
    id: 6,
    category: "Verification",
    question: "What if my verification is rejected?",
    answer:
      "Check your Worker Profile for the verification status and any available reason. If you believe the decision is incorrect, create a support ticket with the relevant details.",
  },
  {
    id: 7,
    category: "Account",
    question: "How can I update my worker profile?",
    answer:
      "Open Worker Profile from your account menu. Update the required information and submit the changes for review where applicable.",
  },
  {
    id: 8,
    category: "App",
    question: "The application is not working properly. What should I do?",
    answer:
      "First check your internet connection and reload the application. If the problem continues, create a support ticket and include the page, issue and approximate time when the problem occurred.",
  },
];

const SUPPORT_CATEGORIES = [
  {
    id: "job",
    title: "Job & Gig Support",
    description: "Requests, assignments and service issues",
    icon: Briefcase,
  },
  {
    id: "payment",
    title: "Payment & Earnings",
    description: "Earnings, deductions and payouts",
    icon: Wallet,
  },
  {
    id: "verification",
    title: "KYC & Verification",
    description: "Profile and document verification",
    icon: ShieldCheck,
  },
  {
    id: "account",
    title: "Account & Profile",
    description: "Account, profile and login issues",
    icon: UserRound,
  },
  {
    id: "technical",
    title: "Technical Issue",
    description: "App errors and technical problems",
    icon: Smartphone,
  },
  {
    id: "location",
    title: "Location & Navigation",
    description: "Maps, location and arrival issues",
    icon: MapPin,
  },
];

const INITIAL_TICKETS = [
  {
    id: "SS-1001",
    category: "Payment & Earnings",
    subject: "Payout clarification",
    description:
      "Need clarification regarding my recent completed service payout.",
    status: "Open",
    createdAt: "Today",
  },
];

function formatCategory(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function WorkerSupport() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem("ss_worker_support_tickets");
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [ticketForm, setTicketForm] = useState({
    category: "",
    subject: "",
    description: "",
  });

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return FAQS.filter((faq) => {
      const categoryMatch =
        activeCategory === "All" || faq.category === activeCategory;

      const searchMatch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [search, activeCategory]);

  const saveTickets = (updatedTickets) => {
    setTickets(updatedTickets);

    try {
      localStorage.setItem(
        "ss_worker_support_tickets",
        JSON.stringify(updatedTickets)
      );
    } catch {
      // Prototype only
    }
  };

  const handleTicketSubmit = (event) => {
    event.preventDefault();

    if (
      !ticketForm.category ||
      !ticketForm.subject.trim() ||
      !ticketForm.description.trim()
    ) {
      return;
    }

    const newTicket = {
      id: `SS-${Math.floor(1000 + Math.random() * 9000)}`,
      category: formatCategory(ticketForm.category),
      subject: ticketForm.subject.trim(),
      description: ticketForm.description.trim(),
      status: "Open",
      createdAt: "Just now",
    };

    saveTickets([newTicket, ...tickets]);

    setTicketForm({
      category: "",
      subject: "",
      description: "",
    });

    setShowTicketModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-800 pb-16">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <Headphones
                    size={19}
                    className="text-indigo-600"
                  />

                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Help & Support
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  We're here to help you work better.
                </p>
              </div>

            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              <Plus size={17} />
              Create Ticket
            </button>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* =====================================================
            HERO SUPPORT CARD
        ===================================================== */}

        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 sm:p-8 mb-6 shadow-sm">

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold mb-4">
              <HelpCircle size={14} />
              Worker Support Centre
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              How can we help you?
            </h2>

            <p className="mt-2 text-sm sm:text-base text-indigo-100">
              Find answers, contact support or raise a ticket for your issue.
            </p>

            {/* Search */}

            <div className="relative mt-6">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your problem..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-white/20"
              />

            </div>

          </div>

        </section>

        {/* =====================================================
            QUICK SUPPORT
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <button
            onClick={() => setShowCallModal(true)}
            className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-md transition"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Phone size={21} />
            </div>

            <h3 className="font-bold text-slate-900">
              Call Support
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Talk to our support team
            </p>

            <div className="mt-4 text-sm font-semibold text-emerald-600">
              Contact customer care →
            </div>
          </button>

          <button
            onClick={() => setShowTicketModal(true)}
            className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-md transition"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Ticket size={21} />
            </div>

            <h3 className="font-bold text-slate-900">
              Raise a Ticket
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Report an issue or request help
            </p>

            <div className="mt-4 text-sm font-semibold text-indigo-600">
              Create support ticket →
            </div>
          </button>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-md transition"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle size={21} />
            </div>

            <h3 className="font-bold text-slate-900">
              Emergency Help
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Safety-related worker assistance
            </p>

            <div className="mt-4 text-sm font-semibold text-amber-600">
              Get emergency assistance →
            </div>
          </button>

        </section>

        {/* =====================================================
            SUPPORT CATEGORIES
        ===================================================== */}

        <section className="mb-8">

          <div className="flex items-end justify-between mb-4">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                What do you need help with?
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Select a category to find relevant answers.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

            {SUPPORT_CATEGORIES.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setTicketForm((prev) => ({
                      ...prev,
                      category: category.id,
                    }));

                    setSearch("");
                    setActiveCategory(
                      category.id === "payment"
                        ? "Earnings"
                        : category.id === "verification"
                        ? "Verification"
                        : category.id === "account"
                        ? "Account"
                        : category.id === "job"
                        ? "Jobs"
                        : "All"
                    );
                  }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon size={19} />
                    </div>

                    <ChevronDown
                      size={16}
                      className="text-slate-400"
                    />

                  </div>

                  <h3 className="mt-4 font-semibold text-sm text-slate-900">
                    {category.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {category.description}
                  </p>

                </button>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}

        <section className="mb-8">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Quick answers to common worker questions.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {["All", "Jobs", "Earnings", "Verification", "Account"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeCategory === category
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            {filteredFaqs.length === 0 ? (
              <div className="p-10 text-center">

                <HelpCircle
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <h3 className="font-semibold text-slate-800 mt-3">
                  No matching answers found
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Try another search or create a support ticket.
                </p>

                <button
                  onClick={() => setShowTicketModal(true)}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                >
                  Raise a Ticket
                </button>

              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >

                    <button
                      onClick={() =>
                        setOpenFaq(isOpen ? null : faq.id)
                      }
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    >

                      <div>

                        <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-indigo-600 mb-1">
                          {faq.category}
                        </span>

                        <h3 className="text-sm font-semibold text-slate-900">
                          {faq.question}
                        </h3>

                      </div>

                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className="text-slate-400 shrink-0"
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="text-slate-400 shrink-0"
                        />
                      )}

                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5">

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}

          </div>

        </section>

        {/* =====================================================
            SUPPORT TICKETS
        ===================================================== */}

        <section className="mb-8">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Support Tickets
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Track the issues you have reported.
              </p>
            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold"
            >
              <Plus size={15} />
              New Ticket
            </button>

          </div>

          <div className="space-y-3">

            {tickets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">

                <Ticket
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="font-semibold text-slate-700 mt-3">
                  No support tickets
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Your submitted support requests will appear here.
                </p>

              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Ticket size={18} />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-sm text-slate-900">
                            {ticket.subject}
                          </h3>

                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            {ticket.status}
                          </span>

                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          {ticket.category} • Ticket {ticket.id}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">

                      <Clock size={14} />

                      {ticket.createdAt}

                    </div>

                  </div>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    {ticket.description}
                  </p>

                </div>
              ))
            )}

          </div>

        </section>

        {/* =====================================================
            BOTTOM SUPPORT STRIP
        ===================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Still need help?
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Our support team can help with worker and service-related issues.
                </p>
              </div>

            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Contact Support
            </button>

          </div>

        </section>

      </main>

      {/* =====================================================
          MOBILE CREATE TICKET BUTTON
      ===================================================== */}

      <button
        onClick={() => setShowTicketModal(true)}
        className="sm:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center"
      >
        <Plus size={23} />
      </button>

      {/* =====================================================
          CREATE TICKET MODAL
      ===================================================== */}

      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">

          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">

            <div className="p-5 border-b border-slate-100 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Create Support Ticket
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Tell us what went wrong.
                </p>
              </div>

              <button
                onClick={() => setShowTicketModal(false)}
                className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"
              >
                <X size={17} />
              </button>

            </div>

            <form
              onSubmit={handleTicketSubmit}
              className="p-5 space-y-4"
            >

              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Issue Category
                </label>

                <select
                  value={ticketForm.category}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full mt-2 h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                >

                  <option value="">
                    Select category
                  </option>

                  {SUPPORT_CATEGORIES.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.title}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Subject
                </label>

                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Briefly describe your issue"
                  className="w-full mt-2 h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                />

              </div>

              <div>

                <label className="text-xs font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={ticketForm.description}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Explain the issue in detail..."
                  rows={5}
                  className="w-full mt-2 rounded-xl border border-slate-200 p-3 text-sm outline-none resize-none focus:border-indigo-500"
                />

              </div>

              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
                This prototype stores your ticket locally. In the deployed
                version, tickets can be connected to the ShramSetu support
                backend.
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
              >
                <Send size={17} />
                Submit Ticket
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          CALL SUPPORT MODAL
      ===================================================== */}

      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">

            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone size={27} />
            </div>

            <h2 className="font-bold text-xl text-slate-900 mt-5">
              Customer Care
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Connect with ShramSetu worker support for assistance.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">

              <p className="text-xs text-slate-500">
                Support Number
              </p>

              <p className="font-bold text-lg text-slate-900 mt-1">
                {SUPPORT_PHONE}
              </p>

            </div>

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                Call
              </button>

            </div>

            <p className="text-[10px] text-slate-400 mt-4">
              Prototype contact flow. Connect the actual support number during deployment.
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          EMERGENCY MODAL
      ===================================================== */}

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={25} />
            </div>

            <h2 className="font-bold text-xl text-slate-900 mt-5">
              Emergency Worker Support
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              For immediate danger or a serious safety situation, contact
              the appropriate local emergency service first. ShramSetu
              support can assist with platform-related incidents.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-100">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={18}
                  className="text-amber-600 mt-0.5"
                />

                <p className="text-xs text-amber-800 leading-relaxed">
                  Do not continue a service if you believe the location or
                  working conditions are unsafe.
                </p>

              </div>

            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold mt-5"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}