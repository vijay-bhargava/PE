const XLSX = require('xlsx');

const fmt = (d) => d.toISOString().slice(0, 10);
const programStart = new Date('2026-04-27');

const weeks = [
  ['Week 1','UX Audit','UX audit kickoff, baseline journey mapping','Claude: heuristic audit draft','Current-state UX audit v1','Top 10 UX pain points agreed','UX Lead','Stakeholder availability','Not Started','Green'],
  ['Week 2','Research Synthesis','User interviews + analytics synthesis','Claude: interview synthesis','Persona + top-task map','5 primary workflows finalized','UX Lead','Interview completion','Not Started','Green'],
  ['Week 3','Information Architecture','IA redesign (navigation, page grouping)','Claude: IA options comparison','New sitemap + nav model','IA approved by product + tech','UX Lead + PM','Research outputs','Not Started','Green'],
  ['Week 4','Dashboard UX','Dashboard UX blueprint','Copilot: wireframe-to-component scaffolds','Low-fi wireframes (Dashboard)','Dashboard flow signed off','UX Designer','IA approval','Not Started','Green'],
  ['Week 5','Design System','Design system foundation (tokens)','Claude: token naming standards','Color/type/spacing token set','Token governance approved','Design System Lead','Brand inputs','Not Started','Green'],
  ['Week 6','Core Components','Core components v1 (button/input/select/modal)','Copilot: component boilerplate','Reusable component library v1','80% visual consistency on sample screens','Frontend Lead','Token set','Not Started','Green'],
  ['Week 7','Data UX Patterns','Table/filter/pagination standards','Claude: interaction spec writing','Data-heavy pattern specs','UX patterns signed by QA + UX','UX Lead + QA','Core components v1','Not Started','Green'],
  ['Week 8','Form UX Patterns','Form standards (validation/error/success)','Copilot: form field patterns','Form pattern kit','Error-handling UX accepted','UX Designer + FE','Core components v1','Not Started','Green'],
  ['Week 9','Dashboard Build','Dashboard high-fidelity UI + build','Copilot: rapid UI implementation','Dashboard redesigned in code','Design QA pass >= 90%','Frontend Team','Dashboard wireframes + DS','Not Started','Green'],
  ['Week 10','RFQ Redesign','RFQ list/detail redesign','Claude: copy + microinteraction suggestions','RFQ new UI screens','UAT sign-off for RFQ critical flow','Frontend Team','Pattern kit','Not Started','Green'],
  ['Week 11','RFI/Auction Redesign','RFI and Auction redesign','Copilot: repetitive page scaffolding','RFI/Auction updated UI','Cross-module consistency validated','Frontend Team','RFQ lessons applied','Not Started','Green'],
  ['Week 12','PO/NFA Redesign','PO + NFA redesign','Copilot: component reuse/refactor','PO/NFA new UI','No critical UX issues','Frontend Team','Shared components stable','Not Started','Green'],
  ['Week 13','Admin UX','Settings/Admin UX simplification','Claude: IA microcopy and hierarchy tuning','Admin UX refreshed','Admin task time reduced vs baseline','UX Lead + FE','Core module redesigns','Not Started','Green'],
  ['Week 14','Responsive Pass','Mobile + tablet responsiveness pass','Copilot: responsive CSS refactors','Responsive layouts complete','3 breakpoints pass QA','Frontend Team','Primary module completion','Not Started','Green'],
  ['Week 15','Accessibility','Accessibility pass (WCAG AA focus)','Claude: a11y checklist per screen','A11y fixes batch 1','Keyboard + contrast compliance pass','UX + QA + FE','Responsive pass','Not Started','Green'],
  ['Week 16','Performance UX','Loading states/skeletons/lazy loading','Copilot: skeleton/loading components','Perceived performance improvements','Core pages meet load target','Frontend Lead','A11y issues triaged','Not Started','Green'],
  ['Week 17','Regression & Polish','End-to-end UX regression + polish','Claude: issue clustering + priority','UX bug-burndown report','No Sev-1 UX bugs open','QA Lead + FE','All module merges','Not Started','Green'],
  ['Week 18','Release & Adoption','Release prep + rollout playbook','Claude: release comms + training notes','UX/UI rollout package','Pilot release accepted','PM + Tech Lead','Regression sign-off','Not Started','Green']
];

const master = weeks.map((w, i) => {
  const ps = new Date(programStart);
  ps.setDate(programStart.getDate() + i * 7);
  const pe = new Date(ps);
  pe.setDate(ps.getDate() + 6);
  return {
    Week: w[0],
    Phase: w[1],
    'UX/UI Focus': w[2],
    'Claude/Copilot Use': w[3],
    Deliverable: w[4],
    'Exit Criteria': w[5],
    Owner: w[6],
    Dependency: w[7],
    Status: w[8],
    RAG: w[9],
    'Planned Start': fmt(ps),
    'Planned End': fmt(pe),
    'Actual Start': '',
    'Actual End': '',
    '% Complete': 0,
    Notes: ''
  };
});

const moduleTracker = [
  ['Dashboard','Design','Week 4','Week 4','UX Designer','Not Started','Green',0,'Wireframe + interaction spec',''],
  ['Dashboard','Build','Week 9','Week 9','Frontend Team','Not Started','Green',0,'Tokenized UI + QA snapshots',''],
  ['RFQ','Design','Week 10','Week 10','UX Designer','Not Started','Green',0,'List/detail flows approved',''],
  ['RFQ','Build','Week 10','Week 11','Frontend Team','Not Started','Green',0,'Critical flow UAT pass',''],
  ['RFI','Design','Week 11','Week 11','UX Designer','Not Started','Green',0,'Flow map approved',''],
  ['RFI','Build','Week 11','Week 12','Frontend Team','Not Started','Green',0,'Parity with RFQ interactions',''],
  ['Auctions','Design','Week 11','Week 11','UX Designer','Not Started','Green',0,'Control room states mapped',''],
  ['Auctions','Build','Week 11','Week 12','Frontend Team','Not Started','Green',0,'Live/ended state UX complete',''],
  ['PO','Design','Week 12','Week 12','UX Designer','Not Started','Green',0,'PO list/detail done',''],
  ['PO','Build','Week 12','Week 13','Frontend Team','Not Started','Green',0,'No Sev-1 regressions',''],
  ['NFA','Design','Week 12','Week 12','UX Designer','Not Started','Green',0,'Approval flow UX finalized',''],
  ['NFA','Build','Week 12','Week 13','Frontend Team','Not Started','Green',0,'Approval UX validated',''],
  ['Admin/Settings','Design','Week 13','Week 13','UX Lead','Not Started','Green',0,'Navigation simplification',''],
  ['Admin/Settings','Build','Week 13','Week 14','Frontend Team','Not Started','Green',0,'Task time reduction confirmed','']
].map(r => ({
  Module: r[0],
  Track: r[1],
  'Planned Start (Week)': r[2],
  'Planned End (Week)': r[3],
  Owner: r[4],
  Status: r[5],
  RAG: r[6],
  '% Complete': r[7],
  'Definition of Done': r[8],
  Notes: r[9]
}));

const designSystem = [
  ['Foundations','Color Tokens','Week 5','Design System Lead','Not Started','Green','Brand-approved semantic token set'],
  ['Foundations','Typography Scale','Week 5','Design System Lead','Not Started','Green','Desktop/mobile type ramp defined'],
  ['Foundations','Spacing + Grid','Week 5','Design System Lead','Not Started','Green','8pt system + layout grid'],
  ['Components','Buttons','Week 6','Frontend Lead','Not Started','Green','Primary/secondary/destructive variants'],
  ['Components','Inputs + Selects','Week 6','Frontend Lead','Not Started','Green','Validation + helper + error states'],
  ['Components','Modal + Drawer','Week 6','Frontend Lead','Not Started','Green','Focus trap + keyboard support'],
  ['Patterns','Data Table','Week 7','UX Lead + FE','Not Started','Green','Sorting/filter/paging standards'],
  ['Patterns','Filter Bar','Week 7','UX Lead + FE','Not Started','Green','Quick + advanced filters'],
  ['Patterns','Forms','Week 8','UX Lead + FE','Not Started','Green','Consistent field and submit behavior'],
  ['Accessibility','Contrast + Focus','Week 15','QA + FE','Not Started','Green','WCAG AA conformance'],
  ['Performance','Skeleton States','Week 16','Frontend Lead','Not Started','Green','Consistent loading states']
].map(r => ({
  Layer: r[0],
  Item: r[1],
  'Target Week': r[2],
  Owner: r[3],
  Status: r[4],
  RAG: r[5],
  'Acceptance Criteria': r[6],
  Notes: ''
}));

const sprintTracker = Array.from({ length: 9 }).map((_, i) => {
  const sprint = i + 1;
  const start = new Date(programStart);
  start.setDate(programStart.getDate() + i * 14);
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  return {
    Sprint: `Sprint ${sprint}`,
    'Start Date': fmt(start),
    'End Date': fmt(end),
    Theme: '',
    'Committed Stories': 0,
    'Completed Stories': 0,
    'Spillover Stories': 0,
    'UX Defects Found': 0,
    'UX Defects Closed': 0,
    Velocity: '',
    RAG: 'Green',
    Notes: ''
  };
});

const raidRisks = [
  ['R-01','Risk','Design system adoption resistance','Medium','High','Tech Lead','Open','Weekly standards review + PR checklist'],
  ['R-02','Risk','Parallel business changes cause rework','High','Medium','PM','Open','Feature freeze window per module'],
  ['R-03','Risk','AI-generated inconsistencies','Medium','High','Frontend Lead','Open','Mandatory human review + snapshot checks'],
  ['I-01','Issue','None logged','','','', 'Open',''],
  ['A-01','Assumption','Dedicated UX reviewer available every sprint','','','PM','Open','Backfill with backup reviewer'],
  ['D-01','Dependency','Backend API contracts stable for module rollout','','','Backend Lead','Open','Weekly API sync']
].map(r => ({
  ID: r[0],
  Type: r[1],
  Description: r[2],
  Probability: r[3],
  Impact: r[4],
  Owner: r[5],
  Status: r[6],
  'Mitigation / Next Action': r[7],
  'Target Date': '',
  Notes: ''
}));

const kpis = [
  ['Design QA Pass Rate (%)',90,'', 'Weekly','UX Lead'],
  ['Task Completion Rate (%)',85,'', 'Bi-weekly','Product Analyst'],
  ['Critical UX Bugs (count)',0,'', 'Weekly','QA Lead'],
  ['Accessibility Score (AA checks)',95,'', 'Sprint-end','QA Lead'],
  ['Core Page LCP (sec)',2.5,'', 'Sprint-end','Frontend Lead'],
  ['User Satisfaction (CSAT)',4.3,'', 'Monthly','PM']
].map(r => ({
  KPI: r[0],
  Target: r[1],
  Baseline: r[2],
  'Current Value': '',
  Frequency: r[3],
  Owner: r[4],
  Trend: '',
  RAG: 'Green',
  Notes: ''
}));

const aiTracker = [
  ['Week 1','Audit summary prompt pack','Claude','UX Lead','Planned',''],
  ['Week 4','Dashboard wireframe scaffolds','Copilot','Frontend Team','Planned',''],
  ['Week 7','Table/filter interaction spec','Claude','UX Lead','Planned',''],
  ['Week 9','Dashboard component generation','Copilot','Frontend Team','Planned',''],
  ['Week 15','Accessibility issue clustering','Claude','QA + FE','Planned','']
].map(r => ({
  Week: r[0],
  'AI Task': r[1],
  Tool: r[2],
  Owner: r[3],
  Status: r[4],
  'Review Outcome': r[5],
  'Human Reviewer': '',
  'Merged (Y/N)': '',
  Notes: ''
}));

const wb = XLSX.utils.book_new();

function addSheet(name, data, cols) {
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = cols;
  const range = XLSX.utils.decode_range(ws['!ref']);
  ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
  XLSX.utils.book_append_sheet(wb, ws, name);
}

addSheet('Master_Plan', master, [
  { wch: 10 }, { wch: 22 }, { wch: 40 }, { wch: 38 }, { wch: 34 },
  { wch: 38 }, { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 10 },
  { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 26 }
]);

addSheet('Module_Tracker', moduleTracker, [
  { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
  { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 40 }, { wch: 24 }
]);

addSheet('Design_System', designSystem, [
  { wch: 16 }, { wch: 24 }, { wch: 12 }, { wch: 20 }, { wch: 14 },
  { wch: 10 }, { wch: 50 }, { wch: 24 }
]);

addSheet('Sprint_Tracker', sprintTracker, [
  { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 24 }, { wch: 18 },
  { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 10 },
  { wch: 10 }, { wch: 24 }
]);

addSheet('RAID_Log', raidRisks, [
  { wch: 8 }, { wch: 12 }, { wch: 48 }, { wch: 12 }, { wch: 12 },
  { wch: 18 }, { wch: 12 }, { wch: 44 }, { wch: 14 }, { wch: 24 }
]);

addSheet('KPI_Tracker', kpis, [
  { wch: 32 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 24 }
]);

addSheet('AI_Usage_Tracker', aiTracker, [
  { wch: 10 }, { wch: 34 }, { wch: 10 }, { wch: 18 }, { wch: 12 },
  { wch: 24 }, { wch: 18 }, { wch: 12 }, { wch: 24 }
]);

XLSX.writeFile(wb, 'UX_UI_Full_Program_Tracker.xlsx');
console.log('created UX_UI_Full_Program_Tracker.xlsx');
