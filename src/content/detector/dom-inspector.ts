import type { InterfaceTag } from "../../shared/types";

/**
 * Inspect the Airtable DOM to determine the current view type
 * and any open panels.
 */

/** Detect the active view type from DOM classes */
export function detectViewType(): InterfaceTag | null {
  if (document.querySelector(".gridView")) return "grid-view";
  if (document.querySelector(".galleryView")) return "gallery-view";
  if (document.querySelector(".calendarView")) return "calendar-view";
  if (document.querySelector(".kanbanView")) return "kanban-view";
  if (document.querySelector(".formDesigner")) return "form-view";
  return null;
}

/** Detect which panels are currently open */
export function detectOpenPanels(): InterfaceTag[] {
  const panels: InterfaceTag[] = [];

  if (
    document.querySelector(".fieldEditorPanel") ||
    document.querySelector("[data-testid='field-editor']")
  ) {
    panels.push("field-editor");
  }

  if (
    document.querySelector(".recordCardWrapper") ||
    document.querySelector(".expandedRowOverlay")
  ) {
    panels.push("record-expanded");
  }

  if (document.querySelector(".appsSidebar")) {
    // Generic apps sidebar — not a specific tag in our model
  }

  return panels;
}
