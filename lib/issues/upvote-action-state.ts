export type UpvoteActionState = {
  status: "idle" | "success" | "auth_required" | "error";
  upvoted: boolean;
  message: string | null;
};

export const initialUpvoteActionState: UpvoteActionState = {
  status: "idle",
  upvoted: false,
  message: null,
};
