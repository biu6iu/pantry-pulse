// The one description of list/report filters, shared by the frontend API wrappers,
// the route parser and the repository so they cannot drift apart
export interface DonationFilters {
  status?: "OPEN" | "COMPLETED";
  recipientId?: string;
  from?: Date;
  to?: Date;
  country?: string;
  state?: string;
  limit?: number;
  offset?: number;
}
