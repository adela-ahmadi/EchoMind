const STORAGE_KEY = "echomind_state";

const initialState = {
  analysis: null,
  actions: [],
  history: [],
  status: "idle",
  error: null,
};

let state = loadState();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { ...initialState };
    }

    const parsed = JSON.parse(stored);

    return {
      ...initialState,
      ...parsed,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (error) {
    console.error("Failed to load EchoMind state:", error);

    return { ...initialState };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save EchoMind state:", error);
  }
}

export function getState() {
  return {
    ...state,
    actions: [...state.actions],
    history: [...state.history],
  };
}

export function setLoading() {
  state = {
    ...state,
    status: "loading",
    error: null,
  };

  saveState();

  return getState();
}

export function setAnalysis(analysis, mode) {
  const normalizedAnalysis = {
    ...analysis,
    mode,
  };

  state = {
    ...state,
    analysis: normalizedAnalysis,
    status: "success",
    error: null,
  };

  saveState();

  return getState();
}

export function setError(error) {
  state = {
    ...state,
    status: "error",
    error: error instanceof Error ? error.message : String(error),
  };

  saveState();

  return getState();
}

export function addHistoryItem(analysis, mode, thought) {
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    mode,
    thought,
    analysis,
  };

  state = {
    ...state,
    history: [item, ...state.history],
  };

  saveState();

  return item;
}

export function deleteHistoryItem(historyId) {
  state = {
    ...state,
    history: state.history.filter((item) => item.id !== historyId),
  };

  saveState();

  return getState();
}

export function clearHistory() {
  state = {
    ...state,
    history: [],
  };

  saveState();

  return getState();
}

export function addAction(action) {
  const newAction = {
    id: action.id ?? crypto.randomUUID(),
    title: action.title,
    priority: action.priority ?? "medium",
    status: action.status ?? "todo",
    createdAt: action.createdAt ?? new Date().toISOString(),
  };

  state = {
    ...state,
    actions: [newAction, ...state.actions],
  };

  saveState();

  return newAction;
}

export function updateAction(actionId, updates) {
  state = {
    ...state,

    actions: state.actions.map((action) =>
      action.id === actionId
        ? {
            ...action,
            ...updates,
          }
        : action,
    ),
  };

  saveState();

  return getState();
}

export function deleteAction(actionId) {
  state = {
    ...state,

    actions: state.actions.filter((action) => action.id !== actionId),
  };

  saveState();

  return getState();
}
