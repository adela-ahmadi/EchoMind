const modes = ["understand", "organize", "decide"];
const levels = ["high", "medium", "low"];
const arr = (value) => (Array.isArray(value) ? value : []);
const str = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;
const level = (v) =>
  levels.includes(String(v).toLowerCase()) ? String(v).toLowerCase() : "medium";
export function normalizeAnalysis(raw, mode, thought) {
  const x = raw && typeof raw === "object" ? raw : {};
  return {
    id: crypto.randomUUID(),
    mode: modes.includes(mode) ? mode : "understand",
    title: str(x.title, "Thought analysis"),
    summary: str(
      x.summary,
      "EchoMind analyzed the thought and identified the main themes.",
    ),
    insight: str(
      x.insight,
      "The analysis highlights the areas that deserve your attention.",
    ),
    topics: arr(x.topics)
      .slice(0, 6)
      .map((t, i) => ({
        name: str(t?.name, `Theme ${i + 1}`),
        detail: str(t?.detail, "Relevant theme"),
        priority: level(t?.priority),
      })),
    priorities: arr(x.priorities)
      .slice(0, 6)
      .map((p) => ({
        title: str(p?.title, "Priority"),
        level: level(p?.level),
      })),
    actions: arr(x.actions)
      .slice(0, 8)
      .map((a, i) => ({
        sourceActionId: `${Date.now()}-${i}-${str(a?.title, "action")}`,
        title: str(a?.title, "Next step"),
        priority: level(a?.priority),
      })),
    risks: arr(x.risks)
      .slice(0, 6)
      .map((r) => str(r)),
    decisions: arr(x.decisions)
      .slice(0, 6)
      .map((d) => str(d)),
    options: arr(x.options)
      .slice(0, 6)
      .map((o) => ({
        name: str(o?.name, "Option"),
        pros: arr(o?.pros).map(str),
        cons: arr(o?.cons).map(str),
      })),
    thought: str(thought),
  };
}
export function analysisJsonSchema() {
  return {
    type: "object",
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      insight: { type: "string" },
      topics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            detail: { type: "string" },
            priority: { type: "string", enum: levels },
          },
          required: ["name", "detail", "priority"],
          additionalProperties: false,
        },
      },
      priorities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            level: { type: "string", enum: levels },
          },
          required: ["title", "level"],
          additionalProperties: false,
        },
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            priority: { type: "string", enum: levels },
          },
          required: ["title", "priority"],
          additionalProperties: false,
        },
      },
      risks: { type: "array", items: { type: "string" } },
      decisions: { type: "array", items: { type: "string" } },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } },
          },
          required: ["name", "pros", "cons"],
          additionalProperties: false,
        },
      },
    },
    required: [
      "title",
      "summary",
      "insight",
      "topics",
      "priorities",
      "actions",
      "risks",
      "decisions",
      "options",
    ],
    additionalProperties: false,
  };
}
