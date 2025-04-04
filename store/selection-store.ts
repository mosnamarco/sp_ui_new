import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectionStore {
    station: string;
    model: string;
    status: "alert" | "alarm" | "critical" | "safe", 
    setStation: (station: string) => void;
    setModel: (model: string) => void;
    setStatus: (status: "alert" | "alarm" | "critical" | "safe") => void;
}

export const useSelectionStore = create<SelectionStore>()(
    persist(
        (set) => ({
            station: '',
            model: '',
            status: 'safe',
            setStation: (station: string) => set({ station }),
            setModel: (model: string) => set({ model }),
            setStatus: (status: "alert" | "alarm" | "critical" | "safe") => set({ status })
        }),
        {
            name: 'selection-store'
        }
    )
)