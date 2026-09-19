import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  IndianRupee,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  CalendarDays,
  ReceiptText,
  FileText,
  Banknote,
  Gift,
  ChevronRight,
  X,
  CheckCircle2,
  Calculator,
  TrendingUp,
} from "lucide-react";


/* =========================================================
   LOCAL STORAGE
========================================================= */

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);

      return saved
        ? JSON.parse(saved)
        : initialValue;
    } catch {
      return initialValue;
    }
  });

  const updateValue = (newValue) => {
    setValue((previous) => {
      const value =
        typeof newValue === "function"
          ? newValue(previous)
          : newValue;

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return value;
    });
  };

  return [value, updateValue];
}


/* =========================================================
   DATE HELPERS
========================================================= */

const getDateKey = (date = new Date()) => {
  return date.toISOString().split("T")[0];
};


const formatDate = (date) => {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatMoney = (amount) => {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN"
  )}`;
};


/* =========================================================
   SAMPLE DAILY JOB RECORDS
   Prototype data
========================================================= */

const INITIAL_DAILY_RECORDS = {
  [getDateKey()]: [
    {
      id: "JOB-1001",
      time: "08:00 AM - 10:00 AM",
      customer: "Amit Sharma",
      service: "Electrical Repair",
      amount: 400,
      tip: 50,
      status: "Completed",
    },

    {
      id: "JOB-1002",
      time: "10:00 AM - 12:00 PM",
      customer: "Neha Verma",
      service: "Fan Installation",
      amount: 350,
      tip: 0,
      status: "Completed",
    },

    {
      id: "JOB-1003",
      time: "02:00 PM - 04:00 PM",
      customer: "Rahul Singh",
      service: "Switchboard Repair",
      amount: 300,
      tip: 80,
      status: "Completed",
    },

    {
      id: "JOB-1004",
      time: "06:00 PM - 08:00 PM",
      customer: "Priya Mehta",
      service: "Wiring Repair",
      amount: 180,
      tip: 50,
      status: "Completed",
    },
  ],
};


/* =========================================================
   INITIAL PAYOUTS
========================================================= */

const INITIAL_PAYOUTS = [
  {
    id: "PAY-001",
    date: getDateKey(),
    gross: 1230,
    tips: 180,
    deductions: 123,
    net: 1107,
    status: "Processing",
  },

  {
    id: "PAY-002",
    date: getDateKey(
      new Date(Date.now() - 86400000)
    ),
    gross: 980,
    tips: 100,
    deductions: 98,
    net: 982,
    status: "Paid",
  },

  {
    id: "PAY-003",
    date: getDateKey(
      new Date(Date.now() - 172800000)
    ),
    gross: 1450,
    tips: 200,
    deductions: 145,
    net: 1305,
    status: "Paid",
  },
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Pocket() {
  const navigate = useNavigate();


  /* =======================================================
     STORAGE
  ======================================================= */

  const [dailyRecords] =
    useLocalStorage(
      "ss_worker_daily_records",
      INITIAL_DAILY_RECORDS
    );


  const [payouts] =
    useLocalStorage(
      "ss_worker_payouts",
      INITIAL_PAYOUTS
    );


  const [pocketBalance] =
    useLocalStorage(
      "ss_worker_pocket_balance",
      1230
    );


  const [customerTips] =
    useLocalStorage(
      "ss_worker_customer_tips",
      180
    );


  /* =======================================================
     PAGE STATES
  ======================================================= */

  const [selectedDate, setSelectedDate] =
    useState(getDateKey());


  const [activeModal, setActiveModal] =
    useState(null);


  /* =======================================================
     CURRENT DAILY RECORDS
  ======================================================= */

  const todayRecords =
    dailyRecords[selectedDate] || [];


  /* =======================================================
     DAILY CALCULATIONS
  ======================================================= */

  const dailyStats = useMemo(() => {

    const gross = todayRecords.reduce(
      (sum, job) =>
        sum + Number(job.amount || 0),
      0
    );


    const tips = todayRecords.reduce(
      (sum, job) =>
        sum + Number(job.tip || 0),
      0
    );


    const jobs = todayRecords.length;


    /*
      GST calculation is illustrative
      for prototype purposes.

      GST component:
      Gross × 18 / 118
    */

    const gst =
      gross > 0
        ? (gross * 18) / 118
        : 0;


    /*
      Illustrative ShramSetu
      platform fee.
    */

    const platformFee =
      gross * 0.1;


    const net =
      gross -
      gst -
      platformFee +
      tips;


    return {
      gross,
      tips,
      gst,
      platformFee,
      net,
      jobs,
    };

  }, [todayRecords]);


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setActiveModal(null);
  };


  /* =======================================================
     SELECTED PAYOUT
  ======================================================= */

  const selectedPayout =
    payouts.find(
      (payout) =>
        payout.date === selectedDate
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-navy-700 pb-24">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-coop-600">
                Worker Wallet
              </p>

              <h1 className="text-2xl font-extrabold text-navy-700">
                Pocket
              </h1>

            </div>


            <div className="w-11 h-11 rounded-xl bg-coop-50 flex items-center justify-center">

              <Wallet
                size={23}
                className="text-coop-600"
              />

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">


        {/* =================================================
            DATE SELECTOR
        ================================================= */}

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">

            <CalendarDays
              size={18}
              className="text-coop-600"
            />

            <span className="font-semibold">
              {formatDate(selectedDate)}
            </span>

          </div>


          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
          />

        </div>


        {/* =================================================
            DAILY EARNING HERO
        ================================================= */}

        <section className="rounded-2xl bg-navy-700 text-white p-5 mb-5 shadow-lg">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-white/70">
                Today's total earning
              </p>


              <h2 className="text-3xl font-extrabold mt-1">
                {formatMoney(
                  dailyStats.gross
                )}
              </h2>


              <p className="text-sm text-white/70 mt-2">
                {dailyStats.jobs} completed jobs
              </p>

            </div>


            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">

              <TrendingUp
                size={24}
                className="text-emerald-300"
              />

            </div>

          </div>


          <div className="grid grid-cols-2 gap-3 mt-5">

            <div className="rounded-xl bg-white/10 p-3">

              <p className="text-xs text-white/60">
                Customer tips
              </p>


              <p className="font-bold text-lg mt-1">
                {formatMoney(
                  dailyStats.tips
                )}
              </p>

            </div>


            <div className="rounded-xl bg-white/10 p-3">

              <p className="text-xs text-white/60">
                Estimated net
              </p>


              <p className="font-bold text-lg mt-1">
                {formatMoney(
                  dailyStats.net
                )}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            POCKET BALANCE
        ================================================= */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Pocket balance
              </p>


              <p className="text-3xl font-extrabold text-navy-700 mt-1">
                {formatMoney(
                  pocketBalance
                )}
              </p>

            </div>


            <div className="w-12 h-12 rounded-xl bg-coop-50 flex items-center justify-center">

              <IndianRupee
                size={25}
                className="text-coop-600"
              />

            </div>

          </div>


          <div className="border-t border-dashed border-slate-200 my-5" />


          {/* CASH LIMIT */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Available cash limit
              </p>


              <p className="text-xl font-bold mt-1">
                ₹500
              </p>

            </div>


            <p className="text-xs text-slate-400">
              Worker cash limit
            </p>

          </div>


          {/* BUTTONS */}

          <div className="grid grid-cols-2 gap-3 mt-5">


            {/* DEPOSIT */}

            <button
              type="button"
              onClick={() =>
                setActiveModal("deposit")
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-navy-700 text-navy-700 font-bold hover:bg-navy-50 transition"
            >

              <ArrowDownToLine
                size={18}
              />

              Deposit

            </button>


            {/* WITHDRAW */}

            <button
              type="button"
              onClick={() =>
                navigate("/worker-bank")
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-800 transition"
            >

              <ArrowUpFromLine
                size={18}
              />

              Withdraw

            </button>

          </div>

        </section>


        {/* =================================================
            CUSTOMER TIPS
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setActiveModal("tips")
          }
          className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7 flex items-center justify-between hover:border-coop-300 transition"
        >

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">

              <Gift
                size={22}
                className="text-amber-600"
              />

            </div>


            <div className="text-left">

              <p className="font-bold text-navy-700">
                Customer tips balance
              </p>


              <p className="text-xs text-slate-400 mt-1">
                Tips received from customers
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <span className="font-extrabold text-lg">
              {formatMoney(
                customerTips
              )}
            </span>


            <ChevronRight
              size={19}
              className="text-slate-400"
            />

          </div>

        </button>


        {/* =================================================
            DAILY EARNING RECORD
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-center justify-between mb-4">

            <div>

              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Earnings
              </p>


              <h2 className="text-xl font-extrabold">
                Daily earning record
              </h2>

            </div>


            <span className="px-3 py-1 rounded-full bg-coop-50 text-coop-700 text-xs font-bold">
              {dailyStats.jobs} Jobs
            </span>

          </div>


          <div className="space-y-3">

            {todayRecords.length === 0 ? (

              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">

                <Wallet
                  size={30}
                  className="mx-auto text-slate-300"
                />


                <p className="font-semibold mt-3">
                  No earning records
                </p>


                <p className="text-sm text-slate-400 mt-1">
                  Completed gigs will appear here.
                </p>

              </div>

            ) : (

              todayRecords.map(
                (job) => (

                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex gap-3">

                        <div className="w-10 h-10 rounded-xl bg-coop-50 flex items-center justify-center">

                          <Clock3
                            size={19}
                            className="text-coop-600"
                          />

                        </div>


                        <div>

                          <p className="font-bold">
                            {job.service}
                          </p>


                          <p className="text-sm text-slate-500">
                            {job.customer}
                          </p>


                          <p className="text-xs text-slate-400 mt-1">
                            {job.time}
                          </p>

                        </div>

                      </div>


                      <div className="text-right">

                        <p className="font-extrabold text-coop-600">
                          {formatMoney(
                            job.amount
                          )}
                        </p>


                        {job.tip > 0 && (

                          <p className="text-xs text-amber-600 font-semibold mt-1">
                            + {formatMoney(job.tip)} tip
                          </p>

                        )}

                      </div>

                    </div>


                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">

                      <span className="text-xs text-slate-400">
                        {job.id}
                      </span>


                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">

                        <CheckCircle2
                          size={13}
                        />

                        {job.status}

                      </span>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            MORE SERVICES
        ================================================= */}

        <section>

          <div className="flex items-center gap-3 mb-4">

            <div className="h-px flex-1 bg-slate-200" />


            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              More Services
            </span>


            <div className="h-px flex-1 bg-slate-200" />

          </div>


          <div className="grid grid-cols-2 gap-3">


            {/* PAYOUT */}

            <button
              type="button"
              onClick={() =>
                setActiveModal("payout")
              }
              className="bg-white border border-slate-200 rounded-2xl p-4 text-left min-h-[150px] hover:border-coop-300 transition"
            >

              <Banknote
                size={25}
                className="text-coop-600"
              />


              <p className="text-xs text-slate-400 mt-6">
                Daily payout
              </p>


              <p className="text-xl font-extrabold mt-1">
                {formatMoney(
                  selectedPayout?.net ||
                    dailyStats.net
                )}
              </p>


              <p className="text-xs text-slate-400 mt-1">
                {formatDate(
                  selectedDate
                )}
              </p>

            </button>


            {/* POCKET STATEMENT */}

            <button
              type="button"
              onClick={() =>
                setActiveModal(
                  "pocket-statement"
                )
              }
              className="bg-white border border-slate-200 rounded-2xl p-4 text-left min-h-[150px] hover:border-coop-300 transition"
            >

              <ReceiptText
                size={25}
                className="text-navy-600"
              />


              <p className="font-bold text-lg mt-10">
                Pocket statement
              </p>


              <p className="text-xs text-slate-400 mt-1">
                Daily order report
              </p>

            </button>


            {/* DEDUCTION */}

            <button
              type="button"
              onClick={() =>
                setActiveModal(
                  "deduction"
                )
              }
              className="bg-white border border-slate-200 rounded-2xl p-4 text-left min-h-[150px] hover:border-coop-300 transition"
            >

              <Calculator
                size={25}
                className="text-red-500"
              />


              <p className="font-bold text-lg mt-10">
                Deduction statement
              </p>


              <p className="text-xs text-slate-400 mt-1">
                GST & calculations
              </p>

            </button>


            {/* CUSTOMER TIPS */}

            <button
              type="button"
              onClick={() =>
                setActiveModal(
                  "tips-statement"
                )
              }
              className="bg-white border border-slate-200 rounded-2xl p-4 text-left min-h-[150px] hover:border-coop-300 transition"
            >

              <Gift
                size={25}
                className="text-amber-500"
              />


              <p className="font-bold text-lg mt-10">
                Customer tips
              </p>


              <p className="text-xs text-slate-400 mt-1">
                Tips statement
              </p>

            </button>

          </div>

        </section>

      </main>


      {/* ===================================================
          DEPOSIT MODAL — UI ONLY
      =================================================== */}

      {activeModal === "deposit" && (

        <Modal
          title="Deposit Money"
          onClose={closeModal}
        >

          <div className="text-center py-4">


            {/* ICON */}

            <div className="w-16 h-16 rounded-full bg-coop-50 mx-auto flex items-center justify-center">

              <ArrowDownToLine
                size={30}
                className="text-coop-600"
              />

            </div>


            {/* TITLE */}

            <h3 className="text-xl font-extrabold mt-4">
              Deposit to Pocket
            </h3>


            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Add money to your ShramSetu Pocket.
              The actual payment process will be
              securely handled by the ShramSetu
              payment system.
            </p>


            {/* AMOUNT UI */}

            <div className="relative mt-5">

              <IndianRupee
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />


              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-coop-500"
              />

            </div>


            {/* PAYMENT UI PLACEHOLDER */}

            <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center">

                <IndianRupee
                  size={34}
                  className="text-slate-300"
                />

              </div>


              <p className="font-bold text-slate-600 mt-4">
                Secure Payment
              </p>


              <p className="text-xs text-slate-400 mt-1">
                Payment gateway will appear here
              </p>

            </div>


            {/* BACKEND INTEGRATION NOTE */}

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">

              <p className="text-xs text-blue-800 leading-relaxed">

                <strong>Prototype UI:</strong>{" "}
                Payment processing, UPI, QR
                generation, transaction verification
                and Pocket balance updates will be
                implemented by the backend/payment
                system.

              </p>

            </div>


            {/* CLOSE / CONTINUE */}

            <button
              type="button"
              onClick={closeModal}
              className="w-full mt-5 py-3 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-800 transition"
            >
              Continue
            </button>

          </div>

        </Modal>

      )}


      {/* ===================================================
          PAYOUT MODAL
      =================================================== */}

      {activeModal === "payout" && (

        <Modal
          title="Daily Payout"
          onClose={closeModal}
        >

          <div className="bg-coop-50 rounded-xl p-4 mb-4">

            <p className="text-xs text-coop-700">
              Payout date
            </p>


            <p className="font-bold mt-1">
              {formatDate(
                selectedDate
              )}
            </p>

          </div>


          <SummaryRow
            label="Gross earnings"
            value={formatMoney(
              dailyStats.gross
            )}
          />


          <SummaryRow
            label="Customer tips"
            value={formatMoney(
              dailyStats.tips
            )}
          />


          <SummaryRow
            label="GST component"
            value={`-${formatMoney(
              dailyStats.gst
            )}`}
          />


          <SummaryRow
            label="Platform fee"
            value={`-${formatMoney(
              dailyStats.platformFee
            )}`}
          />


          <div className="border-t border-slate-200 mt-3 pt-4">

            <SummaryRow
              label="Estimated payout"
              value={formatMoney(
                dailyStats.net
              )}
              strong
            />

          </div>


          <button
            type="button"
            onClick={closeModal}
            className="w-full mt-5 py-3 rounded-xl bg-navy-700 text-white font-bold"
          >
            Close
          </button>

        </Modal>

      )}


      {/* ===================================================
          POCKET STATEMENT
      =================================================== */}

      {activeModal === "pocket-statement" && (

        <Modal
          title="Pocket Statement"
          onClose={closeModal}
        >

          <p className="text-sm text-slate-500 mb-4">
            Complete order-wise earning report for{" "}
            {formatDate(selectedDate)}.
          </p>


          <div className="space-y-3">

            {todayRecords.map(
              (job) => (

                <div
                  key={job.id}
                  className="border border-slate-200 rounded-xl p-3"
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="font-bold text-sm">
                        {job.service}
                      </p>


                      <p className="text-xs text-slate-400">
                        {job.customer}
                      </p>

                    </div>


                    <p className="font-bold text-coop-600">
                      {formatMoney(
                        job.amount
                      )}
                    </p>

                  </div>


                  <div className="flex justify-between mt-2 text-xs text-slate-400">

                    <span>
                      {job.time}
                    </span>


                    <span>
                      {job.id}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>


          <div className="mt-5 pt-4 border-t border-slate-200">

            <SummaryRow
              label="Total orders"
              value={dailyStats.jobs}
            />


            <SummaryRow
              label="Total earning"
              value={formatMoney(
                dailyStats.gross
              )}
              strong
            />

          </div>

        </Modal>

      )}


      {/* ===================================================
          DEDUCTION STATEMENT
      =================================================== */}

      {activeModal === "deduction" && (

        <Modal
          title="Deduction Statement"
          onClose={closeModal}
        >

          <div className="bg-slate-50 rounded-xl p-4 mb-4">

            <p className="text-xs text-slate-400">
              Calculation date
            </p>


            <p className="font-bold mt-1">
              {formatDate(selectedDate)}
            </p>

          </div>


          <SummaryRow
            label="Gross order value"
            value={formatMoney(
              dailyStats.gross
            )}
          />


          <SummaryRow
            label="GST component (18/118)"
            value={`-${formatMoney(
              dailyStats.gst
            )}`}
          />


          <SummaryRow
            label="Platform fee (10%)"
            value={`-${formatMoney(
              dailyStats.platformFee
            )}`}
          />


          <SummaryRow
            label="Customer tips"
            value={`+${formatMoney(
              dailyStats.tips
            )}`}
          />


          <div className="border-t border-slate-200 mt-3 pt-4">

            <SummaryRow
              label="Estimated net amount"
              value={formatMoney(
                dailyStats.net
              )}
              strong
            />

          </div>


          <div className="mt-5 bg-amber-50 rounded-xl p-4">

            <p className="text-xs text-amber-800 leading-relaxed">

              <strong>Prototype calculation:</strong>{" "}
              GST and platform fee shown here are
              illustrative. Actual deductions should
              be configured according to ShramSetu's
              final tax, commission and worker
              settlement rules.

            </p>

          </div>

        </Modal>

      )}


      {/* ===================================================
          CUSTOMER TIPS BALANCE
      =================================================== */}

      {activeModal === "tips" && (

        <Modal
          title="Customer Tips Balance"
          onClose={closeModal}
        >

          <div className="text-center py-5">

            <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center">

              <Gift
                size={32}
                className="text-amber-500"
              />

            </div>


            <p className="text-sm text-slate-500 mt-4">
              Available customer tips
            </p>


            <p className="text-3xl font-extrabold mt-1">
              {formatMoney(
                customerTips
              )}
            </p>


            <p className="text-xs text-slate-400 mt-2">
              Tips are tracked separately from
              service earnings.
            </p>

          </div>

        </Modal>

      )}


      {/* ===================================================
          CUSTOMER TIPS STATEMENT
      =================================================== */}

      {activeModal === "tips-statement" && (

        <Modal
          title="Customer Tips Statement"
          onClose={closeModal}
        >

          <SummaryRow
            label="Today's tips"
            value={formatMoney(
              dailyStats.tips
            )}
          />


          <SummaryRow
            label="Previous tips balance"
            value={formatMoney(
              Math.max(
                customerTips -
                  dailyStats.tips,
                0
              )
            )}
          />


          <SummaryRow
            label="Current tips balance"
            value={formatMoney(
              customerTips
            )}
            strong
          />


          <div className="mt-5 space-y-3">

            {todayRecords
              .filter(
                (job) => job.tip > 0
              )
              .map((job) => (

                <div
                  key={job.id}
                  className="flex items-center justify-between border border-slate-200 rounded-xl p-3"
                >

                  <div>

                    <p className="font-semibold text-sm">
                      {job.customer}
                    </p>


                    <p className="text-xs text-slate-400">
                      {job.service}
                    </p>

                  </div>


                  <p className="font-bold text-amber-600">
                    +{formatMoney(
                      job.tip
                    )}
                  </p>

                </div>

              ))}

          </div>

        </Modal>

      )}


      {/* ===================================================
          MOBILE BOTTOM NAV
      =================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900 text-white border-t border-white/10">

        <div className="max-w-lg mx-auto grid grid-cols-3">


          {/* FEED */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="py-3 flex flex-col items-center gap-1 text-xs text-white/60"
          >

            <FileText size={20} />

            Feed

          </button>


          {/* POCKET */}

          <button
            type="button"
            className="py-3 flex flex-col items-center gap-1 text-xs text-white"
          >

            <Wallet size={20} />

            <span className="font-bold">
              Pocket
            </span>

          </button>


          {/* GIGS */}

          <button
            type="button"
            onClick={() =>
              navigate("/worker-gigs")
            }
            className="py-3 flex flex-col items-center gap-1 text-xs text-white/60"
          >

            <BriefcaseIcon />

            Gigs

          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  children,
  onClose,
}) {

  return (

    <div className="fixed inset-0 z-[100] bg-navy-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center">

      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">


        {/* MODAL HEADER */}

        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">

          <h2 className="font-extrabold text-lg">
            {title}
          </h2>


          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >

            <X size={20} />

          </button>

        </div>


        {/* MODAL BODY */}

        <div className="p-5">
          {children}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  strong = false,
}) {

  return (

    <div className="flex items-center justify-between py-2">

      <span
        className={
          strong
            ? "font-bold text-navy-700"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>


      <span
        className={
          strong
            ? "font-extrabold text-lg text-navy-700"
            : "font-semibold text-navy-700"
        }
      >
        {value}
      </span>

    </div>
  );
}


/* =========================================================
   BRIEFCASE ICON
========================================================= */

function BriefcaseIcon() {

  return (

    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
      />


      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />


      <path d="M3 12h18" />


      <path d="M10 12v2h4v-2" />

    </svg>
  );
}