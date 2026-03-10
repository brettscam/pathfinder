import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getApiKey, saveApiKey, getSOPs } from "../shared/storage";
import type { SOP } from "../shared/types";

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [sops, setSops] = useState<SOP[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const key = await getApiKey();
    setSavedKey(key);
    if (key) setApiKey(key);

    const allSops = await getSOPs();
    setSops(allSops);
  };

  const handleSaveKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    await saveApiKey(trimmed);
    setSavedKey(trimmed);
    setStatus("API key saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1e293b",
          marginBottom: 12,
        }}
      >
        Pathfinder
      </h1>

      {/* API Key Section */}
      <section style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 500,
            color: "#64748b",
            marginBottom: 4,
          }}
        >
          Anthropic API Key
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{
              flex: 1,
              padding: "6px 10px",
              fontSize: 13,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              outline: "none",
            }}
          />
          <button
            onClick={handleSaveKey}
            style={{
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              background: "#6366f1",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
        {status && (
          <p style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>
            {status}
          </p>
        )}
        {savedKey && !status && (
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            Key configured
          </p>
        )}
      </section>

      {/* SOP Library Summary */}
      <section>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: 8,
          }}
        >
          SOP Library ({sops.length})
        </h2>
        {sops.length === 0 ? (
          <p style={{ fontSize: 12, color: "#64748b" }}>
            No SOPs yet. Open an Airtable tab to create one.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sops.slice(0, 5).map((sop) => (
              <li
                key={sop.id}
                style={{
                  padding: "6px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: 12,
                }}
              >
                <strong>{sop.title}</strong>
                <span style={{ color: "#64748b", marginLeft: 6 }}>
                  ({sop.steps.length} steps)
                </span>
              </li>
            ))}
            {sops.length > 5 && (
              <li style={{ fontSize: 11, color: "#64748b", paddingTop: 4 }}>
                +{sops.length - 5} more...
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Footer */}
      <p
        style={{
          fontSize: 10,
          color: "#94a3b8",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Navigate to airtable.com to use Pathfinder
      </p>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
