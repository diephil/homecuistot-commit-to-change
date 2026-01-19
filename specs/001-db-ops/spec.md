# Feature Specification: Database Operations Management

**Feature Branch**: `001-db-ops`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "As the developer team, I want to perform operations on my database like running migrations, seeding the SQL database, etc... on both my local environment as well as on production."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Database Migrations (Priority: P1)

A developer needs to apply schema changes to the database. They execute a migration command that applies all pending migrations in the correct order, creating tables, indexes, constraints, and functions as defined in the migration files.

**Why this priority**: Foundation for all database operations. Without the ability to run migrations, the database schema cannot be created or updated.

**Independent Test**: Can be fully tested by executing migration command against empty database and verifying all tables, indexes, RLS policies, and functions are created correctly. Delivers a working database schema.

**Acceptance Scenarios**:

1. **Given** an empty database, **When** developer runs migration command, **Then** all schema objects (tables, enums, indexes, RLS policies, functions) are created successfully
2. **Given** database with existing migrations applied, **When** developer runs migration command with new migrations, **Then** only new migrations are applied and existing data is preserved
3. **Given** a migration fails mid-execution, **When** developer inspects the database, **Then** the migration is rolled back and database remains in consistent state

---

### User Story 2 - Seed Database with Initial Data (Priority: P2)

A developer needs to populate the database with initial system data (ingredients, ingredient aliases, seeded recipes) required for the application to function. They execute a seed command that inserts this data in the correct order respecting foreign key constraints.

**Why this priority**: Required for application functionality but depends on migrations being applied first. System cannot match recipes or inventory without ingredient catalog.

**Independent Test**: Can be fully tested by running seed command against migrated database and verifying presence of all seeded ingredients (by category), aliases, and recipes. Delivers a functional ingredient catalog and recipe library.

**Acceptance Scenarios**:

1. **Given** a migrated but empty database, **When** developer runs seed command, **Then** all system ingredients, aliases, and seeded recipes are inserted successfully
2. **Given** database already contains seeded data, **When** developer runs seed command again, **Then** command detects existing data and either skips or updates as appropriate without duplicating
3. **Given** seed data with foreign key dependencies, **When** seed command executes, **Then** data is inserted in correct order to satisfy all constraints

---

### User Story 3 - Reset Database to Clean State (Priority: P2)

A developer needs to reset their local database to a clean state for testing. They execute a reset command that drops all existing data and schema, then reapplies migrations and seeds fresh data.

**Why this priority**: Critical for development and testing workflows but not needed for production. Enables developers to quickly recover from bad data states or test migration sequences from scratch.

**Independent Test**: Can be fully tested by running reset command against database with existing data and schema, then verifying database is recreated with clean schema and fresh seed data. Delivers a reproducible development environment.

**Acceptance Scenarios**:

1. **Given** a database with existing data and schema, **When** developer runs reset command, **Then** all data and schema are dropped, migrations are reapplied, and seed data is inserted
2. **Given** a corrupted database state, **When** developer runs reset command, **Then** database is restored to clean working state
3. **Given** local development environment, **When** reset command is executed, **Then** operation completes within reasonable time (under 30 seconds)

---

### User Story 4 - Apply Migrations to Production (Priority: P1)

A developer needs to deploy database changes to production. They execute a migration command against the production database that applies pending migrations safely, with validation and backup procedures.

**Why this priority**: Essential for deploying application updates that require schema changes. Production deployments cannot proceed without reliable migration capability.

**Independent Test**: Can be fully tested by executing migration command against production-like staging environment and verifying migrations apply successfully, data integrity is maintained, and rollback procedures work. Delivers ability to safely evolve production schema.

**Acceptance Scenarios**:

1. **Given** production database with pending migrations, **When** developer runs migration command with production credentials, **Then** migrations are applied successfully and application continues functioning
2. **Given** a migration that could cause downtime, **When** developer reviews migration plan, **Then** they receive warnings about destructive operations or locking concerns
3. **Given** production migration in progress, **When** an error occurs, **Then** migration is rolled back and database remains in previous consistent state

---

### User Story 5 - Inspect Database Status (Priority: P3)

A developer needs to understand the current state of the database. They execute a status command that shows which migrations have been applied, which are pending, and current schema version.

**Why this priority**: Helpful for debugging and understanding database state but not required for basic operations. Migrations can be run without checking status first.

**Independent Test**: Can be fully tested by running status command against database with some migrations applied and verifying output accurately reflects migration state. Delivers visibility into database version.

**Acceptance Scenarios**:

1. **Given** a database with some migrations applied, **When** developer runs status command, **Then** they see list of applied migrations with timestamps and pending migrations
2. **Given** a database in sync with migration files, **When** developer runs status command, **Then** they see confirmation that database is up to date
3. **Given** migration files out of sync with database, **When** developer runs status command, **Then** they see warning about inconsistencies

---

### Edge Cases

- What happens when migration file is deleted but already applied to database?
- How does system handle concurrent migration attempts (multiple developers)?
- What happens when production database has applied a migration that doesn't exist in current codebase?
- How does system handle migrations that take longer than connection timeout?
- What happens when seed data references ingredients/recipes that don't exist?
- How does system prevent accidental reset command execution in production?
- What happens when migration contains syntax errors or invalid SQL?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide command to apply all pending database migrations
- **FR-002**: System MUST track which migrations have been applied using migration version table
- **FR-003**: System MUST apply migrations in sequential order based on filename/version number
- **FR-004**: System MUST support rollback of failed migrations to maintain database consistency
- **FR-005**: System MUST provide command to seed database with initial system data (ingredients, aliases, recipes)
- **FR-006**: System MUST handle seed data idempotently to prevent duplicate entries on repeated runs
- **FR-007**: System MUST provide command to reset database (drop all objects, reapply migrations, reseed data)
- **FR-008**: System MUST support separate database connections for local and production environments
- **FR-009**: System MUST provide command to display current migration status (applied vs pending)
- **FR-010**: System MUST validate migration file syntax before applying to database
- **FR-011**: System MUST support environment-specific configuration (local vs production connection strings)
- **FR-012**: System MUST prevent destructive operations (reset, drop) from running against production without explicit confirmation
- **FR-013**: System MUST maintain transaction boundaries for migrations to enable atomic rollback
- **FR-014**: System MUST log all migration operations with timestamps and outcomes
- **FR-015**: System MUST verify database connectivity before attempting migration operations

### Key Entities

- **Migration File**: SQL file containing DDL statements to modify schema. Identified by version number and descriptive name. Contains idempotent operations when possible.
- **Seed Data File**: SQL file containing INSERT statements for system data. Organized by entity type (ingredients, recipes). Must respect foreign key dependencies.
- **Migration Record**: Database record tracking which migrations have been applied, when they were applied, and by whom. Used to determine pending migrations.
- **Environment Configuration**: Connection parameters (URL, credentials, database name) specific to local or production environment. Stored securely outside source control for production.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can initialize empty database to working state in under 60 seconds
- **SC-002**: Migration operations succeed on first attempt 95% of the time
- **SC-003**: Failed migrations leave database in recoverable state 100% of the time (no partial migrations)
- **SC-004**: Migration status command accurately reflects database state 100% of the time
- **SC-005**: Seed data command completes successfully against clean database 100% of the time
- **SC-006**: Production migrations complete without downtime for non-destructive schema changes
- **SC-007**: Developer can identify which migrations are pending by inspecting status output in under 10 seconds
- **SC-008**: Reset command restores database to known-good state 100% of the time in local environment

## Assumptions

1. **Database Platform**: Supabase PostgreSQL is the target database platform
2. **Migration Tool**: Using Supabase CLI migration tooling (supabase db push, supabase db reset)
3. **Migration Format**: Migrations are numbered SQL files in supabase/migrations/ directory
4. **Seed Data Approach**: Seed data is implemented as numbered migration files following schema migrations
5. **Environment Management**: Local environment uses Supabase local development stack, production uses hosted Supabase project
6. **Access Control**: Developers have local admin access, production migrations require service_role credentials
7. **Migration Ordering**: Migrations are applied in alphanumeric filename order
8. **Connection Management**: Database connections use connection pooling with reasonable timeout settings (30 seconds)
9. **Idempotency**: Schema migrations use IF NOT EXISTS clauses where appropriate, seed data checks for existing records before inserting
10. **Backup Strategy**: Production database has automated backups enabled (Supabase native backup system)

## Dependencies

1. Supabase CLI installed and configured on developer machines
2. Local Supabase instance running (via Docker) for development
3. Production Supabase project provisioned with connection credentials
4. Network connectivity to Supabase project (for production operations)
5. Migration files exist in supabase/migrations/ directory with correct naming convention
6. Database schema definition documented in .wip/db-model.md

## Out of Scope

1. Graphical UI for managing migrations (command-line only)
2. Automatic migration generation from schema models (manual SQL writing)
3. Data migration tools for transforming existing data (schema migrations only)
4. Database performance optimization or query tuning
5. Custom backup and restore tools (rely on Supabase native features)
6. Cross-database compatibility (PostgreSQL/Supabase only)
7. Automated migration testing framework
8. Migration preview or dry-run mode (rely on local testing)
9. Database replication or multi-region setup
10. Schema diff tools or migration conflict resolution
