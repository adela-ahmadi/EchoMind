const STORAGE_KEY = "echomind_state_v2";

const initialState = {
  analysis: null,
  actions: [],
  history: [],
};

let state = loadState();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return structuredClone(initialState);
    }

    const parsed = JSON.parse(stored);

    return {
      ...structuredClone(initialState),
      ...parsed,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (error) {
    console.error("Failed to load EchoMind state:", error);
    return structuredClone(initialState);
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save EchoMind state:", error);
  }
}

export function getState() {
  return structuredClone(state);
}

export function setAnalysis(analysis) {
  state.analysis = analysis;

  const historyItem = {
    ...analysis,
    id: analysis.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  state.history = [historyItem, ...state.history].slice(0, 100);

  persist();
  return getState();
}

export function addActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return getState();
  }

  const existingSourceIds = new Set(
    state.actions.map((action) => action.sourceActionId).filter(Boolean),
  );

  const nextActions = actions
    .filter((action) => {
      if (!action) return false;
      if (!action.sourceActionId) return true;
      return !existingSourceIds.has(action.sourceActionId);
    })
    .map((action) => ({
      id: action.id || crypto.randomUUID(),
      createdAt: action.createdAt || new Date().toISOString(),
      status: action.status || "todo",
      ...action,
    }));

  if (!nextActions.length) {
    return getState();
  }

  state.actions = [...nextActions, ...state.actions];
  persist();

  return getState();
}

export function addAction(action) {
  const newAction = {
    id: action.id || crypto.randomUUID(),
    createdAt: action.createdAt || new Date().toISOString(),
    status: action.status || "todo",
    ...action,
  };

  state.actions = [newAction, ...state.actions];
  persist();

  return newAction;
}

export function updateAction(id, updates) {
  state.actions = state.actions.map((action) =>
    action.id === id
      ? {
          ...action,
          ...updates,
        }
      : action,
  );

  persist();
  return getState();
}

export function deleteAction(id) {
  state.actions = state.actions.filter((action) => action.id !== id);
  persist();
  return getState();
}

export function deleteHistory(id) {
  state.history = state.history.filter((item) => item.id !== id);
  persist();
  return getState();
}

export function clearHistory() {
  state.history = [];
  persist();
  return getState();
}

export function clearAll() {
  state = structuredClone(initialState);
  persist();
  return getState();
}
