# AGENTS.md

## Build Commands
- `npm run dev` - Development mode
- `npm run build` - TypeScript compile + Vite build (outputs to `dist/`, `dist-electron/`)
- `npm run build:full` - Full production build with electron-builder

## Key Conventions

### Cross-Platform Shell
- Use `bash -c "command"` on macOS, `cmd /c "command"` on Windows
- Check `process.platform === 'win32'` to detect OS
- Paths with spaces must be quoted

### Path Alias
- `@/` maps to `src/` - use in imports for consistency

### TypeScript
- Strict mode enabled (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`)
- Build does NOT emit (use Vite for bundling, not tsc output)

## Project Architecture

```
src/
├── main/           # Electron main process (Node.js)
│   ├── index.ts    # Entry + IPC handlers
│   ├── git-service.ts
│   ├── file-service.ts
│   └── storage-service.ts
├── renderer/       # React UI (browser context)
│   ├── components/ # UI components
│   └── utils/      # Helpers (syntax highlight, colors)
└── shared/         # Shared TypeScript types
```

## Current Development Status
- Phase 1 (UI framework): Complete
- Phase 2 (main process services): Complete
- Phase 3 (Git features): In Progress

## Git Operations
- **PROHIBITED**: All git operations (commit, push, pull, fetch, merge, rebase, checkout, branch, status, log, diff, etc.)
- **MANUAL ONLY**: User will handle all git operations manually
- Do NOT run any git commands unless explicitly requested by user

## Reference Documents
- Full UI spec: `ui-design/design.md`
- Developer guidance: `CLAUDE.md`
