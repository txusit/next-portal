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

interface TestState {
  val: number
  increaseVal: () => void
}
export const useTestStore = create<TestState>((set) => ({
  val: 0,
  increaseVal: () => set((state) => ({ val: state.val + 1 })),
}))
