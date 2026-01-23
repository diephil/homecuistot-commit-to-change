# Feature Specification: Opik LLM Observability Integration

**Feature Branch**: `005-opik-llm-observability`
**Created**: 2026-01-23
**Status**: Draft
**Input**: Integrate Opik for LLM prompt versioning, tracing, and observability

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Registers Prompts to Opik (Priority: P1)

As a developer, I want to register LLM prompts to Opik so that prompts are versioned and trackable across environments.

**Why this priority**: Foundation for all observability - without registered prompts, no versioning or tracking possible.

**Independent Test**: Run registration script and verify prompt appears in Opik UI with correct metadata.

**Acceptance Scenarios**:

1. **Given** a prompt definition file exists, **When** developer runs `pnpm prompt:voice`, **Then** prompt is registered to Opik with name, description, template, metadata, and tags
2. **Given** prompt already registered, **When** developer runs registration again, **Then** Opik creates new version with incremented commit hash
3. **Given** production environment, **When** developer runs `pnpm prompt:voice:prod`, **Then** prompt is registered with `production` environment tag

---

### User Story 2 - System Traces Gemini API Calls (Priority: P1)

As a developer, I want all Gemini API calls traced to Opik so that I can debug and analyze LLM interactions.

**Why this priority**: Core observability capability - enables debugging and performance analysis.

**Independent Test**: Make an API call and verify trace appears in Opik with generation name, input, output, and metadata.

**Acceptance Scenarios**:

1. **Given** a traced Gemini client, **When** `generateContent` is called, **Then** trace is sent to Opik with generation name from prompt definition
2. **Given** trace metadata configured, **When** generation completes, **Then** trace includes tags and custom metadata from prompt definition
3. **Given** audio or text input, **When** processed through Gemini, **Then** full input/output captured in trace

---

### User Story 3 - Modular Prompt Organization (Priority: P2)

As a developer, I want prompts organized in a modular structure so that each domain has clear separation and maintainability.

**Why this priority**: Improves codebase maintainability and enables team collaboration on different prompt domains.

**Independent Test**: Verify file structure follows `prompts/{domain}/prompt.ts` + `process.ts` pattern.

**Acceptance Scenarios**:

1. **Given** a new prompt domain, **When** developer creates files, **Then** structure follows `src/lib/prompts/{domain}/prompt.ts` and `process.ts`
2. **Given** prompt definition, **When** imported in process file, **Then** prompt template variables are replaced correctly
3. **Given** process function called, **When** Gemini responds, **Then** response is validated against Zod schema

---

### Edge Cases

- What happens when Opik server is unavailable during registration? Registration fails with clear error message.
- What happens when Opik server is unavailable during tracing? Trace is buffered or logged locally.
- What happens when Gemini returns empty response? Error thrown with descriptive message.
- What happens when response fails Zod validation? Error thrown indicating invalid response format.
- What happens when environment variable is missing? Clear error at startup indicating missing configuration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support standardized prompt definition format with name, description, template, metadata, and tags
- **FR-002**: System MUST organize prompts in `src/lib/prompts/{domain}/prompt.ts` file structure
- **FR-003**: System MUST support mustache-style template variables ({{variableName}}) in prompts
- **FR-004**: System MUST include metadata fields: inputType, domain, model
- **FR-005**: System MUST register prompts to Opik using the Opik SDK
- **FR-006**: System MUST support environment-aware registration (development/production)
- **FR-007**: System MUST automatically add environment tag and metadata during registration
- **FR-008**: System MUST provide npm scripts for prompt registration (individual and batch)
- **FR-009**: System MUST trace all Gemini API calls using opik-gemini wrapper
- **FR-010**: System MUST pass generation name from prompt definition to traces
- **FR-011**: System MUST include tags and metadata in trace context
- **FR-012**: System MUST flush traces after each generation to ensure delivery
- **FR-013**: System MUST create modular process functions with typed parameters
- **FR-014**: System MUST validate Gemini responses against Zod schemas
- **FR-015**: System MUST support both audio (voice) and text input processing

### Key Entities

- **Prompt Definition**: Standardized structure containing name, description, template, metadata, tags
- **Trace**: Record of LLM interaction including input, output, generation name, metadata
- **Process Function**: Domain-specific function that wraps Gemini calls with tracing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All LLM prompts are version-tracked with commit history in Opik
- **SC-002**: 100% of Gemini API calls produce corresponding traces in Opik
- **SC-003**: Developers can view trace details (input, output, latency) within Opik UI
- **SC-004**: Prompt registration completes in under 5 seconds per prompt
- **SC-005**: Trace data is available in Opik within 10 seconds of API call completion
- **SC-006**: All process functions return validated, typed responses

## Scope & Boundaries

### In Scope

- Prompt definition format and file organization
- Prompt registration scripts and npm commands
- Gemini SDK tracing via opik-gemini wrapper
- Onboarding prompts (voice and text input)
- Local development and production environment support

### Out of Scope

- UI for prompt management (use Opik UI)
- Prompt A/B testing or experiment tracking
- Cost tracking or usage analytics
- Other LLM providers (only Gemini supported)
- Automatic prompt optimization

## Dependencies

### External Dependencies

- Opik server (local or cloud) for trace storage and UI
- Google Gemini API for LLM generation

### Internal Dependencies

- Existing Zod schemas for response validation (VoiceUpdateSchema)
- Environment configuration (.env.local, .env.prod)

## Assumptions

- Opik server is running and accessible at configured URL
- Google Gemini API key is valid and has sufficient quota
- tsx is available for running TypeScript scripts
- Node.js environment supports ESM imports
