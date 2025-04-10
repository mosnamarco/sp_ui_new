"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import MapBox from "@/components/mapbox";
import D3Component from "@/components/d3chart";
import { useMapStore } from "@/store/map-store";
import mapboxgl from "mapbox-gl";
import { getPrediction } from "./actions";
import { usePredictionStore } from "@/store/prediction-store";
import { useSelectionStore } from "@/store/selection-store";

export default function Home() {
  const mapStore = useMapStore((state) => state);
  const selectionStore = useSelectionStore((state) => state);
  const predictionStore = usePredictionStore((state) => state);
  const [sensor, setSensor] = useState("buhi");
  const [model, setModel] = useState("svr");
  const [inputDate, setInputDate] = useState("2024-06-14");
  const [inputTime, setInputTime] = useState("12:00");
  const [sensorInfo, _] = useState([
    {
      station_id: 630365,
      name: "Buhi",
      type: "rainfall, waterlevel",
      location: "Brgy. Salvacion, Buhi, Camarines Sur",
      latitude: 13.4337,
      longitude: 123.509,
      elevation: 86,
      alert: 1.6,
      alarm: 2.4,
      critical: 4,
      available_params: "rainfall,waterlevel",
    },
    {
      station_id: 630371,
      name: "Ombao",
      type: "rainfall, waterlevel",
      location: "Brgy. Ombao-Polpog, Bula, Camarines Sur",
      latitude: 13.47482,
      longitude: 123.2413,
      elevation: 10,
      alert: 3.6,
      alarm: 5.4,
      critical: 9,
      available_params: "rainfall,waterlevel",
    },
    {
      station_id: "630364",
      name: "Bato",
      type: "rainfall, waterlevel",
      location: "Brgy. Divina Pastora, Bato, Camarines Sur",
      latitude: 13.35348,
      longitude: 123.3645,
      elevation: 3,
      alert: 1.6,
      alarm: 2.4,
      critical: 4,
      available_params: "rainfall,waterlevel",
    },
    {
      station_id: 630382,
      name: "Sipocot",
      type: "rainfall, waterlevel",
      location: "Brgy. North Centro, Sipocot, Camarines Sur",
      latitude: 13.77142,
      longitude: 122.975,
      elevation: 13,
      alert: 4.2,
      alarm: 6.3,
      critical: 10.5,
      available_params: "rainfall,waterlevel",
    },
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapStore.getMap()) return;

    // Only run this code on the client side
    sensorInfo.map((val) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.id = val.name.toLowerCase();

      new mapboxgl.Marker(el)
        .setLngLat([val.longitude, val.latitude])
        .addTo(mapStore.getMap()!);

    });
  }, [mapStore]);

  useEffect(() => {
    // Skip if map is not available
    if (!mapStore.getMap()) return;

    // Update the popup content for the selected station
    const element = document.getElementById(selectionStore.station);
    if (element) {
      element.innerHTML = `
        <div style="
          width: 120px; 
          transform: translate(-40px, -120px); 
          padding: 12px; 
          z-index: 90;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          ${selectionStore.status === "safe" 
            ? "background-color: #e6f7e6; border: 2px solid #4caf50;" 
            : selectionStore.status === "alert" 
              ? "background-color: #fff8e6; border: 2px solid #ff9800;" 
              : "background-color: #ffebee; border: 2px solid #f44336;"}
        ">
          <p style="
            font-weight: bold; 
            text-transform: capitalize;
            text-align: center;
            ${selectionStore.status === "safe" 
              ? "color: #2e7d32;" 
              : selectionStore.status === "alert" 
                ? "color: #e65100;" 
                : "color: #b71c1c;"}
          ">${selectionStore.station}</p>
          
          <div style="
            margin-top: 8px;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
            ${selectionStore.status === "safe" 
              ? "background-color: #c8e6c9; color: #2e7d32;" 
              : selectionStore.status === "alert" 
                ? "background-color: #ffe0b2; color: #e65100;" 
                : "background-color: #ffcdd2; color: #b71c1c;"}
          ">
            ${selectionStore.status === "safe" 
              ? "✅ Safe" 
              : selectionStore.status === "alert" 
                ? "⚠️ Alert" 
                : "🚨 Critical"}
          </div>
          
          <p style="
            font-size: 0.75em; 
            margin-top: 8px; 
            text-align: center;
            padding: 2px;
            background-color: rgba(0,0,0,0.05);
            border-radius: 3px;
          ">
            Model: ${selectionStore.model.toUpperCase()}
          </p>
        </div>
      `;
    }
    
    // Force mapbox to refresh/redraw
    mapStore.getMap()?.resize();
  }, [selectionStore, mapStore])

  useEffect(() => {
    getPrediction(inputDate, inputTime, model, sensor).then((res) => {
      console.log(res);
      predictionStore.setPredictionData(res);

      const maxWaterLevel = Math.max(
        ...(predictionStore.getPredictionData()?.forecast.waterlevels || [0])
      );
      const currentSensorInfo = sensorInfo.find(
        (s) => s.name.toLowerCase() === sensor.toLowerCase()
      );

      if (!currentSensorInfo)
        return;

      if (maxWaterLevel >= currentSensorInfo.critical) {
        selectionStore.setStatus("critical")
      } else if (maxWaterLevel >= currentSensorInfo.alert) {
        selectionStore.setStatus("alert")
      } else {
        selectionStore.setStatus("safe")
      }
    });
  }, [inputDate, inputTime, model, sensor]);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <nav className="p-2 w-full border border-b-gray-300 bg-white">
        <div className="max-w-screen-2xl m-auto flex justify-between items-center">
          <span className="font-bold text-blue-500 text-xl">FlowCast (Proof of Concept)</span>
          <Info className="text-blue-500" />
        </div>
      </nav>

      <div className="w-full max-w-screen-2xl mx-auto flex flex-col gap-4 flex-1 px-4 py-4 overflow-hidden">
        {/* map */}
        <div className="p-2 bg-orange-200 border-l-4 border-orange-300 rounded-lg text-orange-600">
          <h3 className="text-sm font-semibold">
            Note: Due to sensor limitations{" "}
            <span className="italic font-bold">(lack of real time data)</span>{" "}
            predictions{" "}
            <span className="italic underline font-bold">
              are limited to previously recorded rainfall and water level data.
            </span>
          </h3>
        </div>

        {/* Main content area - Map on left, controls and graph on right */}
        <div className="flex flex-row gap-4 flex-1 overflow-hidden">
          {/* Left side - Map */}
          <div className="w-3/5 relative">
            <MapBox />
          </div>

          {/* Right side - Controls and Graph */}
          <div className="w-2/5 flex flex-col gap-4 overflow-auto">
            {/* Water Level Status Indicator */}
            {predictionStore.getPredictionData() && (
              <div
                className={`rounded-lg p-4 ${(() => {
                  const maxWaterLevel = Math.max(
                    ...(predictionStore.getPredictionData()?.forecast
                      .waterlevels || [0])
                  );
                  const currentSensorInfo = sensorInfo.find(
                    (s) => s.name.toLowerCase() === sensor.toLowerCase()
                  );

                  if (!currentSensorInfo)
                    return "bg-blue-100 border-l-4 border-blue-500";

                  if (maxWaterLevel >= currentSensorInfo.critical) {
                    return "bg-red-100 border-l-4 border-red-500";
                  } else if (maxWaterLevel >= currentSensorInfo.alert) {
                    return "bg-yellow-100 border-l-4 border-yellow-500";
                  } else {
                    return "bg-blue-100 border-l-4 border-blue-500";
                  }
                })()}`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">
                    {(() => {
                      const maxWaterLevel = Math.max(
                        ...(predictionStore.getPredictionData()?.forecast
                          .waterlevels || [0])
                      );
                      const currentSensorInfo = sensorInfo.find(
                        (s) => s.name.toLowerCase() === sensor.toLowerCase()
                      );

                      if (!currentSensorInfo) return "Water Level Status";

                      if (maxWaterLevel >= currentSensorInfo.critical) {
                        return `⚠️ Critical Water Level at ${currentSensorInfo.name} Station ⚠️`;
                      } else if (maxWaterLevel >= currentSensorInfo.alert) {
                        return `⚠️ Alert Water Level at ${currentSensorInfo.name} Station ⚠️`;
                      } else {
                        return `✅ Safe Water Level at ${currentSensorInfo.name} Station ✅`;
                      }
                    })()}
                  </h3>
                </div>
                <p className="mt-1 text-sm">
                  {(() => {
                    const maxWaterLevel = Math.max(
                      ...(predictionStore.getPredictionData()?.forecast
                        .waterlevels || [0])
                    );
                    const currentSensorInfo = sensorInfo.find(
                      (s) => s.name.toLowerCase() === sensor.toLowerCase()
                    );

                    if (!currentSensorInfo)
                      return "Unable to determine threshold for this sensor.";

                    if (maxWaterLevel >= currentSensorInfo.critical) {
                      return `Predicted water levels exceed the critical threshold of ${currentSensorInfo.critical} meters.`;
                    } else if (maxWaterLevel >= currentSensorInfo.alert) {
                      return `Predicted water levels exceed the alert threshold of ${currentSensorInfo.alert} meters.`;
                    } else {
                      return `Predicted water levels are below the alert threshold of ${currentSensorInfo.alert} meters.`;
                    }
                  })()}
                </p>
                <p className="mt-1 text-sm font-medium">
                  Maximum predicted level:{" "}
                  {Math.max(
                    ...(predictionStore.getPredictionData()?.forecast
                      .waterlevels || [0])
                  ).toFixed(2)}{" "}
                  meters
                </p>

                {/* Sensor threshold reference */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Threshold Reference
                  </h4>
                  {(() => {
                    const currentSensorInfo = sensorInfo.find(
                      (s) => s.name.toLowerCase() === sensor.toLowerCase()
                    );

                    if (!currentSensorInfo)
                      return (
                        <p className="text-xs text-gray-500">
                          No threshold data available for this sensor.
                        </p>
                      );

                    return (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-red-500 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>Critical: {currentSensorInfo.critical}m</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-orange-500 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Alarm: {currentSensorInfo.alarm}m</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-yellow-500 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Alert: {currentSensorInfo.alert}m</span>
                        </div>
                        <div className="flex items-center col-span-3 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-blue-500 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Safe: Below {currentSensorInfo.alert}m</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Graph section */}
            <div className="rounded-lg p-4 bg-white flex-1 shadow-sm overflow-hidden flex flex-col">
              <div className="text-xl flex justify-between mb-2">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Station</label>
                  <div className="relative flex items-center">
                    <select
                      className="font-bold bg-transparent appearance-none cursor-pointer pr-6 focus:outline-none border border-gray-300 rounded-md py-2 px-4 text-gray-800 hover:border-blue-500 transition-colors"
                      value={sensor}
                      onChange={(e) => {
                        selectionStore.setStation(e.target.value);
                        setSensor(e.target.value);
                      }}
                    >
                      {["buhi", "sipocot", "bato", "ombao"].map((val) => (
                        <option key={val} value={val}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Model</label>
                  <div className="relative flex items-center">
                    <select
                      className="text-sm font-medium bg-blue-200 p-2 rounded-md text-blue-600 appearance-none cursor-pointer pr-6 focus:outline-none"
                      value={model}
                      onChange={(e) => {
                        selectionStore.setModel(e.target.value);
                        setModel(e.target.value);
                      }}
                    >
                      {["svr", "rfr", "lstm"].map((val) => (
                        <option key={val} value={val}>
                          {val.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-0 flex items-center px-2 text-blue-600">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal prediction controls */}
              <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200 flex-shrink-0">
                <h4 className="text-sm font-semibold text-gray-700 mr-4 pb-2">
                  Forecast Controls
                </h4>
                <div className="flex items-center">
                  <div className="flex flex-1 gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Forecast Date
                      </label>
                      <input
                        type="date"
                        value={inputDate}
                        onChange={(e) => {
                          console.log('Date changed:', e.target.value);
                          setInputDate(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        max="2024-12-10"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={inputTime}
                        onChange={(e) => {
                          e.target.value = e.target.value.slice(0, 2) + ":" + "00";
                          console.log('Time changed:', e.target.value);
                          setInputTime(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200 flex-shrink-0">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Forecast Period
                  </h4>
                  <p className="text-sm">
                    <span className="font-medium text-blue-600">
                      {new Date(inputDate).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) +
                        " at " +
                        new Date(
                          `${inputDate}T${inputTime}:00`
                        ).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                    </span>{" "}
                    <span className="text-gray-500">→</span>{" "}
                    <span className="font-medium text-blue-600">
                      {new Date(
                        new Date(`${inputDate}T${inputTime}:00`).getTime() +
                          24 * 60 * 60 * 1000
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      }) +
                        " at " +
                        new Date(
                          `${inputDate}T${inputTime}:00`
                        ).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                    </span>
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  {sensorInfo.find(
                    (val) => val.name.toLowerCase() === sensor
                  ) && (
                    <D3Component
                      sensorInfo={
                        sensorInfo.find(
                          (val) => val.name.toLowerCase() === sensor
                        )!
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="p-2 bg-white text-xs text-center border-t border-gray-300 text-gray-600 mt-auto">
        © 2025 Ateneo De Naga University
      </footer>
    </div>
  );
}
