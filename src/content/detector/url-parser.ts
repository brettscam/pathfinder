/**
 * Extract Airtable IDs from the current URL.
 * Base IDs start with "app", table IDs with "tbl", view IDs with "viw".
 */
export interface ParsedAirtableURL {
  baseId: string | null;
  tableId: string | null;
  viewId: string | null;
  isInterfaces: boolean;
  isAutomations: boolean;
}

export function parseAirtableURL(url: string): ParsedAirtableURL {
  const result: ParsedAirtableURL = {
    baseId: null,
    tableId: null,
    viewId: null,
    isInterfaces: false,
    isAutomations: false,
  };

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);

    for (const seg of segments) {
      if (seg.startsWith("app") && !result.baseId) {
        result.baseId = seg;
      } else if (seg.startsWith("tbl") && !result.tableId) {
        result.tableId = seg;
      } else if (seg.startsWith("viw") && !result.viewId) {
        result.viewId = seg;
      }
    }

    result.isInterfaces = parsed.pathname.includes("/interfaces/");
    result.isAutomations = parsed.pathname.includes("/automations/");
  } catch {
    // Invalid URL — return defaults
  }

  return result;
}
