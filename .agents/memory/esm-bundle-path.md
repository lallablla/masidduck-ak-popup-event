---
name: ESM bundle data file path resolution
description: How to correctly resolve data file paths in esbuild-bundled Express servers
---

When an Express server is bundled with esbuild into `dist/index.mjs`, using `join(__dirname, "../../data.json")` to locate a data file relative to `src/routes/` will resolve incorrectly because `__dirname` at runtime points to `dist/`, not the original source file.

**Rule:** Use `process.cwd()` for locating data files in server code:
```ts
const DATA_FILE = join(process.cwd(), "data.json");
```

**Why:** pnpm runs scripts from the package directory (e.g. `artifacts/api-server/`), so `process.cwd()` correctly resolves to the package root regardless of the bundle output directory.

**How to apply:** Any time a server route or service needs to read/write a file relative to the package root (data.json, analytics.json, etc.), use `process.cwd()` instead of `__dirname` + relative path traversal.
