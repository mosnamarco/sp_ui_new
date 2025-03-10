import { create } from "zustand";

interface MapStore {
  map: mapboxgl.Map | null;
  setMap: (map: mapboxgl.Map | null) => void;
  getMap: () => mapboxgl.Map | null;
}

export const useMapStore = create<MapStore>()((set, get) => ({
  map: null,
  setMap: (map) => set({ map }),
  getMap: () => get().map,
}));
