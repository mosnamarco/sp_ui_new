"use client";

import {useState, useEffect} from "react";
import { Info } from "lucide-react";
import dynamic from "next/dynamic";
const MapContainer = dynamic(() => import("@/components/map"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="p-2 w-full border border-b-gray-300">
        <div className="max-w-screen-lg m-auto flex justify-between items-center">
          <span className="font-bold text-blue-500 text-xl">FlowCast</span>
          <Info className="text-blue-500" />
        </div>
      </nav>

      <div className="w-full max-w-screen-lg mx-auto flex flex-col gap-4 h-full">
        {/* map */}
        <MapContainer />

        {/* info banner and hour input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="italic text-gray-400">
              In <span className="font-bold">[sensor location]</span>, sensors
              say that its...
            </p>
            <div className="p-2 bg-green-200 border-l-4 text-green-700 text-lg flex flex-col gap-2 border-green-700 rounded-lg">
              <span className="text-lg font-bold">Safe | Warning | Danger</span>
              <span className="text-md">Status info</span>
            </div>
          </div>

          <div>
            <p className="italic text-gray-400">Set prediction hours to...</p>
            <div className="flex gap-2">
              <input
                placeholder="e.g., 3"
                className="p-2 rounded-lg border border-gray-500"
              />
              <button className="rounded-lg p-2 bg-blue-300 font-bold text-white">
                Set
              </button>
            </div>
          </div>
        </div>

        {/* Sensor info */}
        <div className="overflow-w-scroll flex gap-2">
          <div>
            <div className="flex flex-col gap-2 w-[20rem]">
              <div className="text-green-700 bg-green-200 rounded-lg w-full flex flex-col p-2 gap-2">
                <div className="flex justify-between gap-2 items-center">
                  <span className="font-bold">[Sensor name]</span>
                  <span>Feb 21 8:32 PM</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg">Current water level:</span>
                  <span className="text-md">~19 Meters</span>
                </div>
              </div>

              <div className="text-green-700 bg-green-200 flex flex-col w-full border-l-4 border-green-700 rounded-lg p-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-lg">Predicted water level:</span>
                  <span className="text-md">~8 Meters</span>
                </div>
                <span className="text-center font-bold text-lg">
                  +9 Hours in 4 hours
                </span>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <footer className="p-2 text-xs text-center border-t border-gray-300 text-gray-600">
        © 2025 Ateneo De Naga University
      </footer>
    </div>
  );
}
