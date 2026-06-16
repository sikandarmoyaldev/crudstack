# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Planned Packages**:
    - `@crudstack/core`: Unified `CrudStack` class, generic interfaces, and React providers.
    - `@crudstack/firebase`: Firebase adapter for Database and Authentication.
    - `@crudstack/sanity`: Sanity CMS adapter for Database.
    - `@crudstack/ui`: Pre-built shadcn/ui layouts, data-tables, and CRUD views.
    - `@crudstack/auth`: Unified authentication context and hooks.
    - `@crudstack/cli`: Scaffolding CLI (`create-crudstack-app`).
- **Planned Templates**:
    - `templates/nextjs`: Base Next.js application for the CLI to generate.
    - `templates/react-vite`: Base React + Vite application (Future).
    - `templates/astro`: Base Astro application (Future).

---

## [0.0.0] - 2026-06-16

### Added

- **Monorepo Foundation**: Initialized the project structure using `pnpm` workspaces.
- **Root Configuration**:
    - Added `package.json` with global workspace scripts.
    - Added `pnpm-workspace.yaml` to define `templates/*` and `packages/*` directories.
    - Generated initial `pnpm-lock.yaml`.
- **Code Formatting**:
    - Added `.prettierrc.json` for consistent code styling across the monorepo.
    - Added `.prettierignore` to exclude build artifacts and dependencies.
- **Shared Tooling Configurations**:
    - Created `packages/eslint-config` to provide a global, optional ESLint configuration for all packages.
    - Created `packages/typescript-config` to provide shared `tsconfig.json` presets (`base.json`, `react-library.json`, `nextjs.json`).
- **Documentation**: - Added comprehensive `README.md` detailing the architecture, packages, and Firebase usage examples. - Added `CONTRIBUTING.md` with guidelines for local setup, pnpm commands, and how to add new database providers. - Added this `CHANGELOG.md` to track project progress and releases.
  EOF
