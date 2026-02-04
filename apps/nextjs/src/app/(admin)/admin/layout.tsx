import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/app/LogoutButton";
import { AdminNavLink } from "@/components/admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        role="banner"
        className="border-b-4 border-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 p-4"
      >
        <div className="max-w-7xl mx-auto">
          {/* Top row: title and logout */}
          <div className="flex justify-between items-center mb-4">
            <Link href="/admin" className="hover:opacity-80 transition">
              <h1 className="text-2xl font-black uppercase">
                🛡️ Admin Dashboard
              </h1>
            </Link>
            <LogoutButton />
          </div>

          {/* Navigation bar */}
          <nav className="flex gap-4 items-center border-t-4 border-black pt-3">
            <AdminNavLink
              href="/admin/unrecognized"
              label="Unrecognized Items"
            />
            <div className="flex-1" />
            <Link
              href="/app"
              className="bg-cyan-300 hover:bg-cyan-400 border-3 border-black px-6 py-2 font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
            >
              → Go To App
            </Link>
          </nav>
        </div>
      </header>
      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
