export type Domain = {
  id: string;
  name: string;
  color: string;
  skills: Skill[];
};

export type Skill = {
  id: string;
  name: string;
  domainId: string;
};

export const DREYFUS_LEVELS = [
  { level: 1, label: "Novice", description: "Following instructions in familiar contexts" },
  { level: 2, label: "Advanced Beginner", description: "Applying in new situations with some guidance" },
  { level: 3, label: "Competent", description: "Making deliberate choices about when and how" },
  { level: 4, label: "Proficient", description: "Seeing the whole picture, adapting fluidly" },
  { level: 5, label: "Expert", description: "Intuitive — can teach it and push its boundaries" },
] as const;

export const DOMAINS: Domain[] = [
  {
    id: "earth-systems",
    name: "Regenerative Thinking & Earth Systems",
    color: "#065F46",
    skills: [
      { id: "systems-thinking", name: "Systems Thinking", domainId: "earth-systems" },
      { id: "earth-systems-science", name: "Earth Systems & Ecological Science", domainId: "earth-systems" },
      { id: "futures-literacy", name: "Futures Literacy", domainId: "earth-systems" },
      { id: "place-based-inquiry", name: "Place-Based & Relational Inquiry", domainId: "earth-systems" },
    ],
  },
  {
    id: "design",
    name: "Design & Material Futures",
    color: "#1D4ED8",
    skills: [
      { id: "circular-design", name: "Circular Design", domainId: "design" },
      { id: "participatory-design", name: "Participatory Design", domainId: "design" },
      { id: "biomimicry", name: "Biomimicry & Living Systems Design", domainId: "design" },
    ],
  },
  {
    id: "creative",
    name: "Creative & Speculative Practice",
    color: "#7C3AED",
    skills: [
      { id: "speculative-futures-design", name: "Speculative & Futures Design", domainId: "creative" },
      { id: "speculative-storytelling", name: "Speculative Storytelling & Narrative", domainId: "creative" },
    ],
  },
  {
    id: "economics",
    name: "Economics, Finance & Law",
    color: "#B45309",
    skills: [
      { id: "regenerative-economics", name: "Regenerative Economics", domainId: "economics" },
      { id: "green-finance", name: "Green Finance & Impact Investing", domainId: "economics" },
      { id: "wellbeing-economics", name: "Wellbeing & Post-Growth Economics", domainId: "economics" },
      { id: "environmental-law", name: "Environmental & Regulatory Law", domainId: "economics" },
    ],
  },
  {
    id: "governance",
    name: "Participatory Governance & Policy",
    color: "#000054",
    skills: [
      { id: "policy-design", name: "Policy & Institutional Design", domainId: "governance" },
      { id: "facilitation", name: "Multi-Stakeholder Facilitation", domainId: "governance" },
      { id: "deliberative-democracy", name: "Deliberative Democracy", domainId: "governance" },
    ],
  },
  {
    id: "indigenous",
    name: "Indigenous Knowledges, Relational Ethics & Social Equity",
    color: "#9F1239",
    skills: [
      { id: "indigenous-knowledge", name: "Indigenous Knowledge Systems & Sovereignty", domainId: "indigenous" },
      { id: "relational-ethics", name: "Relational Ethics & Positionality", domainId: "indigenous" },
      { id: "social-equity", name: "Social Equity & Community Development", domainId: "indigenous" },
      { id: "collaborative-inquiry", name: "Collaborative Inquiry & Co-Research", domainId: "indigenous" },
    ],
  },
  {
    id: "technology",
    name: "Technology, AI & Digital Futures",
    color: "#0369A1",
    skills: [
      { id: "responsible-ai", name: "Responsible AI Governance", domainId: "technology" },
      { id: "data-governance", name: "Data Governance", domainId: "technology" },
      { id: "digital-democracy", name: "Digital Democracy & Civic Technology", domainId: "technology" },
    ],
  },
  {
    id: "leadership",
    name: "Leadership & Organisation",
    color: "#374151",
    skills: [
      { id: "adaptive-leadership", name: "Adaptive Leadership", domainId: "leadership" },
      { id: "regenerative-org-design", name: "Regenerative Organisation Design", domainId: "leadership" },
      { id: "change-management", name: "Change & Transition Management", domainId: "leadership" },
    ],
  },
];

export const ALL_SKILLS = DOMAINS.flatMap((d) => d.skills);

export function getDomain(domainId: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === domainId);
}

export function getSkill(skillId: string): Skill | undefined {
  return ALL_SKILLS.find((s) => s.id === skillId);
}
