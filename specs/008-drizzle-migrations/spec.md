# Feature Specification: Drizzle-Only Migrations

**Feature Branch**: `008-drizzle-migrations`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "I'm currently defining my migrations following the Supabase approach. Now I want to switch to using Drizzle exclusively to manage my migrations. This way I'm staying agnostic of supabase CLI or way of managing migrations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Generates Migration from Schema Changes (Priority: P1)

A developer modifies the database schema definitions and needs to generate a migration file that captures those changes without relying on any vendor-specific tooling.

**Why this priority**: Core functionality - without migration generation, no schema changes can be tracked or deployed.

**Independent Test**: Can be fully tested by modifying a schema file, running the migration generation command, and verifying a migration file is created with correct SQL statements.

**Acceptance Scenarios**:

1. **Given** a developer has modified a schema definition (added/removed/changed a table or column), **When** they run the migration generation command, **Then** a timestamped migration file is created containing the SQL changes.
2. **Given** no schema changes have been made since the last migration, **When** the developer runs the migration generation command, **Then** the system indicates no changes detected and no empty migration is created.
3. **Given** a developer has made multiple schema changes across different tables, **When** they run the migration generation command, **Then** all changes are captured in a single migration file in the correct order.

---

### User Story 2 - Developer Applies Migrations to Database (Priority: P1)

A developer needs to apply pending migrations to update the database schema to match the current schema definitions.

**Why this priority**: Equally critical to P1-1 - migrations must be applicable to be useful.

**Independent Test**: Can be tested by having pending migration files and running the apply command, then verifying database schema matches expectations.

**Acceptance Scenarios**:

1. **Given** there are pending migration files not yet applied, **When** the developer runs the migration apply command, **Then** all pending migrations are applied in order and the database schema is updated.
2. **Given** all migrations have already been applied, **When** the developer runs the migration apply command, **Then** the system indicates the database is up to date.
3. **Given** a migration fails during application, **When** the error occurs, **Then** the system reports the specific failure and does not apply subsequent migrations.

---

### User Story 3 - Developer Views Migration Status (Priority: P2)

A developer needs to see which migrations have been applied and which are pending.

**Why this priority**: Important for debugging and understanding current database state, but not blocking core functionality.

**Independent Test**: Can be tested by running status command and verifying output matches actual applied/pending state.

**Acceptance Scenarios**:

1. **Given** a database with some migrations applied, **When** the developer runs the migration status command, **Then** they see a list showing applied and pending migrations with timestamps.

---

### User Story 4 - Developer Works Across Multiple Environments (Priority: P2)

A developer needs migrations to work consistently across local development, staging, and production environments regardless of the underlying database provider.

**Why this priority**: Essential for real-world usage but depends on core migration functionality working first.

**Independent Test**: Can be tested by applying same migrations to different database instances and verifying identical schema results.

**Acceptance Scenarios**:

1. **Given** a set of migration files, **When** applied to different database environments, **Then** the resulting schema is identical across all environments.
2. **Given** a developer switches from one database provider to another, **When** they run migrations, **Then** the migrations execute successfully without modification.

---

### User Story 5 - Team Collaborates on Schema Changes (Priority: P3)

Multiple developers on a team need to create and merge schema changes without conflicts or data loss.

**Why this priority**: Important for team workflows but relies on individual developer workflows being stable first.

**Independent Test**: Can be tested by having two developers create migrations on different branches, merging, and applying successfully.

**Acceptance Scenarios**:

1. **Given** two developers create migrations on separate branches, **When** the branches are merged, **Then** both migrations can be applied in sequence without conflicts.
2. **Given** a migration has been applied in production, **When** a developer tries to modify that migration file, **Then** the system warns against modifying applied migrations.

---

### Edge Cases

- What happens when a migration file is manually edited after generation?
- How does the system handle migration files created outside the standard tooling?
- What happens if the migration tracking table is corrupted or missing?
- How are migrations handled when the database connection fails mid-migration?
- What happens if two migrations attempt to modify the same table in conflicting ways?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate migration files from schema definition changes
- **FR-002**: System MUST apply pending migrations in chronological order
- **FR-003**: System MUST track which migrations have been applied to each database
- **FR-004**: System MUST prevent re-application of already-applied migrations
- **FR-005**: System MUST report migration status (applied vs. pending)
- **FR-006**: System MUST generate reversible migrations where possible (up/down)
- **FR-007**: System MUST support database-agnostic migration execution (not tied to specific vendor CLI)
- **FR-008**: System MUST preserve existing data during schema migrations
- **FR-009**: System MUST fail safely if a migration cannot be applied (no partial state)
- **FR-010**: System MUST support migration generation without requiring database connection
- **FR-011**: System MUST generate human-readable SQL in migration files

### Key Entities

- **Migration File**: A timestamped file containing SQL statements for schema changes. Attributes: timestamp, name, up-migration SQL, down-migration SQL (optional).
- **Migration State**: Record of which migrations have been applied to a specific database. Attributes: migration identifier, applied timestamp, checksum.
- **Schema Definition**: Source of truth for database structure. Defines tables, columns, constraints, relationships.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can generate and apply a migration within 2 minutes of making a schema change
- **SC-002**: 100% of existing schema definitions are preserved after migration system transition
- **SC-003**: Migrations execute successfully across all configured environments (local, staging, production)
- **SC-004**: Zero vendor-specific CLI commands required in the standard migration workflow
- **SC-005**: Migration files are reviewable in pull requests (human-readable SQL)
- **SC-006**: Database schema changes are fully auditable through migration history

## Scope *(mandatory)*

### In Scope

- Migration generation from schema definitions
- Migration application to databases
- Migration status tracking
- Transition of existing Supabase-managed migrations to new system
- Documentation of new migration workflow

### Out of Scope

- Data migrations (transforming existing data)
- Seed data management
- Database backup/restore functionality
- Multi-tenant schema management
- Real-time schema synchronization

## Dependencies *(mandatory)*

- Existing Drizzle schema definitions in `src/db/schema/`
- Database connection configuration
- Existing migrations in `supabase/migrations/` must be reconciled

## Assumptions

- The current database state matches the existing Supabase migrations
- Drizzle ORM is already configured and working for queries
- Developers have access to run migration commands locally
- All environments use PostgreSQL-compatible databases
- Team is comfortable with SQL-based migrations (vs. programmatic)
- Existing data must be preserved during the transition
