import React, { useEffect, useRef } from "react";
import L from "leaflet";

/*
 * ============================================================
 * SHRAMSETU NEARBY MAP
 * Uses Leaflet directly + OpenStreetMap
 * No react-leaflet required
 * ============================================================
 */

/* ------------------------------------------------------------
 * Customer location icon
 * ------------------------------------------------------------ */
const customerIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 22px;
        height: 22px;
        background: #2563eb;
        border: 4px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
      "
    ></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/* ------------------------------------------------------------
 * Worker location icon
 * ------------------------------------------------------------ */
const workerIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        background: #16a34a;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
        "
      ></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

/* ------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------ */
export default function NearbyMap({
  location,
  workers = [],
  pickable = false,
  onLocationChange,
  heightClassName = "h-[480px]",
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const customerMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const workerMarkersRef = useRef([]);

  /*
   * Always keep the latest callback without
   * re-running the "create map" effect when
   * the parent re-renders and passes a new
   * function reference.
   */
  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  /* ==========================================================
   * CREATE MAP
   * ========================================================== */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    /*
     * Prevent duplicate map initialization.
     */
    if (mapRef.current) return;

    /*
     * Default location:
     * Jaipur
     *
     * This is only used until browser GPS is available.
     */
    const initialCenter = location
      ? [
          Number(location.latitude),
          Number(location.longitude),
        ]
      : [26.9124, 75.7873];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    /*
     * OpenStreetMap tiles
     */
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    mapRef.current = map;

    if (pickable) {
      map.on("click", (e) => {
        onLocationChangeRef.current?.({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      });
    }

    /*
     * Leaflet sometimes needs a size refresh
     * after the container becomes visible.
     */
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    /*
     * Cleanup
     */
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ==========================================================
   * UPDATE CUSTOMER LOCATION
   * ========================================================== */
  useEffect(() => {
    if (!mapRef.current || !location) return;

    const map = mapRef.current;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return;
    }

    const customerPosition = [
      latitude,
      longitude,
    ];

    /*
     * Move map to customer's current location.
     */
    map.setView(customerPosition, 13);

    /* --------------------------------------------------------
     * Remove previous customer marker
     * -------------------------------------------------------- */
    if (customerMarkerRef.current) {
      customerMarkerRef.current.remove();
      customerMarkerRef.current = null;
    }

    /* --------------------------------------------------------
     * Add customer marker
     * -------------------------------------------------------- */
    customerMarkerRef.current = L.marker(
      customerPosition,
      {
        icon: customerIcon,
        draggable: pickable,
      }
    )
      .addTo(map)
      .bindPopup(`
        <div style="font-size:14px; line-height:1.5;">
          <strong>Your Location</strong>
          <br />
          ${
            pickable
              ? "Drag the pin or tap the map to adjust"
              : "ShramSetu Customer"
          }
        </div>
      `);

    if (pickable) {
      customerMarkerRef.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();

        onLocationChangeRef.current?.({
          latitude: lat,
          longitude: lng,
        });
      });
    }

    /* --------------------------------------------------------
     * Remove previous radius circle
     * -------------------------------------------------------- */
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    /* --------------------------------------------------------
     * Add 25 km service radius
     * -------------------------------------------------------- */
    radiusCircleRef.current = L.circle(
      customerPosition,
      {
        radius: 25000,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        weight: 2,
      }
    ).addTo(map);

    /*
     * Refresh map layout.
     */
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [location]);

  /* ==========================================================
   * UPDATE WORKER MARKERS
   * ========================================================== */
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    /* --------------------------------------------------------
     * Remove all old worker markers
     * -------------------------------------------------------- */
    workerMarkersRef.current.forEach((marker) => {
      marker.remove();
    });

    workerMarkersRef.current = [];

    /* --------------------------------------------------------
     * Add current workers
     * -------------------------------------------------------- */
    workers.forEach((worker) => {
      const latitude = Number(worker.latitude);
      const longitude = Number(worker.longitude);

      /*
       * Ignore workers without valid coordinates.
       */
      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        return;
      }

      /*
       * Safety check:
       * Nearby.jsx should already filter verified workers,
       * but we keep this protection here too.
       */
      if (
        worker.verificationStatus &&
        worker.verificationStatus !== "verified"
      ) {
        return;
      }

      const distance = Number(worker.distance || 0);

      const workerName =
        worker.fullName ||
        "ShramSetu Worker";

      const workerSkill =
        worker.skill ||
        "Skilled Worker";

      const workerExperience =
        worker.experience ||
        "Not specified";

      const workerArea =
        worker.serviceArea ||
        worker.city ||
        "Local area";

      /* ------------------------------------------------------
       * Popup content
       * ------------------------------------------------------ */
      const popupContent = `
        <div style="
          min-width: 210px;
          font-family: Arial, sans-serif;
        ">

          <div style="
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          ">
            ${workerName}
          </div>

          <div style="
            font-size: 13px;
            color: #64748b;
            margin-bottom: 10px;
          ">
            ${workerSkill}
          </div>

          <div style="
            background: #f0fdf4;
            color: #166534;
            padding: 5px 8px;
            border-radius: 6px;
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 10px;
          ">
            ✓ Verified Worker
          </div>

          <div style="
            font-size: 12px;
            color: #475569;
            line-height: 1.7;
          ">

            <div>
              <strong>Distance:</strong>
              ${distance.toFixed(1)} km
            </div>

            <div>
              <strong>Experience:</strong>
              ${workerExperience}
            </div>

            <div>
              <strong>Service Area:</strong>
              ${workerArea}
            </div>

          </div>

          <button
            id="book-worker-${worker.id || worker.email}"
            style="
              width: 100%;
              margin-top: 12px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 9px 10px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            View & Book
          </button>

        </div>
      `;

      /* ------------------------------------------------------
       * Create marker
       * ------------------------------------------------------ */
      const marker = L.marker(
        [latitude, longitude],
        {
          icon: workerIcon,
          title: workerName,
        }
      )
        .addTo(map)
        .bindPopup(popupContent);

      /*
       * When popup opens, connect the Book button.
       */
      marker.on("popupopen", () => {
        const button = document.getElementById(
          `book-worker-${worker.id || worker.email}`
        );

        if (!button) return;

        button.onclick = () => {
          window.dispatchEvent(
            new CustomEvent(
              "shramsetu-book-worker",
              {
                detail: worker,
              }
            )
          );
        };
      });

      workerMarkersRef.current.push(marker);
    });

    /*
     * Refresh map.
     */
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [workers]);

  /* ==========================================================
   * RENDER
   * ========================================================== */
  return (
    <div className={`relative w-full ${heightClassName} rounded-2xl overflow-hidden`}>

      {/* ------------------------------------------------------
          MAP
      ------------------------------------------------------- */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {/* ------------------------------------------------------
          MAP LEGEND
      ------------------------------------------------------- */}
      <div
        className="
          absolute
          bottom-4
          left-4
          z-[1000]
          bg-white
          rounded-xl
          shadow-lg
          border
          border-slate-200
          px-4
          py-3
        "
      >

        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span>Your location</span>
        </div>

        {!pickable && (
          <div className="flex items-center gap-2 text-xs text-slate-700 mt-2">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            <span>Verified worker</span>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------
          WORKER COUNT
      ------------------------------------------------------- */}
      {!pickable && (
        <div
          className="
            absolute
            top-4
            right-4
            z-[1000]
            bg-white
            rounded-xl
            shadow-lg
            border
            border-slate-200
            px-4
            py-2
          "
        >

          <p className="text-xs text-slate-500">
            Nearby verified workers
          </p>

          <p className="font-bold text-slate-900">
            {workers.length}
          </p>

        </div>
      )}

    </div>
  );
}