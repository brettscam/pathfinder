import React from "react";
import { createRoot } from "react-dom/client";
import App from "./sidebar/App";
import { detectInterfaceState, observeStateChanges } from "./detector";
import { injectOverlayStyles } from "./overlay";
import type { InterfaceState } from "../shared/types";

const CONTAINER_ID = "pathfinder-root";

/** Mount the Pathfinder sidebar inside a Shadow DOM to isolate styles */
function mount() {
  // Prevent double-mount
  if (document.getElementById(CONTAINER_ID)) return;

  // Create host element
  const host = document.createElement("div");
  host.id = CONTAINER_ID;
  host.style.cssText = "all: initial; position: fixed; top: 0; right: 0; z-index: 9998;";
  document.body.appendChild(host);

  // Attach Shadow DOM
  const shadow = host.attachShadow({ mode: "open" });

  // Inject Tailwind + sidebar styles into shadow root
  const style = document.createElement("style");
  style.textContent = getShadowStyles();
  shadow.appendChild(style);

  // Create React mount point
  const appRoot = document.createElement("div");
  appRoot.id = "pathfinder-app";
  shadow.appendChild(appRoot);

  // Inject overlay styles into the main document (overlays live outside shadow DOM)
  injectOverlayStyles();

  // Get initial state
  let currentState: InterfaceState = detectInterfaceState();

  // Mount React app
  const root = createRoot(appRoot);

  const renderApp = (state: InterfaceState) => {
    root.render(<App interfaceState={state} />);
  };

  renderApp(currentState);

  // Observe state changes and re-render
  observeStateChanges((newState) => {
    currentState = newState;
    renderApp(currentState);
  });
}

/** Inline styles for the Shadow DOM (Tailwind utilities + sidebar styles) */
function getShadowStyles(): string {
  return `
    /* Reset inside shadow */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Tailwind-like utility classes (subset used by components) */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1 1 0%; }
    .flex-shrink-0 { flex-shrink: 0; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .justify-start { justify-content: flex-start; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .flex-wrap { flex-wrap: wrap; }
    .min-w-0 { min-width: 0; }
    .w-6 { width: 1.5rem; }
    .w-full { width: 100%; }
    .h-1\\.5 { height: 0.375rem; }
    .h-6 { height: 1.5rem; }
    .h-full { height: 100%; }
    .max-w-\\[85\\%\\] { max-width: 85%; }
    .overflow-hidden { overflow: hidden; }
    .overflow-y-auto { overflow-y: auto; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .whitespace-pre-wrap { white-space: pre-wrap; }
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    .border { border-width: 1px; border-style: solid; }
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
    .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .mt-0\\.5 { margin-top: 0.125rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-1\\.5 { margin-top: 0.375rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .text-center { text-align: center; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-\\[10px\\] { font-size: 10px; line-height: 1; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .line-through { text-decoration: line-through; }
    .resize-y { resize: vertical; }
    .cursor-pointer { cursor: pointer; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    .transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
    .transition-all { transition-property: all; transition-duration: 300ms; }

    /* Color utilities */
    .text-white { color: #ffffff; }
    .text-red-500 { color: #ef4444; }
    .text-red-600 { color: #dc2626; }
    .text-gray-600 { color: #4b5563; }
    .bg-white { background: #ffffff; }
    .bg-gray-100 { background: #f3f4f6; }
    .bg-gray-200 { background: #e5e7eb; }
    .bg-indigo-50 { background: #eef2ff; }

    /* Pathfinder theme colors */
    .text-pathfinder-primary { color: #6366f1; }
    .text-pathfinder-text { color: #1e293b; }
    .text-pathfinder-text-muted { color: #64748b; }
    .bg-pathfinder-primary { background: #6366f1; }
    .bg-pathfinder-bg { background: #f8fafc; }
    .border-pathfinder-border { border-color: #e2e8f0; }
    .border-pathfinder-primary { border-color: #6366f1; }
    .hover\\:text-pathfinder-text:hover { color: #1e293b; }
    .hover\\:text-pathfinder-primary-hover:hover { color: #4f46e5; }
    .hover\\:bg-pathfinder-primary-hover:hover { background: #4f46e5; }
    .hover\\:text-red-700:hover { color: #b91c1c; }
    .disabled\\:opacity-50:disabled { opacity: 0.5; }
    .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
    .opacity-60 { opacity: 0.6; }
    .focus\\:outline-none:focus { outline: none; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px #6366f1; }
    .focus\\:ring-pathfinder-primary:focus { box-shadow: 0 0 0 2px #6366f1; }

    /* Sidebar layout */
    .pathfinder-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: #ffffff;
      border-left: 1px solid #e2e8f0;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      color: #1e293b;
      box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .pathfinder-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      font-size: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .pathfinder-toggle-btn:hover {
      background: #4f46e5;
    }

    /* Form elements */
    input, textarea {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
    }

    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      background: none;
    }
  `;
}

// Mount when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
