// app/templates/templateRegistry.js

export const TEMPLATE_IDS = {
  minimalWhite: "minimalWhite",
  stanfordChronological: "stanfordChronological",
  stanfordTechnical: "stanfordTechnical",
  stanfordBusiness: "stanfordBusiness",
  classic: "classic",
  creative: "creative",
};

const SAMPLE_PREVIEW_DATA = {
  name: "JOHN DOE",
  headline: "Senior Accountant",
  summary:
    "Detail-oriented accountant with 7+ years of experience in financial reporting, tax compliance and process improvement across mid-size and enterprise organizations.",
  contact: "john.doe@email.com\n+1 555 123 4567\nNew York, NY\nlinkedin.com/in/johndoe",
  experience:
    "Senior Accountant, Bright Ledger Consulting\n2019 – Present\n• Led monthly close for 15+ client accounts.\n• Reduced reporting errors by 23% through process audits.\n• Partnered with leadership to define quarterly KPIs.\n\nAccountant, Northstone Group\n2016 – 2019\n• Prepared financial statements and tax filings.\n• Supported annual audits and variance analysis.",
  education: "BSc Accounting – University of Example\n2012 – 2016",
  skills: "Financial analysis, Budgeting & forecasting, IFRS / GAAP, Excel & ERP tools",
  projects: "—",
  languages: "English (Native)",
  expertise: "",
  certificates: "",
  publishes: "",
  referrals: "",
};

export const templateRegistry = [
  {
    id: TEMPLATE_IDS.minimalWhite,
    name: "Minimal White",
    tag: "Clean & Modern",
    description:
      "Bright two-column layout with strong typography. Perfect for consultants and corporate roles.",
    previewData: SAMPLE_PREVIEW_DATA,
  },
  {
    id: TEMPLATE_IDS.stanfordChronological,
    name: "Chronological",
    tag: "Chronological",
    description: "Focus on correct chronological event structure.",
    previewData: SAMPLE_PREVIEW_DATA,
  },
  {
    id: TEMPLATE_IDS.stanfordTechnical,
    name: "Technical",
    tag: "Technical",
    description: "Education-first layout with strong technical skills and projects emphasis.",
    previewData: {
      ...SAMPLE_PREVIEW_DATA,
      headline: "Software Engineer",
      expertise: "Languages: JavaScript, TypeScript, Python\nFrameworks: React, Node.js\nTools: Git, Docker",
      skills: "",
    },
  },
  {
    id: TEMPLATE_IDS.stanfordBusiness,
    name: "Business",
    tag: "Business",
    description: "Education-first layout with leadership emphasis and skills/interests.",
    previewData: SAMPLE_PREVIEW_DATA,
  },

  // keep placeholders if you want them visible
  {
    id: TEMPLATE_IDS.classic,
    name: "Classic",
    tag: "Timeless",
    description: "Simple single-column layout with clear sections.",
    previewData: SAMPLE_PREVIEW_DATA,
  },
  {
    id: TEMPLATE_IDS.creative,
    name: "Creative",
    tag: "Stand-out",
    description: "More visual emphasis for creative and design roles.",
    previewData: SAMPLE_PREVIEW_DATA,
  },
];

export function getTemplateById(templateId) {
  return templateRegistry.find((t) => t.id === templateId) || null;
}
