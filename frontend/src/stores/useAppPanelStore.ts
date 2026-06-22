import type { AppPanelState } from "@/types/store";
import { create } from "zustand";

export const useAppPanelStore = create<AppPanelState>((set, get) => ({
  activePanel: "chat",
  contactTab: "friends",
  contactSearch: "",
  setActivePanel: (panel) => set({ activePanel: panel }),
  setContactTab: (tab) =>
    set((state) =>
      state.contactTab === tab
        ? state
        : { contactTab: tab, contactSearch: "" },
    ),
  setContactSearch: (search) => set({ contactSearch: search }),
}));
