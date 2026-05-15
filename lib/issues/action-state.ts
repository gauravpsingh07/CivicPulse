export type CreateIssueActionState = {
  status: "idle" | "error" | "partial";
  message: string;
  createdIssueId?: string;
};

export const initialCreateIssueActionState: CreateIssueActionState = {
  status: "idle",
  message: "",
};
