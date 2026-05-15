import { cn } from "@/lib/utils";

export function AuthErrorMessage({
  message,
  tone = "error",
}: {
  message?: string | null;
  tone?: "error" | "success" | "info";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm leading-6",
        tone === "error" && "border-[#efc2b7] bg-[#fff0ec] text-[#9d3f29]",
        tone === "success" && "border-[#b8ddc4] bg-[#e5f7ea] text-[#12633f]",
        tone === "info" && "border-[#bad8ea] bg-[#edf7fb] text-[#235d7d]",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
