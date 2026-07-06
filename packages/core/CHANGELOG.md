# @crudstack/core

## 0.0.2

### Patch Changes

- Added optional `schema?: unknown` parameter to all `DatabaseAdapter` methods to support schema-aware adapters (like Drizzle ORM).
- Updated `ResourceImpl` to pass the schema down to the underlying database adapter.

## 0.0.1

### Patch Changes

- Initial release of the core package.
- Added `CrudStack` main entry point and factory methods (`createResource`, `resource`).
- Defined type-safe `DatabaseAdapter`, `Resource`, `Entity`, and `Query<T>` interfaces.
