import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible button label", () => {
    render(<Button>Submit report</Button>);

    expect(
      screen.getByRole("button", { name: "Submit report" }),
    ).toBeInTheDocument();
  });
});
