"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button size="sm" type="submit" variant="secondary">
        <LogOut className="size-4" aria-hidden="true" />
        Logout
      </Button>
    </form>
  );
}
