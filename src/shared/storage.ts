import type { SOP, PathfinderSettings } from "./types";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./types";

/** Read all SOPs from storage */
export async function getSOPs(): Promise<SOP[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SOPS);
  return result[STORAGE_KEYS.SOPS] ?? [];
}

/** Save SOPs array to storage */
export async function saveSOPs(sops: SOP[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SOPS]: sops });
}

/** Get the Anthropic API key */
export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.API_KEY);
  return result[STORAGE_KEYS.API_KEY] ?? null;
}

/** Save the Anthropic API key */
export async function saveApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: key });
}

/** Get the active SOP ID */
export async function getActiveSOPId(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SOP_ID);
  return result[STORAGE_KEYS.ACTIVE_SOP_ID] ?? null;
}

/** Set the active SOP ID */
export async function setActiveSOPId(id: string | null): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SOP_ID]: id });
}

/** Get extension settings */
export async function getSettings(): Promise<PathfinderSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] ?? {}) };
}

/** Save extension settings */
export async function saveSettings(
  settings: Partial<PathfinderSettings>
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...settings },
  });
}
