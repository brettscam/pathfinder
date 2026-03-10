import {
  MSG,
  type ServiceWorkerRequest,
  type ExtractSOPResponse,
  type ChatMessageResponse,
  type FetchLoomTranscriptResponse,
  type ExtractSOPRequest,
  type ChatMessageRequest,
  type FetchLoomTranscriptRequest,
} from "../shared/messages";
import { SOP_EXTRACTION_SYSTEM_PROMPT, buildChatSystemPrompt } from "../shared/prompts";
import { getApiKey } from "../shared/storage";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CHAT_MODEL = "claude-sonnet-4-20250514";
const CHAT_MAX_TOKENS = 1024;

/** Call the Anthropic Messages API */
async function callClaude(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: CHAT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text ?? "";
}

/** Call Claude with full message history for chat */
async function callClaudeChat(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: CHAT_MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text ?? "";
}

/** Handle SOP extraction request */
async function handleExtractSOP(
  req: ExtractSOPRequest
): Promise<ExtractSOPResponse> {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) return { success: false, error: "No API key configured" };

    const result = await callClaude(
      SOP_EXTRACTION_SYSTEM_PROMPT,
      req.payload.text,
      apiKey
    );
    const parsed = JSON.parse(result);
    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/** Handle chat message request */
async function handleChatMessage(
  req: ChatMessageRequest
): Promise<ChatMessageResponse> {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) return { success: false, error: "No API key configured" };

    const systemPrompt = buildChatSystemPrompt(
      req.payload.sop,
      req.payload.interfaceState
    );
    const content = await callClaudeChat(
      systemPrompt,
      req.payload.messages,
      apiKey
    );
    return { success: true, data: { content } };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/** Handle Loom transcript fetch */
async function handleFetchLoomTranscript(
  req: FetchLoomTranscriptRequest
): Promise<FetchLoomTranscriptResponse> {
  try {
    const response = await fetch(req.payload.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Loom page: ${response.status}`);
    }
    const html = await response.text();

    // Extract transcript from Loom page HTML
    // Loom embeds transcript data in a JSON blob within a script tag
    const transcriptMatch = html.match(
      /"transcript":\s*"((?:[^"\\]|\\.)*)"/
    );
    if (!transcriptMatch) {
      return {
        success: false,
        error:
          "Could not find transcript on Loom page. The video may be private or have no transcript.",
      };
    }

    const transcript = JSON.parse(`"${transcriptMatch[1]}"`);
    return { success: true, data: { transcript } };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/** Listen for messages from content scripts and popup */
chrome.runtime.onMessage.addListener(
  (
    message: ServiceWorkerRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    const handler = async () => {
      switch (message.type) {
        case MSG.EXTRACT_SOP:
          return handleExtractSOP(message);
        case MSG.CHAT_MESSAGE:
          return handleChatMessage(message);
        case MSG.FETCH_LOOM_TRANSCRIPT:
          return handleFetchLoomTranscript(message);
        default:
          return { success: false, error: "Unknown message type" };
      }
    };

    handler().then(sendResponse);
    return true; // keep message channel open for async response
  }
);

// Log service worker startup
console.log("[Pathfinder] Service worker started");
