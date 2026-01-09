// Settings management utilities

const SETTINGS_KEY = 'trading-buddy-settings'

export interface UserSettings {
  checklistGatekeeperEnabled: boolean
  drawdownSimulatorEnabled: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  checklistGatekeeperEnabled: true, // Enabled by default
  drawdownSimulatorEnabled: false, // Disabled by default (hidden until enabled)
}

export function getSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
  return DEFAULT_SETTINGS
}

export function updateSettings(updates: Partial<UserSettings>): UserSettings {
  try {
    const current = getSettings()
    const updated = { ...current, ...updates }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Error saving settings:', error)
    return getSettings()
  }
}

export function isChecklistGatekeeperEnabled(): boolean {
  return getSettings().checklistGatekeeperEnabled
}

export function setChecklistGatekeeperEnabled(enabled: boolean): void {
  updateSettings({ checklistGatekeeperEnabled: enabled })
}

export function isDrawdownSimulatorEnabled(): boolean {
  return getSettings().drawdownSimulatorEnabled
}

export function setDrawdownSimulatorEnabled(enabled: boolean): void {
  updateSettings({ drawdownSimulatorEnabled: enabled })
}
