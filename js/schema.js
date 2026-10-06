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
      description: "The main topics or themes identified in the user's input.",
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
      description: "Specific practical actions the user can take.",
    },

    risks: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Potential risks, obstacles, or concerns.",
    },

    decisions: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Important decisions or choices identified from the input.",
    },

    insights: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Useful insights derived from the user's situation.",
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
