import { analysisSchema } from "./schema.js";
import { buildPrompt, modeInstructions } from "./prompts.js";

const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

export async function analyzeThought(text, mode) {
  if (!text || !text.trim()) {
    throw new Error("Please enter your thoughts before analyzing.");
  }

  if (!modeInstructions[mode]) {
    throw new Error("Invalid analysis mode.");
  }

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "YOUR_OPENROUTER_API_KEY") {
    throw new Error(
      "OpenRouter API key is not configured. Add your key in js/api.js.",
    );
  }

  const prompt = buildPrompt(text, mode);

  let response;

  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },

      body: JSON.stringify({
        model: MODEL,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.4,

        response_format: {
          type: "json_schema",

          json_schema: {
            name: "echomind_analysis",
            strict: true,
            schema: analysisSchema,
          },
        },

        provider: {
          require_parameters: true,
        },
      }),
    });
  } catch {
    throw new Error(
      "Unable to connect to the AI service. Please check your internet connection.",
    );
  }

  if (!response.ok) {
    let message = `AI request failed with status ${response.status}.`;

    try {
      const errorData = await response.json();

      if (errorData?.error?.message) {
        message = errorData.error.message;
      }
    } catch {
      // Keep default error.
    }

    throw new Error(message);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI returned an empty response.");
  }

  try {
    const parsed = JSON.parse(content);

    return parsed;
  } catch {
    throw new Error("The AI returned invalid JSON.");
  }
}
