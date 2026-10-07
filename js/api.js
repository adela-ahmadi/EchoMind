import { buildPrompt } from "./prompts.js";
import { analysisJsonSchema, normalizeAnalysis } from "./schema.js";
import { OPENROUTER_API_KEY } from "./config.js";

const URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

export function hasApiKey() {
  return Boolean(OPENROUTER_API_KEY);
}

export async function analyzeThought(thought, mode) {
  const key = OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const body = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: buildPrompt(thought, mode),
      },
    ],
    temperature: 0.25,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "echomind_analysis",
        strict: true,
        schema: analysisJsonSchema(),
      },
    },
  };

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": location.origin,
      "X-Title": "EchoMind",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message || `OpenRouter request failed (${res.status})`,
    );
  }

  let content = data?.choices?.[0]?.message?.content;

  if (Array.isArray(content)) {
    content = content.map((x) => x.text || "").join("");
  }

  if (!content) {
    throw new Error("The AI returned an empty response.");
  }

  content = content
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("The AI response was not valid JSON. Please try again.");
  }

  return normalizeAnalysis(parsed, mode, thought);
}
