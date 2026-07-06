# @crudstack/sqlite

## 0.0.1

### Patch Changes

- Initial release of the SQLite adapter with Drizzle ORM support.
- Implemented `DatabaseAdapter` interface using `drizzle-orm` and `better-sqlite3`.
- Added dynamic query translation from core `Query<T>` to Drizzle `WHERE` clauses.
- Added automatic `id` column resolution for `update` and `delete` operations.
