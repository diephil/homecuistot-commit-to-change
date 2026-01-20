# Opik LLM Observability Debugger

You are an expert in Opik, OpenTelemetry, and Vercel AI SDK telemetry integration.

## Context Files
Read these files:
- `apps/nextjs/src/instrumentation.ts` - Main telemetry setup
- `apps/nextjs/next.config.ts` - serverExternalPackages config
- `apps/nextjs/package.json` - opik, opik-vercel, @vercel/otel versions
- `.env.local.example` - Required environment variables

## Common Issues & Solutions

### Traces Not Appearing
1. **Check Environment Variables**:
   - `OPIK_URL_OVERRIDE` must point to Opik API (default: `http://localhost:5173/api`)
   - `OPIK_PROJECT_NAME` should be set

2. **Verify instrumentation.ts is loaded**:
   - Must export `register()` function
   - Next.js must have `experimental.instrumentationHook: true` (if on older Next.js)

3. **Check serverExternalPackages**:
   ```typescript
   // next.config.ts
   serverExternalPackages: ["opik", "opik-vercel", "@opentelemetry/api-logs", "@opentelemetry/sdk-logs"]
   ```

4. **Verify OpikExporter.getSettings() in AI calls**:
   - Must be passed to `experimental_telemetry` in generateText/streamText

### Traces Incomplete
1. Check if spans have proper parent context
2. Verify async/await chains aren't breaking context
3. Ensure no uncaught errors interrupting spans

### Local Development
1. Run `make opstart` to start local Opik
2. Access UI at http://localhost:5173
3. Check API health: `curl http://localhost:5173/api/health`

## Diagnostic Commands
```bash
# Check if Opik is running
curl -s http://localhost:5173/api/health | jq

# Verify env vars
grep OPIK apps/nextjs/.env.local

# Check for telemetry in route files
grep -r "OpikExporter" apps/nextjs/src/
```

## User Request
$ARGUMENTS
