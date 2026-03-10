import React, { useState, useRef, useEffect } from "react";
import type { SOP, InterfaceState, ChatMessage } from "../../../shared/types";
import { MSG } from "../../../shared/messages";
import ChatMessageBubble from "../components/ChatMessage";
import { showOverlay, clearOverlays } from "../../overlay";

interface ChatTabProps {
  sop: SOP | null;
  interfaceState: InterfaceState;
}

/** Parse highlight directive from end of assistant message */
function parseHighlightDirective(
  content: string
): { text: string; highlight?: { highlight: string; label: string } } {
  const match = content.match(
    /\n?\s*\{"highlight":\s*"([^"]+)",\s*"label":\s*"([^"]+)"\}\s*$/
  );
  if (!match) return { text: content };
  return {
    text: content.slice(0, match.index).trimEnd(),
    highlight: { highlight: match[1], label: match[2] },
  };
}

const ChatTab: React.FC<ChatTabProps> = ({ sop, interfaceState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Keep last 10 turns
      const historySlice = updatedMessages.slice(-10);

      const response = await chrome.runtime.sendMessage({
        type: MSG.CHAT_MESSAGE,
        payload: {
          messages: historySlice,
          sop,
          interfaceState,
        },
      });

      if (response.success && response.data) {
        const { text: displayText, highlight } = parseHighlightDirective(
          response.data.content
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: displayText },
        ]);

        // Fire overlay if highlight directive found
        if (highlight) {
          await showOverlay(highlight.highlight, highlight.label);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${response.error ?? "Unknown error"}`,
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${String(e)}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-pathfinder-text-muted text-center mt-8">
            Ask a question about {sop ? sop.title : "Airtable"}...
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="text-xs text-pathfinder-text-muted animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-pathfinder-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 text-sm border border-pathfinder-border rounded-md focus:outline-none focus:ring-2 focus:ring-pathfinder-primary"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 text-sm font-medium text-white bg-pathfinder-primary rounded-md hover:bg-pathfinder-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
