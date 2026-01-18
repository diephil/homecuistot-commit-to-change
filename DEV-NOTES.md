# Notes

## "serverExternalPackages" in next.config.ts

serverExternalPackages: ["opik", "opik-vercel", "@opentelemetry/api-logs", "@opentelemetry/sdk-logs"]

What it does: Tells Next.js to NOT bundle these packages into the server-side JavaScript. Instead, they're  
 loaded as external Node.js modules at runtime.

Why needed:

- These OpenTelemetry/Opik packages use native Node.js APIs (file system, process, etc.)
- They may have binary dependencies or use require() in ways that break bundling
- Webpack (Next.js bundler) can mangle or fail on these packages
- Without this, you'd see errors like "Module not found" or "Can't resolve 'fs'"

Common candidates: Any package that uses node: imports, native bindings, or dynamic require().

## Route Groups: (auth) and (protected)

Parentheses in folder names create route groups — they organize files without affecting the URL.  
 ┌─────────────────────────────────────────┬─────────────┐  
 │ Folder │ URL Path │  
 ├─────────────────────────────────────────┼─────────────┤  
 │ src/app/(auth)/login/page.tsx │ /login │  
 ├─────────────────────────────────────────┼─────────────┤  
 │ src/app/(protected)/onboarding/page.tsx │ /onboarding │  
 └─────────────────────────────────────────┴─────────────┘  
 Key point: (auth) and (protected) are not part of the URL — they're purely organizational.

Use cases:

- Group routes that share a layout
- Separate public vs authenticated sections
- Apply different middleware/layouts to each group

## Supabase redirect url

- must be configured per project based on [this guide](https://supabase.com/docs/guides/auth/redirect-urls)
