import type { InterfaceState } from "../../shared/types";
import { parseAirtableURL } from "./url-parser";
import { detectViewType, detectOpenPanels } from "./dom-inspector";

export type StateChangeCallback = (state: InterfaceState) => void;

/**
 * Detect the current Airtable interface state by combining
 * URL parsing with DOM inspection.
 */
export function detectInterfaceState(): InterfaceState {
  const url = window.location.href;
  const parsed = parseAirtableURL(url);

  let viewType = detectViewType();

  // URL-based overrides
  if (parsed.isInterfaces) viewType = "interface-designer";
  if (parsed.isAutomations) viewType = "automations";

  return {
    baseId: parsed.baseId,
    tableId: parsed.tableId,
    viewId: parsed.viewId,
    viewType,
    openPanels: detectOpenPanels(),
    url,
  };
}

/**
 * Start observing the Airtable DOM for state changes.
 * Uses MutationObserver on document.body, debounced at 200ms.
 */
export function observeStateChanges(callback: StateChangeCallback): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastStateJson = "";

  const checkState = () => {
    const state = detectInterfaceState();
    const stateJson = JSON.stringify(state);
    if (stateJson !== lastStateJson) {
      lastStateJson = stateJson;
      callback(state);
    }
  };

  // Run initial detection
  checkState();

  // Observe DOM changes
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkState, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "data-testid"],
  });

  // Also observe URL changes (Airtable is an SPA)
  let lastUrl = window.location.href;
  const urlCheckInterval = setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      checkState();
    }
  }, 500);

  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(urlCheckInterval);
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}
