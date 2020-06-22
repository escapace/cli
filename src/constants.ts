import { SettingsVariable } from './types'

export const settingsVariable: SettingsVariable = {
  split: (value: string) => value.split(':')
}
