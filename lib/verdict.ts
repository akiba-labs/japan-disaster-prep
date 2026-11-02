/** Verdict labels and colours, shared by server pages and the client calculator. */
export const VERDICT_STYLE: Record<string, string> = {
  well_prepared: "text-teal-200",
  partly_prepared: "text-amber-200",
  not_prepared: "text-amber-200",
};
export const VERDICT_LABEL: Record<string, string> = {
  well_prepared: "All 5 done",
  partly_prepared: "Partly prepared",
  not_prepared: "Just starting",
};
export const STATUS_LABEL: Record<string, string> = { done: "Done", partial: "Partly", todo: "To do" };
export const STATUS_STYLE: Record<string, string> = { done: "text-teal-200", partial: "text-amber-200", todo: "text-rose-200" };
