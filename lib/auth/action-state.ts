export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  email?: string;
  fullName?: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};
