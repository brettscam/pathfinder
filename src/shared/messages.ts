import type {
  ChatMessage,
  InterfaceState,
  SOP,
  SOPExtractionResult,
} from "./types";

/** Message types for communication between content script and service worker */
export const MSG = {
  /** Extract structured SOP from raw text */
  EXTRACT_SOP: "EXTRACT_SOP",
  /** Send a chat message to Claude */
  CHAT_MESSAGE: "CHAT_MESSAGE",
  /** Fetch Loom transcript from a share URL */
  FETCH_LOOM_TRANSCRIPT: "FETCH_LOOM_TRANSCRIPT",
} as const;

export type MessageType = (typeof MSG)[keyof typeof MSG];

/** Request: extract SOP from transcript/text */
export interface ExtractSOPRequest {
  type: typeof MSG.EXTRACT_SOP;
  payload: {
    text: string;
  };
}

/** Response: extracted SOP */
export interface ExtractSOPResponse {
  success: boolean;
  data?: SOPExtractionResult;
  error?: string;
}

/** Request: send chat message */
export interface ChatMessageRequest {
  type: typeof MSG.CHAT_MESSAGE;
  payload: {
    messages: ChatMessage[];
    sop: SOP | null;
    interfaceState: InterfaceState;
  };
}

/** Response: chat reply (non-streaming) */
export interface ChatMessageResponse {
  success: boolean;
  data?: {
    content: string;
  };
  error?: string;
}

/** Request: fetch Loom transcript */
export interface FetchLoomTranscriptRequest {
  type: typeof MSG.FETCH_LOOM_TRANSCRIPT;
  payload: {
    url: string;
  };
}

/** Response: Loom transcript text */
export interface FetchLoomTranscriptResponse {
  success: boolean;
  data?: {
    transcript: string;
  };
  error?: string;
}

export type ServiceWorkerRequest =
  | ExtractSOPRequest
  | ChatMessageRequest
  | FetchLoomTranscriptRequest;
