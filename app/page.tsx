"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import MapBox from "@/components/mapbox";
import D3Component from "@/components/d3chart";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [sensor, setSensor] = useState("buhi");

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        <div>
          <h2 className="text-lg font-bold">Due to sensor limitations <span className="italic">(lack of real time data)</span> predictions are not live.</h2>
          <h2>Current selected date is: 2024</h2>
        </div>

        <div className="h-full w-full">
          <MapBox />
        </div>

        {/* info banner and hour input */}
        <div className="flex gap-2 justify-between">
          {/* Model selector */}
          <div className="bg-white p-4 rounded-lg h-fit">
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

          <div className="flex flex-col gap-2">
            <label htmlFor="datetime-for-model">Select prediction date</label>
            <input id="datetime-for-model" className="p-2 bg-white rounded-md" type="datetime-local" />
          </div>

          {/* Sensor information */}
          <div className="rounded-lg p-4 bg-white">
            <h2 className="text-xl">
              Location:{" "}
              <span className="font-bold">
                {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
              </span>
            </h2>
            <div>
              <p>From [selected date and hour] to [selected date and hour + 24 hours]</p>
              <D3Component />
            </div>
          </div>

        </div>
      </div>

      <footer className="p-2 text-xs text-center border-t border-gray-300 text-gray-600">
        © 2025 Ateneo De Naga University
      </footer>
    </div>
  );
}
