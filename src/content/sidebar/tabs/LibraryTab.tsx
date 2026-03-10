import React, { useState } from "react";
import type { SOP } from "../../../shared/types";
import { saveSOPs, setActiveSOPId } from "../../../shared/storage";
import { MSG } from "../../../shared/messages";
import SOPCard from "../components/SOPCard";

interface LibraryTabProps {
  sops: SOP[];
  activeSopId: string | null;
  onRefresh: () => void;
}

const LibraryTab: React.FC<LibraryTabProps> = ({
  sops,
  activeSopId,
  onRefresh,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loomUrl, setLoomUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async (id: string) => {
    await setActiveSOPId(id);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const updated = sops.filter((s) => s.id !== id);
    await saveSOPs(updated);
    if (activeSopId === id) await setActiveSOPId(null);
    onRefresh();
  };

  const handleCreateFromText = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: MSG.EXTRACT_SOP,
        payload: { text: inputText.trim() },
      });

      if (response.success && response.data) {
        const newSop: SOP = {
          id: crypto.randomUUID(),
          title: response.data.title,
          description: response.data.description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          interfaceTags: response.data.interfaceTags,
          steps: response.data.steps.map(
            (s: { stepNumber: number; title: string; description: string; targetSelector: string | null; interfaceState?: string }) => ({
              ...s,
              completed: false,
            })
          ),
          isActive: false,
        };

        await saveSOPs([...sops, newSop]);
        setInputText("");
        setShowCreate(false);
        onRefresh();
      } else {
        setError(response.error ?? "Failed to extract SOP");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromLoom = async () => {
    if (!loomUrl.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch transcript from Loom
      const transcriptRes = await chrome.runtime.sendMessage({
        type: MSG.FETCH_LOOM_TRANSCRIPT,
        payload: { url: loomUrl.trim() },
      });

      if (!transcriptRes.success) {
        setError(
          transcriptRes.error ??
            "Could not fetch transcript. Try pasting the transcript manually."
        );
        setLoading(false);
        return;
      }

      // Extract SOP from transcript
      const sopRes = await chrome.runtime.sendMessage({
        type: MSG.EXTRACT_SOP,
        payload: { text: transcriptRes.data.transcript },
      });

      if (sopRes.success && sopRes.data) {
        const newSop: SOP = {
          id: crypto.randomUUID(),
          title: sopRes.data.title,
          description: sopRes.data.description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          interfaceTags: sopRes.data.interfaceTags,
          steps: sopRes.data.steps.map(
            (s: { stepNumber: number; title: string; description: string; targetSelector: string | null; interfaceState?: string }) => ({
              ...s,
              completed: false,
            })
          ),
          loomUrl: loomUrl.trim(),
          isActive: false,
        };

        await saveSOPs([...sops, newSop]);
        setLoomUrl("");
        setShowCreate(false);
        onRefresh();
      } else {
        setError(sopRes.error ?? "Failed to extract SOP from transcript");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">SOP Library</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-medium text-pathfinder-primary hover:text-pathfinder-primary-hover"
        >
          {showCreate ? "Cancel" : "+ New SOP"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-4 p-3 border border-pathfinder-border rounded-lg bg-pathfinder-bg">
          {/* Loom URL input */}
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">
              Loom URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={loomUrl}
                onChange={(e) => setLoomUrl(e.target.value)}
                placeholder="https://www.loom.com/share/..."
                className="flex-1 px-2 py-1.5 text-xs border border-pathfinder-border rounded"
              />
              <button
                onClick={handleCreateFromLoom}
                disabled={loading || !loomUrl.trim()}
                className="px-2 py-1.5 text-xs font-medium text-white bg-pathfinder-primary rounded disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>

          <div className="text-xs text-center text-pathfinder-text-muted mb-3">
            &mdash; or paste text directly &mdash;
          </div>

          {/* Manual text input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste SOP text, transcript, or instructions here..."
            rows={6}
            className="w-full px-2 py-1.5 text-xs border border-pathfinder-border rounded resize-y mb-2"
          />
          <button
            onClick={handleCreateFromText}
            disabled={loading || !inputText.trim()}
            className="w-full px-3 py-2 text-xs font-medium text-white bg-pathfinder-primary rounded hover:bg-pathfinder-primary-hover disabled:opacity-50"
          >
            {loading ? "Processing..." : "Create SOP"}
          </button>

          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* SOP list */}
      {sops.length === 0 ? (
        <p className="text-xs text-pathfinder-text-muted text-center mt-4">
          No SOPs yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {sops.map((sop) => (
            <SOPCard
              key={sop.id}
              sop={sop}
              isActive={sop.id === activeSopId}
              onActivate={() => handleActivate(sop.id)}
              onDelete={() => handleDelete(sop.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryTab;
