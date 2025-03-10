import { create } from 'zustand';

type WaterLevelData = {
  waterlevels: number[];
  datetimes: string[];
};

type PredictionData = {
  forecast: WaterLevelData;
  previous: WaterLevelData;
};

interface PredictionState {
  predictionData: PredictionData | null;
  setPredictionData: (data: PredictionData) => void;
  getPredictionData: () => PredictionData | null;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictionData: null,
  setPredictionData: (data: PredictionData) => set({ predictionData: data }),
  getPredictionData: () => get().predictionData,
}));
