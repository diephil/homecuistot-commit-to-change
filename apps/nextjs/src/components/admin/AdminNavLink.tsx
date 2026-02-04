"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminNavLinkProps {
  href: string;
  label: string;
}

export function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 border-2 border-black font-bold uppercase text-sm transition",
        isActive
          ? "bg-yellow-300 border-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          : "bg-white hover:bg-gray-100",
      )}
    >
      {label}
    </Link>
  );
}
