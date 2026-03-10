import React, { useState, useEffect } from "react";
import type { InterfaceState, SOP } from "../../shared/types";
import { getSOPs, getActiveSOPId } from "../../shared/storage";
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
            <GuideTab sop={activeSop} interfaceState={interfaceState} />
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
