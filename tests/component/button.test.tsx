import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

describe("Button", () => {
  it("renders an accessible button label", () => {
    render(<Button>Submit report</Button>);

    expect(
      screen.getByRole("button", { name: "Submit report" }),
    ).toBeInTheDocument();
  });

  it("renders input controls with accessible labels", () => {
    render(
      <label>
        Email address
        <Input type="email" />
      </label>,
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });
});
