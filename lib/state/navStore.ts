import { defaultUrl } from '@/config/nav'
import { create } from 'zustand'

interface SidebarState {
  isCollapsed: boolean
  sidebarSize: number
  setIsCollapsed: (value: boolean) => void
  setSidebarSize: (value: number) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  sidebarSize: 265,
  setIsCollapsed: (isCollapsed) => set(() => ({ isCollapsed: isCollapsed })),
  setSidebarSize: (sidebarSize) => set(() => ({ sidebarSize: sidebarSize })),
}))

interface NavState {
  lastNonSettingsPage: string
  setLastNonSettingsPage: (value: string) => void
}

export const useNavStore = create<NavState>((set) => ({
  lastNonSettingsPage: defaultUrl,
  setLastNonSettingsPage: (lastNonSettingsPage) =>
    set(() => ({ lastNonSettingsPage: lastNonSettingsPage })),
}))
