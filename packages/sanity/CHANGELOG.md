# @crudstack/sanity

## 0.1.0

### Minor Changes

refactor architecture and implement strict GROQ query resolution

- Reorganized source code into distinct domains: adapters, modifiers, and a dedicated tests/ directory.
- Implemented a strict GROQ `QueryOperatorResolver` to translate core queries into parameterized Sanity queries.
- Added support for bulk updates and deletes using Sanity transactions.
- Added a fluent `QueryBuilder` for type-safe query construction.
- Added `vitest.config.ts` to support path aliases in tests.

## 0.0.1

### Patch Changes

- Initial release of the Sanity CMS adapter.
- Implemented `DatabaseAdapter` interface with automatic GROQ query translation.
- Added automatic mapping between Sanity's `_id`/`_type` and Crudstack's `id`/`resource` structure.
