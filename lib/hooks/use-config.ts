import { Style } from '@/registry/styles'
import { Theme } from '@/registry/themes'
import { create } from 'zustand'

type Config = {
  style: Style['name']
  theme: Theme['name']
  radius: number
}

type ConfigState = {
  config: Config
  setConfig: (config: Config) => void
}

const useConfigStore = create<ConfigState>((set) => ({
  config: {
    style: 'default',
    theme: 'zinc',
    radius: 0.5,
  },
  setConfig: (config) => set({ config }),
}))

export function useConfig() {
  const { config, setConfig } = useConfigStore()
  return [config, setConfig] as const
}
