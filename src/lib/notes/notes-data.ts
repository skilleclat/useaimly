import { FinancialNote } from "@/lib/types/notes";

export const INITIAL_DEMO_NOTES: FinancialNote[] = [
  {
    id: "note-demo-1",
    title: "Emergency Reserve Floor Shield",
    category: "RULES_CONSTRAINTS",
    isPinned: true,
    content:
      "Rule of Thumb: Always preserve at least 50,000 KES locked in liquid reserves. Never execute any luxury or discretionary purchase above 25,000 KES if it dips liquid buffer below 2.0 months of living expenses.",
    tags: ["Safety", "Buffer", "Rule"],
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-15T14:30:00Z",
  },
  {
    id: "note-demo-2",
    title: "Q4 Studio Tech & Workstation Upgrade",
    category: "UPCOMING_EXPENSES",
    isPinned: true,
    content:
      "Planning to upgrade workspace setup around November 2026 (~150,000 KES). Prefer funding this entirely from monthly Net Free Cash Flow over 3 months without taking debt.",
    tags: ["Equipment", "Q4", "Tech"],
    createdAt: "2026-08-05T11:20:00Z",
    updatedAt: "2026-08-18T09:15:00Z",
  },
  {
    id: "note-demo-3",
    title: "Business Goal Capital Preservation Directive",
    category: "GOAL_STRATEGY",
    isPinned: false,
    content:
      "If monthly free cash flow drops below 40,000 KES, automatically defer secondary leisure spending and maintain 45,000 KES/month allocation to the 'Start my business' destination.",
    tags: ["Business", "Strategy", "Priorities"],
    createdAt: "2026-08-10T16:45:00Z",
    updatedAt: "2026-08-20T12:00:00Z",
  },
  {
    id: "note-demo-4",
    title: "Annual Motor Insurance Buffer",
    category: "UPCOMING_EXPENSES",
    isPinned: false,
    content:
      "Comprehensive vehicle insurance is due in October (~45,000 KES). Keep 15,000 KES/month set aside for August, September, and October.",
    tags: ["Insurance", "Automobile", "Commitment"],
    createdAt: "2026-08-12T08:30:00Z",
    updatedAt: "2026-08-12T08:30:00Z",
  },
];
