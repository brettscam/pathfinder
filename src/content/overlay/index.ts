import { resolveSelectorWithRetry } from "../../shared/airtable-selectors";

const OVERLAY_CLASS = "pathfinder-overlay-element";

/** Remove all active overlays */
export function clearOverlays(): void {
  document
    .querySelectorAll(`.${OVERLAY_CLASS}`)
    .forEach((el) => el.remove());
}

/**
 * Highlight a target element by selector name.
 * Injects a pulsing ring and tooltip label as fixed-position siblings.
 */
export async function showOverlay(
  selectorName: string,
  label: string,
  overlayColor?: string
): Promise<boolean> {
  // Clear existing overlays first
  clearOverlays();

  const target = await resolveSelectorWithRetry(selectorName);
  if (!target) return false;

  const rect = target.getBoundingClientRect();
  const padding = 4;

  // Create pulsing highlight ring
  const ring = document.createElement("div");
  ring.className = `pathfinder-highlight-ring ${OVERLAY_CLASS}`;
  if (overlayColor) {
    ring.style.setProperty("--pathfinder-overlay-color", overlayColor);
  }
  ring.style.top = `${rect.top - padding}px`;
  ring.style.left = `${rect.left - padding}px`;
  ring.style.width = `${rect.width + padding * 2}px`;
  ring.style.height = `${rect.height + padding * 2}px`;
  document.body.appendChild(ring);

  // Create tooltip above the element
  const tooltip = document.createElement("div");
  tooltip.className = `pathfinder-tooltip ${OVERLAY_CLASS}`;
  tooltip.textContent = label;
  document.body.appendChild(tooltip);

  // Position tooltip above the ring, centered
  const tooltipRect = tooltip.getBoundingClientRect();
  tooltip.style.top = `${rect.top - tooltipRect.height - 14}px`;
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;

  // If tooltip goes off-screen top, place it below instead
  if (rect.top - tooltipRect.height - 14 < 0) {
    tooltip.style.top = `${rect.bottom + 10}px`;
    tooltip.classList.add("pathfinder-tooltip--below");
  }

  return true;
}

/** Inject the overlay CSS into the page (call once) */
export function injectOverlayStyles(): void {
  if (document.getElementById("pathfinder-overlay-styles")) return;

  const style = document.createElement("style");
  style.id = "pathfinder-overlay-styles";
  style.textContent = `
    @keyframes pathfinder-pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 0.4; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    .pathfinder-highlight-ring {
      position: fixed;
      border: 3px solid var(--pathfinder-overlay-color, #6366f1);
      border-radius: 6px;
      pointer-events: none;
      z-index: 9999;
      animation: pathfinder-pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
    }
    .pathfinder-tooltip {
      position: fixed;
      background: #1e293b;
      color: #ffffff;
      font-size: 13px;
      line-height: 1.4;
      padding: 6px 12px;
      border-radius: 6px;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pathfinder-tooltip::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #1e293b;
    }
  `;
  document.head.appendChild(style);
}
