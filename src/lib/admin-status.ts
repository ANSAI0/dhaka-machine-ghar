// Workflow statuses for quotation and service requests (stored as plain strings).

export const quoteStatuses = {
  new: { label: "New", tone: "red" },
  contacted: { label: "Contacted", tone: "blue" },
  quoted: { label: "Price sent", tone: "amber" },
  won: { label: "Won", tone: "green" },
  lost: { label: "Lost", tone: "gray" },
} as const;

export const serviceStatuses = {
  open: { label: "Open", tone: "red" },
  scheduled: { label: "Scheduled", tone: "amber" },
  resolved: { label: "Resolved", tone: "green" },
} as const;

export const leadStatuses = {
  new: { label: "New", tone: "red" },
  contacted: { label: "Contacted", tone: "blue" },
  converted: { label: "Converted", tone: "green" },
  lost: { label: "Lost", tone: "gray" },
} as const;

export type LeadStatus = keyof typeof leadStatuses;
export type QuoteStatus = keyof typeof quoteStatuses;
export type ServiceStatus = keyof typeof serviceStatuses;
