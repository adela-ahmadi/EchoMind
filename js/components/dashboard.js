import { getState } from "../state.js";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const badge = (x) => `<span class="badge ${x}">${esc(x)}</span>`;
export function renderDashboard(root, navigate) {
  const { analysis } = getState();
  if (!analysis) {
    root.innerHTML = `<div class="empty-state"><h4>No analysis yet</h4><p>Start with a thought and EchoMind will build the dashboard here.</p><button class="primary-btn" id="emptyAnalyze">Analyze a thought →</button></div>`;
    root
      .querySelector("#emptyAnalyze")
      ?.addEventListener("click", () => navigate("input"));
    return;
  }
  const topics = analysis.topics || [];
  root.innerHTML = `<div class="dashboard-header"><div><span class="eyebrow">AI ANALYSIS · ${esc(analysis.mode.toUpperCase())}</span><h2>${esc(analysis.title)}</h2><p class="muted">${esc(analysis.summary)}</p></div><div class="header-actions"><button class="secondary-btn" id="newAnalysis">New analysis</button><button class="primary-btn" id="workspaceBtn">Open actions →</button></div></div>
 <div class="dashboard-grid"><div class="custom-card mind-card"><div class="mind-map"><svg class="mind-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${topics
   .slice(0, 4)
   .map((_, i) => {
     const pts = [
       [20, 22],
       [80, 22],
       [20, 78],
       [80, 78],
     ][i];
     return `<line x1="50" y1="50" x2="${pts[0]}" y2="${pts[1]}"/>`;
   })
   .join(
     "",
   )}</svg><div class="mind-node mind-center">Main<br>thought</div>${topics
   .slice(0, 4)
   .map(
     (t, i) =>
       `<div class="mind-node topic-node topic-${i}"><strong>${esc(t.name)}</strong><small>${esc(t.detail || "Main theme")}</small></div>`,
   )
   .join("")}</div></div>
 <div class="custom-card insight-card"><div class="insight-icon">✦</div><h3>AI Insight</h3><p>${esc(analysis.insight)}</p><div class="stats-row"><div class="mini-stat"><span>Priorities</span><strong>${analysis.priorities.length}</strong></div><div class="mini-stat"><span>Risks</span><strong>${analysis.risks.length}</strong></div><div class="mini-stat"><span>Actions</span><strong>${analysis.actions.length}</strong></div><div class="mini-stat"><span>Decisions</span><strong>${analysis.decisions.length}</strong></div></div></div></div>
 <div class="analysis-sections"><div class="custom-card"><div class="section-title">Priorities</div>${analysis.priorities.length ? analysis.priorities.map((x) => `<div class="list-row"><span>${esc(x.title)}</span>${badge(x.level)}</div>`).join("") : '<div class="empty-block">None identified.</div>'}</div><div class="custom-card"><div class="section-title">Actions</div>${analysis.actions.length ? analysis.actions.map((x) => `<div class="list-row"><span>${esc(x.title)}</span>${badge(x.priority)}</div>`).join("") : '<div class="empty-block">None identified.</div>'}</div><div class="custom-card"><div class="section-title">Risks</div>${analysis.risks.length ? analysis.risks.map((x) => `<div class="list-row"><span>● ${esc(x)}</span></div>`).join("") : '<div class="empty-block">No major risks surfaced.</div>'}</div><div class="custom-card"><div class="section-title">Decisions</div>${analysis.decisions.length ? analysis.decisions.map((x) => `<div class="list-row"><span>○ ${esc(x)}</span></div>`).join("") : '<div class="empty-block">No decision point surfaced.</div>'}</div></div>`;
  root.querySelector("#newAnalysis").onclick = () => navigate("input");
  root.querySelector("#workspaceBtn").onclick = () => navigate("workspace");
}
