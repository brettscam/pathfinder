import React from "react";
import type { ChatMessage } from "../../../shared/types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-pathfinder-primary text-white"
            : "bg-pathfinder-bg text-pathfinder-text border border-pathfinder-border"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
