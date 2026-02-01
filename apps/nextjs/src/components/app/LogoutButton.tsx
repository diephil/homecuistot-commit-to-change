"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/shared/Button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="secondary"
      size="sm"
      className="gap-2"
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "..." : "Logout"}
    </Button>
  );
}
