import React, { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Briefcase,
  MapPin,
  CreditCard,
  FileCheck,
  CheckCircle2,
  Clock3,
  Upload,
  LockKeyhole,
  ChevronRight,
  AlertCircle,
  LocateFixed,
  Loader2,
  Send,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| WORKER PROFILE
|--------------------------------------------------------------------------
|
| Flow:
|
| SIGNUP
|   ↓
| WORKER PROFILE / REGISTRATION
|   ↓
| SUBMIT KYC
|   ↓
| ADMIN REVIEW
|   ↓
| PENDING / VERIFIED / REJECTED
|   ↓
| VERIFIED
|   ↓
| GO LIVE + FACE VERIFICATION
|
| This page handles ONLY:
| - Worker registration
| - Profile information
| - KYC information
| - Documents
| - Service location
| - KYC submission status
|
| Go Live / Face Verification should remain in Navbar / Worker Home.
|
|--------------------------------------------------------------------------
*/

export default function WorkerProfile() {
  const [activeSection, setActiveSection] = useState("personal");

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------------
   * LOAD WORKER PROFILE
   * ---------------------------------------------------------------
   */

  const [formData, setFormData] = useState(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("ss_worker_profile") || "null",
      );

      return {
        id: savedProfile?.id || "",

        fullName: savedProfile?.fullName || "Demo Worker",
        phone: savedProfile?.phone || "",
        email:
          savedProfile?.email ||
          "worker@shramsetu.in",

        dob: savedProfile?.dob || "",
        gender: savedProfile?.gender || "",

        address: savedProfile?.address || "",
        city: savedProfile?.city || "",
        pincode: savedProfile?.pincode || "",

        /*
         * Identity
         */
        aadhaar: savedProfile?.aadhaar || "",
        aadhaarFile:
          savedProfile?.aadhaarFile || null,

        /*
         * Professional
         */
        skill: savedProfile?.skill || "",
        experience:
          savedProfile?.experience || "",
        services:
          savedProfile?.services || "",
        serviceArea:
          savedProfile?.serviceArea || "",

        /*
         * Payment
         */
        accountHolder:
          savedProfile?.accountHolder || "",
        accountNumber:
          savedProfile?.accountNumber || "",
        ifsc: savedProfile?.ifsc || "",

        /*
         * Documents
         */
        skillCertificate:
          savedProfile?.skillCertificate || null,

        addressProof:
          savedProfile?.addressProof || null,

        profilePhoto:
          savedProfile?.profilePhoto || null,

        /*
         * Verification
         */
        verificationStatus:
          savedProfile?.verificationStatus ||
          "pending",

        kycRequestStatus:
          savedProfile?.kycRequestStatus ||
          "not_submitted",

        rejectionReason:
          savedProfile?.rejectionReason || "",

        submittedAt:
          savedProfile?.submittedAt || null,

        lastSubmittedAt:
          savedProfile?.lastSubmittedAt || null,

        reviewedAt:
          savedProfile?.reviewedAt || null,

        /*
         * Worker location
         */
        latitude:
          savedProfile?.latitude || "",

        longitude:
          savedProfile?.longitude || "",
      };
    } catch {
      return {
        id: "",

        fullName: "Demo Worker",
        phone: "",
        email: "worker@shramsetu.in",

        dob: "",
        gender: "",

        address: "",
        city: "",
        pincode: "",

        aadhaar: "",
        aadhaarFile: null,

        skill: "",
        experience: "",
        services: "",
        serviceArea: "",

        accountHolder: "",
        accountNumber: "",
        ifsc: "",

        skillCertificate: null,
        addressProof: null,
        profilePhoto: null,

        verificationStatus: "pending",

        kycRequestStatus:
          "not_submitted",

        rejectionReason: "",

        submittedAt: null,
        lastSubmittedAt: null,
        reviewedAt: null,

        latitude: "",
        longitude: "",
      };
    }
  });

  /*
   * ---------------------------------------------------------------
   * SYNC STATUS FROM ADMIN WORKER LIST
   * ---------------------------------------------------------------
   *
   * Admin dashboard is considered the source of truth for
   * verification status.
   *
   * The Admin dashboard should update:
   *
   * ss_registered_workers
   *
   * This function reads that list and synchronizes the current
   * worker's status.
   */

  useEffect(() => {
    syncWorkerWithAdminRecord();
  }, []);

  function syncWorkerWithAdminRecord() {
    try {
      const currentProfile = JSON.parse(
        localStorage.getItem(
          "ss_worker_profile",
        ) || "null",
      );

      const registeredWorkers = JSON.parse(
        localStorage.getItem(
          "ss_registered_workers",
        ) || "[]",
      );

      if (
        !currentProfile ||
        !Array.isArray(registeredWorkers)
      ) {
        return;
      }

      const matchingWorker =
        registeredWorkers.find(
          (worker) => {
            if (
              currentProfile.id &&
              worker.id === currentProfile.id
            ) {
              return true;
            }

            if (
              currentProfile.email &&
              worker.email
            ) {
              return (
                worker.email.toLowerCase() ===
                currentProfile.email.toLowerCase()
              );
            }

            return false;
          },
        );

      if (!matchingWorker) {
        return;
      }

      /*
       * Only synchronize admin-controlled fields.
       */
      setFormData((prev) => ({
        ...prev,

        id:
          matchingWorker.id ||
          prev.id,

        verificationStatus:
          matchingWorker.verificationStatus ||
          prev.verificationStatus ||
          "pending",

        kycRequestStatus:
          matchingWorker.kycRequestStatus ||
          prev.kycRequestStatus ||
          "not_submitted",

        rejectionReason:
          matchingWorker.rejectionReason ||
          "",

        submittedAt:
          matchingWorker.submittedAt ||
          prev.submittedAt ||
          null,

        lastSubmittedAt:
          matchingWorker.lastSubmittedAt ||
          prev.lastSubmittedAt ||
          null,

        reviewedAt:
          matchingWorker.reviewedAt ||
          prev.reviewedAt ||
          null,
      }));
    } catch (err) {
      console.error(
        "Unable to synchronize worker verification status:",
        err,
      );
    }
  }

  /*
   * ---------------------------------------------------------------
   * LOCATION
   * ---------------------------------------------------------------
   */

  useEffect(() => {
    if (
      !formData.latitude ||
      !formData.longitude
    ) {
      detectWorkerLocation();
    }
  }, []);

  async function detectWorkerLocation() {
    try {
      setLocationLoading(true);
      setLocationMessage("");
      setError("");

      const coordinates =
        await getCurrentPosition();

      setFormData((prev) => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }));

      setLocationMessage(
        "Location captured successfully.",
      );

      setSaved(false);
    } catch (err) {
      console.error(
        "Worker location error:",
        err,
      );

      setLocationMessage(
        "Unable to access location. Please allow browser location permission.",
      );
    } finally {
      setLocationLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------------
   * UPDATE NORMAL FIELD
   * ---------------------------------------------------------------
   */

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  /*
   * ---------------------------------------------------------------
   * FILE CHANGE
   * ---------------------------------------------------------------
   */

  const handleFileChange = (
    field,
    file,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setSaved(false);
    setError("");
  };

  /*
   * ---------------------------------------------------------------
   * REQUIRED FIELDS
   * ---------------------------------------------------------------
   */

  const requiredFields = {
    personal: [
      ["fullName", "Full Name"],
      ["phone", "Mobile Number"],
      ["dob", "Date of Birth"],
      ["gender", "Gender"],
      ["address", "Address"],
      ["city", "City"],
      ["pincode", "PIN Code"],
    ],

    identity: [
      ["aadhaar", "Aadhaar Number"],
      ["aadhaarFile", "Aadhaar Document"],
    ],

    professional: [
      ["skill", "Primary Skill"],
      ["experience", "Experience"],
      ["services", "Services You Offer"],
      ["serviceArea", "Service Area"],
    ],

    payment: [
      [
        "accountHolder",
        "Account Holder Name",
      ],
      [
        "accountNumber",
        "Bank Account Number",
      ],
      ["ifsc", "IFSC Code"],
    ],

    documents: [
      ["addressProof", "Address Proof"],
    ],
  };

  /*
   * ---------------------------------------------------------------
   * FIELD COMPLETION
   * ---------------------------------------------------------------
   */

  const isFieldCompleted = (
    field,
  ) => {
    const value = formData[field];

    if (value instanceof File) {
      return true;
    }

    return Boolean(
      value &&
        String(value).trim(),
    );
  };

  /*
   * ---------------------------------------------------------------
   * VALIDATE FORM
   * ---------------------------------------------------------------
   */

  const validateForm = () => {
    for (const section of Object.keys(
      requiredFields,
    )) {
      for (const [
        field,
        label,
      ] of requiredFields[section]) {
        if (
          !isFieldCompleted(field)
        ) {
          setActiveSection(section);
          setError(
            `Please complete the required field: ${label}`,
          );

          return false;
        }
      }
    }

    /*
     * Aadhaar
     */

    if (
      formData.aadhaar.length !== 12
    ) {
      setActiveSection("identity");

      setError(
        "Aadhaar Number must contain exactly 12 digits.",
      );

      return false;
    }

    /*
     * PIN
     */

    if (
      formData.pincode.length !== 6
    ) {
      setActiveSection("personal");

      setError(
        "PIN Code must contain exactly 6 digits.",
      );

      return false;
    }

    /*
     * Phone
     */

    if (
      formData.phone.length < 10
    ) {
      setActiveSection("personal");

      setError(
        "Please enter a valid mobile number.",
      );

      return false;
    }

    /*
     * Location
     */

    if (
      !formData.latitude ||
      !formData.longitude
    ) {
      setActiveSection("personal");

      setError(
        "Please allow location access so customers can find you through Nearby Services.",
      );

      return false;
    }

    return true;
  };

  /*
   * ---------------------------------------------------------------
   * SUBMIT KYC
   * ---------------------------------------------------------------
   *
   * Important:
   *
   * Worker ID remains stable.
   *
   * First submission:
   * W-12345
   *
   * Rejection:
   * W-12345
   *
   * Resubmission:
   * W-12345
   *
   * We DO NOT create a new worker every time.
   */

  const handleSubmit = (e) => {
    e.preventDefault();

    setSaved(false);
    setError("");

    /*
     * If current worker is already verified,
     * don't accidentally reset verification merely
     * by pressing submit again without needing review.
     */

    if (
      formData.verificationStatus ===
        "verified" &&
      !saved
    ) {
      /*
       * We still allow profile updates, but explain
       * that another verification request may be required.
       */
    }

    if (!validateForm()) {
      return;
    }

    /*
     * -----------------------------------------------------------
     * GET EXISTING WORKER RECORD
     * -----------------------------------------------------------
     */

    let existingWorkers = [];

    try {
      const parsedWorkers =
        JSON.parse(
          localStorage.getItem(
            "ss_registered_workers",
          ) || "[]",
        );

      if (
        Array.isArray(parsedWorkers)
      ) {
        existingWorkers =
          parsedWorkers;
      }
    } catch {
      existingWorkers = [];
    }

    /*
     * Try to find existing worker.
     */

    const existingWorker =
      existingWorkers.find(
        (worker) => {
          if (
            formData.id &&
            worker.id === formData.id
          ) {
            return true;
          }

          if (
            formData.email &&
            worker.email
          ) {
            return (
              worker.email.toLowerCase() ===
              formData.email.toLowerCase()
            );
          }

          return false;
        },
      );

    /*
     * Stable Worker ID
     */

    const workerId =
      existingWorker?.id ||
      formData.id ||
      `W-${Date.now()}`;

    const submissionTime =
      new Date().toISOString();

    /*
     * -----------------------------------------------------------
     * CREATE PROFILE RECORD
     * -----------------------------------------------------------
     */

    const profileToSave = {
      /*
       * Stable identity
       */
      id: workerId,

      /*
       * Profile information
       */
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,

      dob: formData.dob,
      gender: formData.gender,

      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,

      /*
       * Identity
       */
      aadhaar: formData.aadhaar,

      /*
       * Store filenames only in localStorage.
       */
      aadhaarFile:
        formData.aadhaarFile instanceof File
          ? formData.aadhaarFile.name
          : formData.aadhaarFile || null,

      /*
       * Professional
       */
      skill: formData.skill,
      experience: formData.experience,
      services: formData.services,
      serviceArea: formData.serviceArea,

      /*
       * Payment
       */
      accountHolder:
        formData.accountHolder,

      accountNumber:
        formData.accountNumber,

      ifsc: formData.ifsc,

      /*
       * Documents
       */
      skillCertificate:
        formData.skillCertificate instanceof
        File
          ? formData.skillCertificate.name
          : formData.skillCertificate ||
            null,

      addressProof:
        formData.addressProof instanceof
        File
          ? formData.addressProof.name
          : formData.addressProof ||
            null,

      profilePhoto:
        formData.profilePhoto instanceof
        File
          ? formData.profilePhoto.name
          : formData.profilePhoto ||
            null,

      /*
       * -------------------------------------------------------
       * VERIFICATION
       * -------------------------------------------------------
       *
       * A new submission or resubmission becomes pending.
       */

      verificationStatus: "pending",

      kycRequestStatus:
        "submitted",

      rejectionReason: "",

      /*
       * Preserve original submission date.
       */

      submittedAt:
        existingWorker?.submittedAt ||
        formData.submittedAt ||
        submissionTime,

      /*
       * Always update this when submitted.
       */

      lastSubmittedAt:
        submissionTime,

      /*
       * Admin will update this later.
       */

      reviewedAt:
        null,

      /*
       * Location
       */

      latitude:
        formData.latitude,

      longitude:
        formData.longitude,
    };

    /*
     * -----------------------------------------------------------
     * SAVE INDIVIDUAL PROFILE
     * -----------------------------------------------------------
     */

    localStorage.setItem(
      "ss_worker_profile",
      JSON.stringify(
        profileToSave,
      ),
    );

    /*
     * -----------------------------------------------------------
     * UPDATE CENTRAL REGISTERED WORKERS
     * -----------------------------------------------------------
     *
     * Admin Dashboard should use this list.
     */

    const workerRecord = {
      ...profileToSave,
    };

    const workerAlreadyExists =
      existingWorkers.some(
        (worker) => {
          if (
            worker.id &&
            worker.id === workerId
          ) {
            return true;
          }

          return (
            worker.email?.toLowerCase() ===
            workerRecord.email?.toLowerCase()
          );
        },
      );

    let updatedWorkers;

    if (
      workerAlreadyExists
    ) {
      updatedWorkers =
        existingWorkers.map(
          (worker) => {
            const sameId =
              worker.id === workerId;

            const sameEmail =
              worker.email?.toLowerCase() ===
              workerRecord.email?.toLowerCase();

            if (
              sameId ||
              sameEmail
            ) {
              return {
                ...worker,
                ...workerRecord,
              };
            }

            return worker;
          },
        );
    } else {
      updatedWorkers = [
        ...existingWorkers,
        workerRecord,
      ];
    }

    localStorage.setItem(
      "ss_registered_workers",
      JSON.stringify(
        updatedWorkers,
      ),
    );

    /*
     * -----------------------------------------------------------
     * UPDATE LOCAL STATE
     * -----------------------------------------------------------
     */

    setFormData((prev) => ({
      ...prev,

      id: workerId,

      verificationStatus:
        "pending",

      kycRequestStatus:
        "submitted",

      rejectionReason: "",

      submittedAt:
        profileToSave.submittedAt,

      lastSubmittedAt:
        profileToSave.lastSubmittedAt,

      reviewedAt: null,
    }));

    setSaved(true);

    setLocationMessage(
      "Profile and service location saved successfully.",
    );
  };

  /*
   * ---------------------------------------------------------------
   * SECTION COMPLETION
   * ---------------------------------------------------------------
   */

  const completedSections = {
    personal:
      requiredFields.personal.every(
        ([field]) =>
          isFieldCompleted(field),
      ),

    identity:
      formData.aadhaar.length ===
        12 &&
      isFieldCompleted(
        "aadhaarFile",
      ),

    professional:
      requiredFields.professional.every(
        ([field]) =>
          isFieldCompleted(field),
      ),

    payment:
      requiredFields.payment.every(
        ([field]) =>
          isFieldCompleted(field),
      ),

    documents:
      requiredFields.documents.every(
        ([field]) =>
          isFieldCompleted(field),
      ),
  };

  const completedCount =
    Object.values(
      completedSections,
    ).filter(Boolean).length;

  const progress = Math.round(
    (completedCount / 5) * 100,
  );

  /*
   * ---------------------------------------------------------------
   * VERIFICATION STATUS
   * ---------------------------------------------------------------
   */

  const verificationStatus =
    formData.verificationStatus ||
    "pending";

  const statusConfig = {
    pending: {
      label:
        "Verification Pending",

      description:
        "Your KYC request has been submitted and is waiting for ShramSetu Admin verification.",

      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-800",
      icon: "text-amber-600",
    },

    verified: {
      label:
        "Verified Worker",

      description:
        "Your profile has been verified. You are now eligible to go online and receive customer service requests.",

      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-800",
      icon: "text-green-600",
    },

    rejected: {
      label:
        "Verification Requires Action",

      description:
        "Your KYC request was not approved. Review the reason below, update the required information and resubmit.",

      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-800",
      icon: "text-red-600",
    },
  };

  const currentStatus =
    statusConfig[
      verificationStatus
    ] ||
    statusConfig.pending;

  /*
   * ---------------------------------------------------------------
   * NAVIGATION SECTIONS
   * ---------------------------------------------------------------
   */

  const sections = [
    {
      id: "personal",
      label:
        "Personal Information",
      icon: User,
    },

    {
      id: "identity",
      label:
        "Identity Verification",
      icon: ShieldCheck,
    },

    {
      id: "professional",
      label:
        "Professional Details",
      icon: Briefcase,
    },

    {
      id: "payment",
      label:
        "Payment Details",
      icon: CreditCard,
    },

    {
      id: "documents",
      label: "Documents",
      icon: FileCheck,
    },
  ];

  /*
   * ---------------------------------------------------------------
   * FORMAT DATE
   * ---------------------------------------------------------------
   */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      return new Date(
        value,
      ).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  /*
   * ---------------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-sm font-semibold text-coop-600 mb-1">
                Worker Portal
              </p>

              <h1 className="font-display text-3xl font-bold text-navy-700">
                Worker Profile
              </h1>

              <p className="text-slate-500 mt-2">
                Complete your registration and
                verification details to start
                offering services on ShramSetu.
              </p>

              {formData.id && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">

                  <BadgeCheck
                    size={15}
                    className="text-coop-600"
                  />

                  <span className="text-xs font-semibold text-slate-600">
                    Worker ID:
                  </span>

                  <span className="text-xs font-bold text-navy-700">
                    {formData.id}
                  </span>

                </div>
              )}

            </div>

            {/* PROFILE COMPLETION */}

            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 min-w-[240px]">

              <div className="flex items-center justify-between mb-2">

                <span className="text-sm font-semibold text-navy-700">
                  Profile Completion
                </span>

                <span className="text-sm font-bold text-coop-600">
                  {progress}%
                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-coop-500 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Complete all required details
                to submit your KYC request.
              </p>

            </div>

          </div>
        </div>

        {/* ===================================================== */}
        {/* VERIFICATION BANNER */}
        {/* ===================================================== */}

        <div
          className={`mb-6 p-4 rounded-2xl border ${currentStatus.bg} ${currentStatus.border}`}
        >

          <div className="flex items-start gap-3">

            <div className="mt-0.5">

              {verificationStatus ===
              "verified" ? (
                <CheckCircle2
                  size={22}
                  className={
                    currentStatus.icon
                  }
                />
              ) : verificationStatus ===
                "rejected" ? (
                <AlertCircle
                  size={22}
                  className={
                    currentStatus.icon
                  }
                />
              ) : (
                <Clock3
                  size={22}
                  className={
                    currentStatus.icon
                  }
                />
              )}

            </div>

            <div className="flex-1">

              <p
                className={`text-sm font-bold ${currentStatus.text}`}
              >
                {currentStatus.label}
              </p>

              <p
                className={`text-xs mt-1 ${currentStatus.text}`}
              >
                {currentStatus.description}
              </p>

              {/* PENDING */}

              {verificationStatus ===
                "pending" && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3">

                  <div className="bg-white/70 border border-amber-100 rounded-xl px-3 py-2">

                    <p className="text-[11px] text-slate-400">
                      Request Status
                    </p>

                    <p className="text-xs font-bold text-amber-700 mt-1">
                      KYC Submitted
                    </p>

                  </div>

                  <div className="bg-white/70 border border-amber-100 rounded-xl px-3 py-2">

                    <p className="text-[11px] text-slate-400">
                      Submitted
                    </p>

                    <p className="text-xs font-bold text-amber-700 mt-1">
                      {formatDate(
                        formData.lastSubmittedAt ||
                          formData.submittedAt,
                      )}
                    </p>

                  </div>

                </div>
              )}

              {/* REJECTED */}

              {verificationStatus ===
                "rejected" && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-red-100">

                  <p className="text-xs font-bold text-red-700">
                    Admin Review
                  </p>

                  <p className="text-xs text-red-600 mt-1 leading-relaxed">
                    {formData.rejectionReason ||
                      "Please review your information and resubmit the verification request."}
                  </p>

                </div>
              )}

              {/* VERIFIED */}

              {verificationStatus ===
                "verified" && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-green-100">

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={17}
                      className="text-green-600"
                    />

                    <p className="text-xs font-bold text-green-700">
                      Next Step: Go Live
                    </p>

                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Your profile is verified.
                    Go Live and face verification
                    are handled separately from
                    this profile page.
                  </p>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* MAIN GRID */}
        {/* ===================================================== */}

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">

          {/* =================================================== */}
          {/* SIDEBAR */}
          {/* =================================================== */}

          <div className="bg-white rounded-2xl border border-slate-200 p-3 h-fit">

            {sections.map(
              (section) => {
                const Icon =
                  section.icon;

                const completed =
                  completedSections[
                    section.id
                  ];

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id,
                      )
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left transition ${
                      activeSection ===
                      section.id
                        ? "bg-coop-50 text-coop-700"
                        : "text-navy-600 hover:bg-slate-50"
                    }`}
                  >

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        activeSection ===
                        section.id
                          ? "bg-coop-100"
                          : "bg-slate-100"
                      }`}
                    >
                      <Icon
                        size={18}
                      />
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold">
                        {section.label}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {completed
                          ? "Completed"
                          : "Required"}
                      </p>

                    </div>

                    {completed ? (
                      <CheckCircle2
                        size={17}
                        className="text-coop-600"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-slate-300"
                      />
                    )}

                  </button>
                );
              },
            )}

            {/* STATUS */}

            <div
              className={`mt-4 p-4 rounded-xl border ${currentStatus.bg} ${currentStatus.border}`}
            >

              <div className="flex items-center gap-2">

                {verificationStatus ===
                "verified" ? (
                  <CheckCircle2
                    size={17}
                    className={
                      currentStatus.icon
                    }
                  />
                ) : verificationStatus ===
                  "rejected" ? (
                  <AlertCircle
                    size={17}
                    className={
                      currentStatus.icon
                    }
                  />
                ) : (
                  <Clock3
                    size={17}
                    className={
                      currentStatus.icon
                    }
                  />
                )}

                <p
                  className={`text-sm font-semibold ${currentStatus.text}`}
                >
                  {currentStatus.label}
                </p>

              </div>

              <p
                className={`text-xs mt-2 leading-relaxed ${currentStatus.text}`}
              >
                {currentStatus.description}
              </p>

            </div>

          </div>

          {/* =================================================== */}
          {/* MAIN FORM */}
          {/* =================================================== */}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >

            {/* ================================================= */}
            {/* PERSONAL INFORMATION */}
            {/* ================================================= */}

            {activeSection ===
              "personal" && (
              <Section
                icon={
                  <User size={21} />
                }
                title="Personal Information"
                description="Provide your basic personal information."
              >

                <div className="grid md:grid-cols-2 gap-5">

                  <Input
                    label="Full Name"
                    value={
                      formData.fullName
                    }
                    onChange={(e) =>
                      updateField(
                        "fullName",
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Input
                    label="Mobile Number"
                    value={
                      formData.phone
                    }
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="Enter mobile number"
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={
                      formData.email
                    }
                    disabled
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    value={
                      formData.dob
                    }
                    onChange={(e) =>
                      updateField(
                        "dob",
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Select
                    label="Gender"
                    value={
                      formData.gender
                    }
                    onChange={(e) =>
                      updateField(
                        "gender",
                        e.target.value,
                      )
                    }
                    options={[
                      "Male",
                      "Female",
                      "Other",
                    ]}
                    required
                  />

                  <Input
                    label="PIN Code"
                    value={
                      formData.pincode
                    }
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value
                          .replace(
                            /\D/g,
                            "",
                          )
                          .slice(
                            0,
                            6,
                          ),
                      )
                    }
                    placeholder="Enter 6-digit PIN code"
                    required
                  />

                </div>

                {/* ADDRESS */}

                <div className="mt-5">

                  <label className="block text-sm font-semibold text-navy-700 mb-2">

                    Address{" "}

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <textarea
                    value={
                      formData.address
                    }
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value,
                      )
                    }
                    placeholder="Enter your complete address"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coop-500 resize-none"
                    required
                  />

                </div>

                {/* CITY */}

                <div className="mt-5">

                  <label className="block text-sm font-semibold text-navy-700 mb-2">

                    City{" "}

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <div className="relative">

                    <MapPin
                      size={17}
                      className="absolute left-4 top-3.5 text-slate-400"
                    />

                    <input
                      value={
                        formData.city
                      }
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value,
                        )
                      }
                      placeholder="Enter your city"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coop-500"
                      required
                    />

                  </div>

                </div>

                {/* SERVICE LOCATION */}

                <div className="mt-6 p-5 rounded-2xl border border-blue-100 bg-blue-50">

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div className="flex gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">

                        <MapPin
                          size={20}
                          className="text-blue-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-blue-900">
                          Service Location
                        </p>

                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          Your approximate location
                          helps ShramSetu match
                          customers with nearby
                          verified workers.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        detectWorkerLocation
                      }
                      disabled={
                        locationLoading
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 shrink-0"
                    >

                      {locationLoading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <LocateFixed
                          size={17}
                        />
                      )}

                      {locationLoading
                        ? "Detecting..."
                        : "Use Current Location"}

                    </button>

                  </div>

                  {/* LOCATION STATUS */}

                  <div className="mt-4">

                    {formData.latitude &&
                    formData.longitude ? (
                      <div className="p-3 rounded-xl bg-white border border-blue-100">

                        <div className="flex items-center gap-2">

                          <CheckCircle2
                            size={17}
                            className="text-green-600"
                          />

                          <p className="text-sm font-semibold text-green-700">
                            Location captured
                          </p>

                        </div>

                        <p className="text-xs text-slate-500 mt-2">

                          Coordinates:{" "}

                          {Number(
                            formData.latitude,
                          ).toFixed(6)}

                          ,{" "}

                          {Number(
                            formData.longitude,
                          ).toFixed(6)}

                        </p>

                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-white border border-amber-100">

                        <div className="flex items-center gap-2">

                          <AlertCircle
                            size={17}
                            className="text-amber-600"
                          />

                          <p className="text-sm font-semibold text-amber-700">
                            Location not captured
                          </p>

                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Allow location permission
                          to appear in Nearby
                          Services.
                        </p>

                      </div>
                    )}

                    {locationMessage && (
                      <p className="text-xs text-blue-700 mt-2">
                        {
                          locationMessage
                        }
                      </p>
                    )}

                  </div>

                </div>

              </Section>
            )}

            {/* ================================================= */}
            {/* IDENTITY */}
            {/* ================================================= */}

            {activeSection ===
              "identity" && (
              <Section
                icon={
                  <ShieldCheck
                    size={21}
                  />
                }
                title="Identity Verification"
                description="Verify your identity to become a trusted ShramSetu worker."
              >

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">

                  <div className="flex gap-3">

                    <LockKeyhole
                      size={20}
                      className="text-blue-600 mt-0.5"
                    />

                    <div>

                      <p className="font-semibold text-blue-800 text-sm">
                        Secure Identity
                        Verification
                      </p>

                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Your identity information
                        is used for worker
                        verification and
                        cooperative onboarding.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="max-w-xl">

                  <Input
                    label="Aadhaar Number"
                    type="password"
                    value={
                      formData.aadhaar
                    }
                    onChange={(e) =>
                      updateField(
                        "aadhaar",
                        e.target.value
                          .replace(
                            /\D/g,
                            "",
                          )
                          .slice(
                            0,
                            12,
                          ),
                      )
                    }
                    placeholder="Enter 12-digit Aadhaar number"
                    required
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    Demo interface only —
                    no Aadhaar API is
                    connected.
                  </p>

                </div>

                <div className="mt-6 max-w-xl">

                  <FileUpload
                    label="Aadhaar Document"
                    description="Required for identity verification."
                    file={
                      formData.aadhaarFile
                    }
                    onChange={(file) =>
                      handleFileChange(
                        "aadhaarFile",
                        file,
                      )
                    }
                    required
                  />

                </div>

                <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">

                      <Clock3
                        size={19}
                        className="text-amber-600"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-navy-700">
                        Verification Status
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {
                          currentStatus.label
                        }
                      </p>

                    </div>

                  </div>

                </div>

              </Section>
            )}

            {/* ================================================= */}
            {/* PROFESSIONAL */}
            {/* ================================================= */}

            {activeSection ===
              "professional" && (
              <Section
                icon={
                  <Briefcase
                    size={21}
                  />
                }
                title="Professional Details"
                description="Tell customers what services you provide."
              >

                <div className="grid md:grid-cols-2 gap-5">

                  <Select
                    label="Primary Skill"
                    value={
                      formData.skill
                    }
                    onChange={(e) =>
                      updateField(
                        "skill",
                        e.target.value,
                      )
                    }
                    options={[
                      "Electrician",
                      "Plumber",
                      "Carpenter",
                      "Painter",
                      "Cleaner",
                      "Appliance Technician",
                      "Gardener",
                      "Driver",
                      "Caregiver",
                      "Other",
                    ]}
                    required
                  />

                  <Select
                    label="Experience"
                    value={
                      formData.experience
                    }
                    onChange={(e) =>
                      updateField(
                        "experience",
                        e.target.value,
                      )
                    }
                    options={[
                      "Less than 1 year",
                      "1–3 years",
                      "3–5 years",
                      "5–10 years",
                      "10+ years",
                    ]}
                    required
                  />

                  <div className="md:col-span-2">

                    <label className="block text-sm font-semibold text-navy-700 mb-2">

                      Services You Offer{" "}

                      <span className="text-red-500">
                        *
                      </span>

                    </label>

                    <textarea
                      value={
                        formData.services
                      }
                      onChange={(e) =>
                        updateField(
                          "services",
                          e.target.value,
                        )
                      }
                      placeholder="Example: Home wiring, switchboard repair, fan installation..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coop-500 resize-none"
                      required
                    />

                  </div>

                  <Input
                    label="Service Area"
                    value={
                      formData.serviceArea
                    }
                    onChange={(e) =>
                      updateField(
                        "serviceArea",
                        e.target.value,
                      )
                    }
                    placeholder="Example: Vaishali Nagar, Jaipur"
                    required
                  />

                </div>

              </Section>
            )}

            {/* ================================================= */}
            {/* PAYMENT */}
            {/* ================================================= */}

            {activeSection ===
              "payment" && (
              <Section
                icon={
                  <CreditCard
                    size={21}
                  />
                }
                title="Payment Details"
                description="Add your payment details for receiving service earnings."
              >

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">

                  <p className="text-sm font-semibold text-navy-700">
                    Payment Information
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    These details are used
                    for worker payouts after
                    completed services.
                  </p>

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                  <Input
                    label="Account Holder Name"
                    value={
                      formData.accountHolder
                    }
                    onChange={(e) =>
                      updateField(
                        "accountHolder",
                        e.target.value,
                      )
                    }
                    required
                  />

                  <Input
                    label="Bank Account Number"
                    type="password"
                    value={
                      formData.accountNumber
                    }
                    onChange={(e) =>
                      updateField(
                        "accountNumber",
                        e.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    required
                  />

                  <Input
                    label="IFSC Code"
                    value={
                      formData.ifsc
                    }
                    onChange={(e) =>
                      updateField(
                        "ifsc",
                        e.target.value.toUpperCase(),
                      )
                    }
                    placeholder="Example: SBIN0001234"
                    required
                  />

                </div>

              </Section>
            )}

            {/* ================================================= */}
            {/* DOCUMENTS */}
            {/* ================================================= */}

            {activeSection ===
              "documents" && (
              <Section
                icon={
                  <FileCheck
                    size={21}
                  />
                }
                title="Documents"
                description="Upload documents required for cooperative verification."
              >

                <div className="space-y-5 max-w-2xl">

                  <FileUpload
                    label="Skill Certificate"
                    description="Optional — upload a relevant skill or training certificate."
                    file={
                      formData.skillCertificate
                    }
                    onChange={(file) =>
                      handleFileChange(
                        "skillCertificate",
                        file,
                      )
                    }
                  />

                  <FileUpload
                    label="Address Proof"
                    description="Required for cooperative verification."
                    file={
                      formData.addressProof
                    }
                    onChange={(file) =>
                      handleFileChange(
                        "addressProof",
                        file,
                      )
                    }
                    required
                  />

                  <FileUpload
                    label="Profile Photo"
                    description="Optional — use a clear photo for your worker profile."
                    file={
                      formData.profilePhoto
                    }
                    onChange={(file) =>
                      handleFileChange(
                        "profilePhoto",
                        file,
                      )
                    }
                  />

                </div>

              </Section>
            )}

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div className="mx-6 mb-5 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">

                <AlertCircle
                  size={19}
                  className="text-red-500 mt-0.5 shrink-0"
                />

                <div>

                  <p className="text-sm font-semibold text-red-700">
                    Please complete the
                    required information
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="border-t border-slate-200 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

              <div>

                {saved && (
                  <div className="flex items-center gap-2 text-sm text-coop-600 font-semibold">

                    <CheckCircle2
                      size={17}
                    />

                    KYC request submitted
                    successfully

                  </div>
                )}

                {!saved && (
                  <p className="text-xs text-slate-400">

                    <span className="text-red-500">
                      *
                    </span>{" "}
                    Required fields

                  </p>
                )}

              </div>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-coop-600 hover:bg-coop-700 text-white font-semibold rounded-xl transition"
              >

                {verificationStatus ===
                "rejected" ? (
                  <>
                    <RefreshCw
                      size={17}
                    />

                    Resubmit for
                    Verification
                  </>
                ) : (
                  <>
                    <Send
                      size={17}
                    />

                    Submit for
                    Verification
                  </>
                )}

              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* SECTION COMPONENT */
/* ============================================================= */

function Section({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div>

      <div className="px-6 py-5 border-b border-slate-200">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-coop-50 text-coop-600 flex items-center justify-center">
            {icon}
          </div>

          <div>

            <h2 className="font-display text-xl font-bold text-navy-700">
              {title}
            </h2>

            <p className="text-sm text-slate-500 mt-0.5">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div className="p-6">
        {children}
      </div>

    </div>
  );
}

/* ============================================================= */
/* INPUT */
/* ============================================================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-navy-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coop-500 ${
          disabled
            ? "bg-slate-50 text-slate-500 cursor-not-allowed"
            : ""
        }`}
      />

    </div>
  );
}

/* ============================================================= */
/* SELECT */
/* ============================================================= */

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-navy-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-coop-500"
      >

        <option value="">
          Select{" "}
          {label.toLowerCase()}
        </option>

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}

      </select>

    </div>
  );
}

/* ============================================================= */
/* FILE UPLOAD */
/* ============================================================= */

function FileUpload({
  label,
  description,
  file,
  onChange,
  required = false,
}) {
  /*
   * File can be:
   *
   * 1. Browser File object
   * 2. Filename string loaded from localStorage
   * 3. null
   */

  const fileName =
    file instanceof File
      ? file.name
      : typeof file === "string"
        ? file
        : "";

  const hasFile =
    Boolean(fileName);

  return (
    <div>

      <label className="block text-sm font-semibold text-navy-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {description && (
        <p className="text-xs text-slate-400 mb-3">
          {description}
        </p>
      )}

      <label
        className={`border-2 border-dashed rounded-xl p-5 flex items-center gap-4 cursor-pointer transition ${
          hasFile
            ? "border-coop-400 bg-coop-50/30"
            : "border-slate-200 hover:border-coop-400 hover:bg-coop-50/30"
        }`}
      >

        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">

          {hasFile ? (
            <CheckCircle2
              size={20}
              className="text-coop-600"
            />
          ) : (
            <Upload size={20} />
          )}

        </div>

        <div className="flex-1">

          <p className="text-sm font-semibold text-navy-700">

            {hasFile
              ? fileName
              : "Upload document"}

          </p>

          <p className="text-xs text-slate-400 mt-1">
            PDF, JPG or PNG
          </p>

        </div>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) =>
            onChange(
              e.target.files?.[0] ||
                null,
            )
          }
        />

      </label>

    </div>
  );
}

/* ============================================================= */
/* GEOLOCATION HELPER */
/* ============================================================= */

function getCurrentPosition() {
  return new Promise(
    (resolve, reject) => {
      if (
        !navigator.geolocation
      ) {
        reject(
          new Error(
            "Geolocation is not supported by this browser.",
          ),
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    },
  );
}