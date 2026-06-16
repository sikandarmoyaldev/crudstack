# Contributing to Crudstack

> Thank you for your interest in contributing to Crudstack! 🚀

Crudstack is a monorepo built to make CRUD application development faster and database-agnostic. Whether you want to add a new database adapter, fix a UI bug, or improve the CLI, your contributions are highly welcome.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **pnpm**: v9.0.0 or higher. _(Note: This project strictly uses `pnpm` for workspace management. Please do not use `npm` or `yarn`)_.

## 🛠️ Local Development Setup

### 1. Fork and Clone the Repository:

```bash
git clone https://github.com/sikandarmoyaldev/crudstack.git
cd crudstack
```

### 2. Install Dependencies:

This will install all dependencies for the root, all packages, and the template app, and link them together via the pnpm workspace.

```bash
pnpm install
```

### 3. Build the Packages:

Because the `templates/nextjs` relies on the compiled output of the `packages/*`, you must build them first.

```bash
pnpm build
```

### 4. Start Development:

This will start the Next.js template app and watch all packages for changes.

```bash
pnpm dev
```

## 📦 Working with the Monorepo

Because this is a `pnpm` workspace, you need to run commands in the context of specific packages. Here are the most common commands you will use:

### Running Scripts in a Specific Package

Use the `--filter` flag to target a specific package:

```bash
# Build only the core package
pnpm --filter @crudstack/core build

# Run lint only on the firebase package
pnpm --filter @crudstack/firebase lint

# Start dev server for the template app
pnpm --filter template dev
```

### Adding Dependencies

To add a dependency to a specific package:

```bash
pnpm add <package-name> --filter @crudstack/firebase
```

To add a workspace package as a dependency to another package:

```bash
pnpm add @crudstack/core --filter @crudstack/firebase
```

To add a dependency to the root (shared across all packages):

```bash
pnpm add -D typescript -w
```

## 🔌 How to Add a New Database/Auth Provider

One of the core goals of Crudstack is to support as many databases and auth providers as possible. Here is how to add a new one (e.g., `Supabase`):

1. Create the Package Directory:

    Create a new folder inside `packages/` (e.g., `packages/supabase`).

2. Initialize package.json:

    Create a `package.json` inside your new folder:

    ```json
    {
        "name": "@crudstack/supabase",
        "version": "0.1.0",
        "private": true,
        "main": "./dist/index.js",
        "module": "./dist/index.mjs",
        "types": "./dist/index.d.ts",
        "scripts": {
            "build": "tsup src/index.ts --format cjs,esm --dts",
            "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
        },
        "dependencies": {
            "@crudstack/core": "workspace:*",
            "@supabase/supabase-js": "^2.0.0"
        },
        "devDependencies": {
            "tsup": "^8.0.0",
            "@crudstack/typescript-config": "workspace:*"
        }
    }
    ```

3. Implement the Interfaces

    Create `src/index.ts` and implement the `DatabaseAdapter` and/or `AuthAdapter` interfaces exported from `@crudstack/core`.

    ```ts
    import { DatabaseAdapter } from "@crudstack/core";
    import { createClient, SupabaseClient } from "@supabase/supabase-js";

    export class SupabaseDatabaseAdapter<T extends { id: string }> implements DatabaseAdapter<T> {
        private client: SupabaseClient;
        private table: string;

        constructor(config: { client: SupabaseClient; table: string }) {
            this.client = config.client;
            this.table = config.table;
        }

        async getOne(id: string): Promise<T> {
            const { data, error } = await this.client
                .from(this.table)
                .select()
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as T;
        }

        // ... implement getList, create, update, delete
    }
    ```

4. Update the CLI:

    Open `packages/cli/src/index.ts` and add your new provider to the interactive prompts so users can select it when scaffolding a new app.

5. Update Documentation:

    Add your new package to the Providers table in the root `README.md` and create a `packages/supabase/README.md` with setup instructions.

## 📝 Commit Message Convention

We strictly follow the [Conventional Commits](https://www.conventionalcommits.org) specification. This allows us to automatically generate changelogs and semantic version numbers.

**Format**: `<type>(<scope>): <description>`

**Types**:

- `feat`: A new feature (e.g., `feat(firebase): add Google Sign-In support`)
- `fix`: A bug fix (e.g., `fix(ui): resolve data-table pagination overflow`)
- `docs`: Documentation only changes (e.g., `docs(readme): update usage examples`)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Changes to the build process, CI, or auxiliary tools (e.g., `chore(tsup): update build config`)
- `test`: Adding missing tests or correcting existing tests

**Scopes**:

Use the package name as the scope. Examples: `core`, `firebase`, `sanity`, `ui`, `auth`, `cli`.

## 🔄 Pull Request Process

1.  **Create a Branch**: Always create a new branch from `main` for your work.

    ```bash
    git checkout -b feat/supabase-adapter
    ```

2.  **Make your Changes**: Ensure your code is well-typed and follows the existing ESLint rules.
3.  **Test your Changes**:

    - Run `pnpm build` at the root to ensure all packages compile successfully.
    - Run `pnpm lint` to ensure no linting errors exist.
    - If you added a new provider, test it in the `templates/nextjs` app.

4.  **Commit your Changes**: Use the Conventional Commits format.
5.  **Push and Open a PR**: Push your branch to your fork and open a Pull Request against the `main` branch of the main repository.
6.  **Review**: A maintainer will review your PR. Please be responsive to feedback and make requested changes promptly.

## 🐛 Reporting Bugs & Requesting Features

If you find a bug or have an idea for a new feature, please [open an issue](https://github.com/sikandarmoyaldev/crudstack/issues) on GitHub.

**For Bugs, please include**:

- A clear, descriptive title.
- Steps to reproduce the behavior.
- The expected behavior vs. the actual behavior.
- Your environment details (Node version, OS, pnpm version).

**For Features, please include**:

- A clear description of the problem your feature solves.
- How you envision the API or usage looking (code snippets are great!).

Thank you for helping make Crudstack better! 🚀
