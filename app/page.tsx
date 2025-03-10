"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import MapBox from "@/components/mapbox";
import D3Component from "@/components/d3chart";
import { useMapStore } from "@/store/map-store";
import mapboxgl from "mapbox-gl";
import { getPrediction } from "./actions";
import { usePredictionStore } from "@/store/prediction-store";

export default function Home() {
  const mapStore = useMapStore((state) => state);
  const predictionStore = usePredictionStore((state) => state);
  const [sensor, setSensor] = useState("buhi");
  const [model, setModel] = useState("svr");
  const [inputDate, setInputDate] = useState("2024-06-14");
  const [inputTime, setInputTime] = useState("12:00");
  const [client, setClient] = useState(false);
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
    if (typeof window === 'undefined' || !mapStore.getMap()) return;
    
    // Only run this code on the client side
    sensorInfo.map((val) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.id = val.name;

      new mapboxgl.Marker(el)
        .setLngLat([val.longitude, val.latitude])
        .addTo(mapStore.getMap()!)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `
              <div style="padding: 10px; border-radius: 3em;">
                <p style="font-weight: bold;">${val.name}</p>
                <p id="${val.station_id}"></p>
              </div>
              `
          )
        );
    });
    setClient(true);
  }, [mapStore]);

  useEffect(() => {
    getPrediction(inputDate, inputTime, model, sensor).then((res) => {
      console.log(res);
      predictionStore.setPredictionData(res);
    });
  }, [inputDate, inputTime, model, sensor]);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <nav className="p-2 w-full border border-b-gray-300 bg-white">
        <div className="max-w-screen-2xl m-auto flex justify-between items-center">
          <span className="font-bold text-blue-500 text-xl">FlowCast</span>
          <Info className="text-blue-500" />
        </div>
      </nav>

      <div className="w-full max-w-screen-2xl mx-auto flex flex-col gap-4 flex-1 px-4 py-4 overflow-hidden">
        {/* map */}
        <div className="p-2 bg-orange-200 border-l-4 border-orange-300 rounded-lg text-orange-600">
          <h2 className="text-lg">
            Note: Due to sensor limitations{" "}
            <span className="italic font-bold">(lack of real time data)</span>{" "}
            predictions{" "}
            <span className="italic underline font-bold">
              are limited to previously recorded rainfall and water level data.
            </span>
          </h2>
        </div>

        {/* Main content area - Map on left, controls and graph on right */}
        <div className="flex flex-row gap-4 flex-1 overflow-hidden">
          {/* Left side - Map */}
          <div className="w-3/5 relative">
            <MapBox />
          </div>

          {/* Right side - Controls and Graph */}
          <div className="w-2/5 flex flex-col gap-4 overflow-auto">
            {/* Controls section */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-blue-600 mb-4">
                Prediction Controls
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {/* Prediction date and time */}
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-gray-700">Prediction Time</p>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="predictionDate"
                      className="text-sm text-gray-600"
                    >
                      Date
                    </label>
                    <input
                      id="predictionDate"
                      type="date"
                      className="p-2.5 border border-gray-300 rounded-md hover:cursor-pointer focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      min={"2020-06-1"}
                      max={"2024-12-11"}
                      defaultValue={inputDate}
                      onChange={(e) => {
                        console.log(e.currentTarget.value);
                        setInputDate(e.currentTarget.value);
                      }}
                    />
                    <label
                      htmlFor="predictionTime"
                      className="text-sm text-gray-600"
                    >
                      Time
                    </label>
                    <input
                      id="predictionTime"
                      className="p-2.5 border border-gray-300 rounded-md hover:cursor-pointer focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      type="time"
                      step={3600}
                      defaultValue={inputTime}
                      onChange={(e) => {
                        console.log(e.currentTarget.value);
                        let hour = e.currentTarget.value.split(":")[0];
                        setInputTime(hour);
                      }}
                    />
                  </div>
                </div>

                {/* Station selector */}
                <div className="flex flex-col gap-3">
                  <h2 className="font-bold text-gray-700">Station</h2>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col gap-2">
                    {["buhi", "sipocot", "bato", "ombao"].map((val) => {
                      return (
                        <div
                          className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
                          key={val}
                        >
                          <input
                            type="radio"
                            id={val}
                            className="w-4 h-4 accent-blue-500"
                            checked={sensor === val}
                            onChange={() => {
                              setSensor(val);
                            }}
                          />
                          <label
                            htmlFor={val}
                            className="cursor-pointer w-full"
                          >
                            {val.charAt(0).toUpperCase() + val.slice(1)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Model selector */}
                <div className="flex flex-col gap-3">
                  <h2 className="font-bold text-gray-700">ML Model</h2>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col gap-2">
                    {["svr", "rfr", "lstm"].map((val) => {
                      return (
                        <div
                          className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
                          key={val}
                        >
                          <input
                            type="radio"
                            id={val}
                            className="w-4 h-4 accent-blue-500"
                            checked={model === val}
                            onChange={() => {
                              setModel(val);
                            }}
                          />
                          <label
                            htmlFor={val}
                            className="cursor-pointer w-full"
                          >
                            {val.toUpperCase()}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Water Level Status Indicator */}
            {predictionStore.getPredictionData() && (
              <div className={`rounded-lg p-4 ${
                (() => {
                  const maxWaterLevel = Math.max(
                    ...(predictionStore.getPredictionData()?.forecast
                      .waterlevels || [0])
                  );
                  const currentSensorInfo = sensorInfo.find(
                    (s) => s.name.toLowerCase() === sensor.toLowerCase()
                  );
                  
                  if (!currentSensorInfo) return "bg-blue-100 border-l-4 border-blue-500";
                  
                  if (maxWaterLevel >= currentSensorInfo.critical) {
                    return "bg-red-100 border-l-4 border-red-500";
                  } else if (maxWaterLevel >= currentSensorInfo.alert) {
                    return "bg-yellow-100 border-l-4 border-yellow-500";
                  } else {
                    return "bg-blue-100 border-l-4 border-blue-500";
                  }
                })()
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (() => {
                      const maxWaterLevel = Math.max(
                        ...(predictionStore.getPredictionData()?.forecast
                          .waterlevels || [0])
                      );
                      const currentSensorInfo = sensorInfo.find(
                        (s) => s.name.toLowerCase() === sensor.toLowerCase()
                      );
                      
                      if (!currentSensorInfo) return "bg-blue-500";
                      
                      if (maxWaterLevel >= currentSensorInfo.critical) {
                        return "bg-red-500";
                      } else if (maxWaterLevel >= currentSensorInfo.alert) {
                        return "bg-yellow-500";
                      } else {
                        return "bg-blue-500";
                      }
                    })()
                  }`}></div>
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
                        return "Critical Water Level";
                      } else if (maxWaterLevel >= currentSensorInfo.alert) {
                        return "Alert Water Level";
                      } else {
                        return "Safe Water Level";
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
                    
                    if (!currentSensorInfo) return "Unable to determine threshold for this sensor.";
                    
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Threshold Reference
                  </h4>
                  {(() => {
                    const currentSensorInfo = sensorInfo.find(
                      (s) => s.name.toLowerCase() === sensor.toLowerCase()
                    );
                    
                    if (!currentSensorInfo) return <p className="text-xs text-gray-500">No threshold data available for this sensor.</p>;
                    
                    return (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Critical: {currentSensorInfo.critical}m</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Alarm: {currentSensorInfo.alarm}m</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Alert: {currentSensorInfo.alert}m</span>
                        </div>
                        <div className="flex items-center col-span-3 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            <div className="rounded-lg p-4 bg-white flex-1 shadow-sm">
              <div className="text-xl flex justify-between mb-2">
                <span className="font-bold">
                  {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
                </span>
                <span className="text-sm font-medium bg-blue-200 p-2 rounded-md text-blue-600">
                  Model: {model.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
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
                <D3Component />
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
