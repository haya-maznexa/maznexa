import { create } from "zustand";
import type { FilterState, DatePreset, DateRange } from "@/types";

interface FilterStore extends FilterState {
  setPreset: (preset: DatePreset) => void;
  setDateRange: (range: DateRange) => void;
  setBrands: (brands: string[]) => void;
  setPlatforms: (platforms: string[]) => void;
  setServices: (services: string[]) => void;
  setSearchQuery: (q: string) => void;
  reset: () => void;
}

const defaultState: FilterState = {
  preset: "allTime",
  dateRange: { from: null, to: null },
  brands: [],
  platforms: [],
  services: [],
  searchQuery: "",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultState,
  setPreset: (preset) => set({ preset }),
  setDateRange: (dateRange) => set({ dateRange, preset: "custom" }),
  setBrands: (brands) => set({ brands }),
  setPlatforms: (platforms) => set({ platforms }),
  setServices: (services) => set({ services }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  reset: () => set(defaultState),
}));
