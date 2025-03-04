"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import MapBox from "@/components/mapbox";
import D3Component from "@/components/d3chart";
import { useMapStore } from "@/store/map-store";
import mapboxgl from "mapbox-gl";

export default function Home() {
  const mapStore = useMapStore((state) => state);
  const [isClient, setIsClient] = useState(false);
  const [sensor, setSensor] = useState("buhi");
  const [model, setModel] = useState("svr");
  const [inputDate, setInputDate] = useState("2024-06-14");
  const [inputTime, setInputTime] = useState("12:00");

  useEffect(() => {
    setIsClient(true);
    const sensorInfo = [
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
    ];

    if (mapStore.getMap()) {
      // todo: store this
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
    }
  }, [mapStore]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 bg-slate-100">
      <nav className="p-2 w-full border border-b-gray-300 bg-white">
        <div className="max-w-screen-lg m-auto flex justify-between items-center">
          <span className="font-bold text-blue-500 text-xl">FlowCast</span>
          <Info className="text-blue-500" />
        </div>
      </nav>

      <div className="w-full max-w-screen-lg mx-auto flex flex-col gap-4 h-full">
        {/* map */}
        <div className="p-2 bg-orange-200 border-l-4 border-orange-300 rounded-lg text-orange-600">
          <h2 className="text-lg">
            Note: Due to sensor limitations{" "}
            <span className="italic font-bold">(lack of real time data)</span>{" "}
            predictions{" "}
            <span className="italic underline font-bold">are not live.</span>
          </h2>
        </div>

        <div className="h-full w-full">
          <MapBox />
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2 flex-1">
            {/* Predicition date */}
            <div className="flex flex-col gap-2 bg-white rounded-lg p-4">
              <p>
                <span className="font-bold text-lg">
                  Select prediction date
                </span>
              </p>
              <input
                type="date"
                className="p-2 border rounded-md hover:cursor-pointer"
                min={"2020-06-14"}
                max={"2024-06-14"}
                defaultValue={inputDate}
                onChange={(e) => {
                  console.log(e.currentTarget.value)
                  setInputDate(e.currentTarget.value);
                }}
              />
              <input
                className="p-2 border rounded-md hover:cursor-pointer"
                type="time"
                step={3600}
                defaultValue={inputTime}
                onChange={(e) => {
                  console.log(e.currentTarget.value)
                  let hour = e.currentTarget.value.split(":")[0];
                  setInputTime(hour);
                }}
              />
            </div>

            {/* Station selector */}
            <div className="bg-white p-4 rounded-lg h-fit">
              <h2 className="text-lg font-bold mb-2">Station name</h2>
              {["buhi", "sipocot", "quinali", "ombao"].map((val) => {
                return (
                  <div className="flex gap-2" key={val}>
                    <input
                      type="radio"
                      id={val}
                      checked={sensor === val}
                      onChange={() => {
                        setSensor(val);
                      }}
                    />
                    <label htmlFor={val}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Model selector */}
            <div className="bg-white p-4 rounded-lg h-fit">
              <h2 className="text-lg font-bold mb-2">ML Model</h2>
              {["svr", "rfr", "lstm"].map((val) => {
                return (
                  <div className="flex gap-2" key={val}>
                    <input
                      type="radio"
                      id={val}
                      checked={model === val}
                      onChange={() => {
                        setModel(val);
                      }}
                    />
                    <label htmlFor={val}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensor information */}
          <div className="rounded-lg p-4 bg-white">
            <div className="text-xl flex justify-between">
              <span className="font-bold">
                {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
              </span>
              <span className="text-sm font-medium bg-blue-200 p-2 rounded-md text-blue-600">
                Model: {model.toUpperCase()}
              </span>
            </div>
            <div>
              <p>
                From{" "}
                <span className="font-medium">
                  {new Date(inputDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) +
                    " " +
                    new Date(
                      `${inputDate}T${inputTime}:00`
                    ).toLocaleTimeString(undefined, {hour: "numeric", hour12: true})}
                </span>
                <br />
                to the next 24 hours
              </p>
              <D3Component />
            </div>
          </div>
        </div>
      </div>

      <footer className="p-2 bg-white text-xs text-center border-t border-gray-300 text-gray-600">
        © 2025 Ateneo De Naga University
      </footer>
    </div>
  );
}
