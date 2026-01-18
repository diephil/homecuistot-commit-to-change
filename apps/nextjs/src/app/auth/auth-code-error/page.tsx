import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="text-zinc-500">Something went wrong during sign in.</p>
        <Link
          href="/login"
          className="text-sm underline hover:no-underline"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
