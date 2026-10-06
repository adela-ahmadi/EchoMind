export const analysisSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    summary: {
      type: "string",
      description: "A concise summary of the user's situation.",
    },

    topics: {
      type: "array",
      items: {
        type: "string",
      },
      description: "The main topics or themes.",
    },

    priorities: {
      type: "array",
      items: {
        type: "string",
      },
      description: "The most important concerns or priorities.",
    },

    actions: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Specific practical actions.",
    },

    risks: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Potential risks or obstacles.",
    },

    decisions: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Important decisions or choices.",
    },

    insights: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Useful insights derived from the situation.",
    },
  },

  required: [
    "summary",
    "topics",
    "priorities",
    "actions",
    "risks",
    "decisions",
    "insights",
  ],
};
