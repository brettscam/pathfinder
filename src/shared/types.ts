/** Core SOP (Standard Operating Procedure) type */
export interface SOP {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  interfaceTags: InterfaceTag[];
  baseId?: string;
  steps: SOPStep[];
  loomUrl?: string;
  isActive: boolean;
}

/** Individual step within an SOP */
export interface SOPStep {
  stepNumber: number;
  title: string;
  description: string;
  targetSelector: string | null;
  interfaceState?: string;
  completed: boolean;
}

/** Valid interface tags for matching SOPs to Airtable views/panels */
export type InterfaceTag =
  | "grid-view"
  | "gallery-view"
  | "calendar-view"
  | "kanban-view"
  | "form-view"
  | "interface-designer"
  | "automations"
  | "field-editor"
  | "record-expanded"
  | "any";

/** Detected state of the current Airtable interface */
export interface InterfaceState {
  baseId: string | null;
  tableId: string | null;
  viewId: string | null;
  viewType: InterfaceTag | null;
  openPanels: InterfaceTag[];
  url: string;
}

/** Extension settings persisted in chrome.storage */
export interface PathfinderSettings {
  sidebarWidth: number;
  autoSurface: boolean;
  overlayColor: string;
}

/** Chat message in the AI conversation */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Highlight directive parsed from Claude's chat responses */
export interface HighlightDirective {
  highlight: string;
  label: string;
}

/** Claude API SOP extraction response shape */
export interface SOPExtractionResult {
  title: string;
  description: string;
  interfaceTags: InterfaceTag[];
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    targetSelector: string | null;
    interfaceState?: string;
  }>;
}

/** Chrome storage keys */
export const STORAGE_KEYS = {
  SOPS: "pathfinder_sops",
  API_KEY: "pathfinder_api_key",
  ACTIVE_SOP_ID: "pathfinder_active_sop_id",
  SETTINGS: "pathfinder_settings",
} as const;

/** Default settings */
export const DEFAULT_SETTINGS: PathfinderSettings = {
  sidebarWidth: 320,
  autoSurface: true,
  overlayColor: "#6366f1",
};
