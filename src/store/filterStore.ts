import { create } from "zustand";
import type { FilterState } from "@/types";

interface FilterStore extends FilterState {
  setMonths: (months: string[]) => void;
  setBrands: (brands: string[]) => void;
  setPlatforms: (platforms: string[]) => void;
  setServices: (services: string[]) => void;
  setSearchQuery: (q: string) => void;
  reset: () => void;
}

const defaultState: FilterState = {
  months: [],
  brands: [],
  platforms: [],
  services: [],
  searchQuery: "",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultState,
  setMonths: (months) => set({ months }),
  setBrands: (brands) => set({ brands }),
  setPlatforms: (platforms) => set({ platforms }),
  setServices: (services) => set({ services }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  reset: () => set(defaultState),
}));
