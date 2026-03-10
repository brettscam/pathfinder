import React, { useState, useEffect, useCallback, useRef } from "react";
import type { InterfaceState, SOP } from "../../shared/types";
import { getSOPs, getActiveSOPId, saveSOPs } from "../../shared/storage";
import { resolveSelector } from "../../shared/airtable-selectors";
import { clearOverlays, showOverlay } from "../overlay";
import GuideTab from "./tabs/GuideTab";
import ChatTab from "./tabs/ChatTab";
import LibraryTab from "./tabs/LibraryTab";

type Tab = "guide" | "chat" | "library";

interface AppProps {
  interfaceState: InterfaceState;
}

const App: React.FC<AppProps> = ({ interfaceState }) => {
  const [activeTab, setActiveTab] = useState<Tab>("guide");
  const [collapsed, setCollapsed] = useState(false);
  const [activeSop, setActiveSop] = useState<SOP | null>(null);
  const [sops, setSops] = useState<SOP[]>([]);
  const activeSopRef = useRef<SOP | null>(null);

  // Keep ref in sync for click handler
  useEffect(() => {
    activeSopRef.current = activeSop;
  }, [activeSop]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allSops = await getSOPs();
    setSops(allSops);
    const activeId = await getActiveSOPId();
    if (activeId) {
      setActiveSop(allSops.find((s) => s.id === activeId) ?? null);
    }
  };

  const handleToggleStep = useCallback(async (stepNumber: number) => {
    const sop = activeSopRef.current;
    if (!sop) return;
    const updatedSteps = sop.steps.map((s) =>
      s.stepNumber === stepNumber ? { ...s, completed: !s.completed } : s
    );
    const updatedSop = { ...sop, steps: updatedSteps, updatedAt: Date.now() };
    setActiveSop(updatedSop);
    setSops((prev) => {
      const updated = prev.map((s) => (s.id === updatedSop.id ? updatedSop : s));
      saveSOPs(updated);
      return updated;
    });
  }, []);

  const completeStep = useCallback(async (stepNumber: number) => {
    const sop = activeSopRef.current;
    if (!sop) return;
    const step = sop.steps.find((s) => s.stepNumber === stepNumber);
    if (!step || step.completed) return;
    const updatedSteps = sop.steps.map((s) =>
      s.stepNumber === stepNumber ? { ...s, completed: true } : s
    );
    const updatedSop = { ...sop, steps: updatedSteps, updatedAt: Date.now() };
    setActiveSop(updatedSop);
    setSops((prev) => {
      const updated = prev.map((s) => (s.id === updatedSop.id ? updatedSop : s));
      saveSOPs(updated);
      return updated;
    });

    // Auto-highlight the next incomplete step
    const nextStep = updatedSteps.find((s) => !s.completed);
    if (nextStep?.targetSelector) {
      setTimeout(() => {
        showOverlay(nextStep.targetSelector!, `Step ${nextStep.stepNumber}: ${nextStep.title}`);
      }, 500);
    } else {
      clearOverlays();
    }
  }, []);

  // Click detection for auto-completion
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const sop = activeSopRef.current;
      if (!sop) return;

      const currentStep = sop.steps.find((s) => !s.completed);
      if (!currentStep?.targetSelector) return;

      const targetEl = resolveSelector(currentStep.targetSelector);
      if (!targetEl) return;

      const clickedEl = e.target as Element;

      // Check if the user clicked on or within the target element
      if (targetEl.contains(clickedEl) || clickedEl.contains(targetEl) || targetEl === clickedEl) {
        completeStep(currentStep.stepNumber);
      }
    };

    // Listen on the document with capture to catch clicks before Airtable handlers
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [completeStep]);

  // Also watch for DOM changes that indicate step completion (e.g., form field populated)
  useEffect(() => {
    const sop = activeSopRef.current;
    if (!sop) return;

    const currentStep = sop.steps.find((s) => !s.completed);
    if (!currentStep?.targetSelector) return;

    // Watch for input/change events on the target element
    const targetEl = resolveSelector(currentStep.targetSelector);
    if (!targetEl) return;

    const handleInput = () => {
      // Small delay to let the value settle
      setTimeout(() => {
        completeStep(currentStep.stepNumber);
      }, 300);
    };

    targetEl.addEventListener("input", handleInput);
    targetEl.addEventListener("change", handleInput);

    return () => {
      targetEl.removeEventListener("input", handleInput);
      targetEl.removeEventListener("change", handleInput);
    };
  }, [activeSop, completeStep]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "guide", label: "Guide" },
    { key: "chat", label: "Chat" },
    { key: "library", label: "Library" },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        className="pathfinder-toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Open Pathfinder" : "Close Pathfinder"}
      >
        {collapsed ? "P" : "\u00D7"}
      </button>

      {/* Sidebar panel */}
      <div
        className={`pathfinder-sidebar ${collapsed ? "collapsed" : ""}`}
        style={{ display: collapsed ? "none" : "flex" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-pathfinder-border bg-pathfinder-bg">
          <h1 className="text-base font-semibold text-pathfinder-text">
            Pathfinder
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-pathfinder-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${
                activeTab === tab.key
                  ? "text-pathfinder-primary border-b-2 border-pathfinder-primary"
                  : "text-pathfinder-text-muted hover:text-pathfinder-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "guide" && (
            <GuideTab sop={activeSop} interfaceState={interfaceState} onToggleStep={handleToggleStep} />
          )}
          {activeTab === "chat" && (
            <ChatTab sop={activeSop} interfaceState={interfaceState} />
          )}
          {activeTab === "library" && (
            <LibraryTab
              sops={sops}
              activeSopId={activeSop?.id ?? null}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default App;
