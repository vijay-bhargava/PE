const XLSX = require('xlsx');

const start = new Date('2026-04-27');
const rows = [
  { week: 1, phase: 'UX Audit', focus: 'UX audit kickoff, baseline journey mapping', ai: 'Claude: heuristic audit draft', deliverable: 'Current-state UX audit v1', exit: 'Top 10 UX pain points agreed', owner: 'UX Lead', dep: 'Stakeholder availability' },
  { week: 2, phase: 'Research Synthesis', focus: 'User interviews + analytics synthesis', ai: 'Claude: interview synthesis', deliverable: 'Persona + top-task map', exit: '5 primary workflows finalized', owner: 'UX Lead', dep: 'Interview completion' },
  { week: 3, phase: 'Information Architecture', focus: 'IA redesign (navigation, page grouping)', ai: 'Claude: IA options comparison', deliverable: 'New sitemap + nav model', exit: 'IA approved by product + tech', owner: 'UX Lead + PM', dep: 'Research outputs' },
  { week: 4, phase: 'Dashboard UX', focus: 'Dashboard UX blueprint', ai: 'Copilot: wireframe-to-component scaffolds', deliverable: 'Low-fi wireframes (Dashboard)', exit: 'Dashboard flow signed off', owner: 'UX Designer', dep: 'IA approval' },
  { week: 5, phase: 'Design System', focus: 'Design system foundation (tokens)', ai: 'Claude: token naming standards', deliverable: 'Color/type/spacing token set', exit: 'Token governance approved', owner: 'Design System Lead', dep: 'Brand inputs' },
  { week: 6, phase: 'Core Components', focus: 'Core components v1 (button/input/select/modal)', ai: 'Copilot: component boilerplate', deliverable: 'Reusable component library v1', exit: '80% visual consistency on sample screens', owner: 'Frontend Lead', dep: 'Token set' },
  { week: 7, phase: 'Data UX Patterns', focus: 'Table/filter/pagination interaction standards', ai: 'Claude: interaction spec writing', deliverable: 'Data-heavy pattern specs', exit: 'UX patterns signed by QA + UX', owner: 'UX Lead + QA', dep: 'Core components v1' },
  { week: 8, phase: 'Form UX Patterns', focus: 'Form UX standards (validation/error/success states)', ai: 'Copilot: form field patterns', deliverable: 'Form pattern kit', exit: 'Error-handling UX accepted', owner: 'UX Designer + FE', dep: 'Core components v1' },
  { week: 9, phase: 'Dashboard Build', focus: 'Dashboard high-fidelity UI + build start', ai: 'Copilot: rapid UI implementation', deliverable: 'Dashboard redesigned in code', exit: 'Design QA pass >= 90%', owner: 'Frontend Team', dep: 'Dashboard wireframes + DS' },
  { week: 10, phase: 'RFQ Redesign', focus: 'RFQ list/detail redesign', ai: 'Claude: copy + microinteraction suggestions', deliverable: 'RFQ new UI screens', exit: 'UAT sign-off for RFQ critical flow', owner: 'Frontend Team', dep: 'Pattern kit' },
  { week: 11, phase: 'RFI/Auction Redesign', focus: 'RFI and Auction list/detail redesign', ai: 'Copilot: repetitive page scaffolding', deliverable: 'RFI/Auction updated UI', exit: 'Cross-module consistency validated', owner: 'Frontend Team', dep: 'RFQ lessons applied' },
  { week: 12, phase: 'PO/NFA Redesign', focus: 'PO + NFA redesign', ai: 'Copilot: component reuse/refactor', deliverable: 'PO/NFA new UI', exit: 'Flow completion without critical UX issues', owner: 'Frontend Team', dep: 'Shared components stable' },
  { week: 13, phase: 'Admin UX', focus: 'Settings/Admin UX simplification', ai: 'Claude: IA microcopy and hierarchy tuning', deliverable: 'Admin UX refreshed', exit: 'Admin task time reduced vs baseline', owner: 'UX Lead + FE', dep: 'Core module redesigns' },
  { week: 14, phase: 'Responsive Pass', focus: 'Mobile + tablet responsiveness pass', ai: 'Copilot: responsive CSS refactors', deliverable: 'Responsive layouts complete', exit: '3 breakpoints pass QA', owner: 'Frontend Team', dep: 'Primary module completion' },
  { week: 15, phase: 'Accessibility', focus: 'Accessibility pass (WCAG AA focus)', ai: 'Claude: accessibility checklist per screen', deliverable: 'A11y fixes batch 1', exit: 'Keyboard + contrast compliance pass', owner: 'UX + QA + FE', dep: 'Responsive pass' },
  { week: 16, phase: 'Performance UX', focus: 'Performance UX pass (loading states/skeletons/lazy)', ai: 'Copilot: skeleton/loading components', deliverable: 'Perceived performance improvements', exit: 'Core pages meet load UX target', owner: 'Frontend Lead', dep: 'A11y issues triaged' },
  { week: 17, phase: 'Regression & Polish', focus: 'End-to-end UX regression + polish', ai: 'Claude: issue clustering + priority', deliverable: 'UX bug-burndown report', exit: 'No Sev-1 UX bugs open', owner: 'QA Lead + FE', dep: 'All module merges' },
  { week: 18, phase: 'Release & Adoption', focus: 'Release prep + rollout playbook', ai: 'Claude: release comms and training notes', deliverable: 'UX/UI rollout package', exit: 'Pilot release accepted', owner: 'PM + Tech Lead', dep: 'Regression sign-off' }
];

const fmt = (d) => d.toISOString().slice(0, 10);
const data = rows.map((r) => {
  const ps = new Date(start);
  ps.setDate(start.getDate() + (r.week - 1) * 7);
  const pe = new Date(ps);
  pe.setDate(ps.getDate() + 6);

  return {
    'Week': `Week ${r.week}`,
    'Phase': r.phase,
    'UX/UI Focus': r.focus,
    'Claude/Copilot Use': r.ai,
    'Deliverable': r.deliverable,
    'Exit Criteria': r.exit,
    'Owner': r.owner,
    'Dependency': r.dep,
    'Status': 'Not Started',
    'RAG': 'Green',
    'Planned Start': fmt(ps),
    'Planned End': fmt(pe),
    'Actual Start': '',
    'Actual End': '',
    'Notes': ''
  };
});

const ws = XLSX.utils.json_to_sheet(data);
ws['!cols'] = [
  { wch: 10 }, { wch: 22 }, { wch: 44 }, { wch: 40 }, { wch: 36 },
  { wch: 40 }, { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 10 },
  { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 24 }
];

const range = XLSX.utils.decode_range(ws['!ref']);
ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'UX_UI_Plan');
XLSX.writeFile(wb, 'UX_UI_Modernization_Tracker.xlsx');
console.log('created UX_UI_Modernization_Tracker.xlsx');
