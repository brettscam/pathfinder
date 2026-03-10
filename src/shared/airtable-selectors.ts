/**
 * Airtable selector map.
 * Claude uses the key names in responses — the content script resolves them
 * to live DOM elements by trying each CSS selector in order.
 */
export const AIRTABLE_SELECTORS: Record<string, string[]> = {
  "field-type-picker": [".fieldTypePicker", "[data-testid='field-type']"],
  "add-field-button": [".addFieldButton", "[aria-label='Add field']"],
  "view-switcher": [
    ".viewSwitcherContainer",
    "[data-testid='view-switcher']",
  ],
  "toolbar-filter": [
    "[data-testid='toolbar-filter-button']",
    ".filterButton",
  ],
  "toolbar-group": [
    "[data-testid='toolbar-group-button']",
    ".groupButton",
  ],
  "toolbar-sort": ["[data-testid='toolbar-sort-button']", ".sortButton"],
  "expand-record-button": [
    ".rowExpandButton",
    "[aria-label='Expand row']",
  ],
  "automations-trigger": [".automationTriggerConfig"],
  "interface-element-panel": [".interfaceElementPanel"],
  "share-button": [
    "[data-testid='share-button']",
    "[aria-label='Share']",
  ],
  "search-bar": [".globalSearch", "[placeholder='Search...']"],
  "new-record-button": [
    "[data-testid='add-record-button']",
    ".addRecordButton",
  ],
  // Form-specific selectors
  "form-field": [
    ".formFieldAndSubmitContainer input",
    ".formFieldAndSubmitContainer textarea",
    ".formFieldAndSubmitContainer select",
    ".formFieldAndSubmitContainer [role='combobox']",
    ".formFieldAndSubmitContainer [role='listbox']",
  ],
  "form-submit-button": [
    ".formSubmitButton",
    "button[type='submit']",
    ".formFieldAndSubmitContainer button[data-testid='submit-button']",
  ],
  "form-field-label": [
    ".formFieldLabel",
    ".formFieldAndSubmitContainer label",
  ],
  "form-attachment": [
    ".formFieldAndSubmitContainer .attachmentDropzone",
    ".formFieldAndSubmitContainer [data-testid='attachment-dropzone']",
    "input[type='file']",
  ],
  "form-select-option": [
    ".formFieldAndSubmitContainer [role='option']",
    ".formFieldAndSubmitContainer .selectOption",
  ],
};

/**
 * Resolve a selector name to a live DOM element.
 * Tries each candidate selector in order, returns the first match or null.
 */
export function resolveSelector(name: string): Element | null {
  const candidates = AIRTABLE_SELECTORS[name];
  if (!candidates) return null;

  for (const selector of candidates) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

/**
 * Resolve a selector with retries (element may not be rendered yet).
 */
export async function resolveSelectorWithRetry(
  name: string,
  retries = 5,
  delayMs = 300
): Promise<Element | null> {
  for (let i = 0; i < retries; i++) {
    const el = resolveSelector(name);
    if (el) return el;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}
