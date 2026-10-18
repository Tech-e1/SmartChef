# AI Rules for this React Application

## Tech Stack (5‑10 bullet points)

- **React** with **TypeScript** – the core UI framework.
- **React Router** – keep all routes defined in `src/App.tsx`.
- **shadcn/ui** – prebuilt component library; always use these components for new UI.
- **Tailwind CSS** – utility‑first styling; use Tailwind classes for layout, spacing, colors, etc.
- **lucide-react** – icon set; import icons from this package.
- **Radix UI** – underlying primitives for accessible components (already installed via shadcn/ui).
- **Pages convention** – put page components in `src/pages/`, the default page is `src/pages/Index.tsx`.
- **Components convention** – put reusable components in `src/components/`.
- **Hot‑reload development** – ordinary source, styling, and asset edits trigger hot reload; no need to restart the dev server.
- **Production builds** – use `run_build` for final verification after significant changes.

## Rules for Library Usage

| Library | When to Use | How to Import/Use |
|---------|-------------|-------------------|
| **shadcn/ui** | Any new UI component (buttons, forms, dialogs, tables, etc.) | Import from `~/ui/...` (prebuilt components). Do **not** modify existing shadcn files; create a new component if needed. |
| **Tailwind CSS** | Styling layout, spacing, colors, responsive design, dark mode | Apply Tailwind classes directly in JSX. Keep design decisions simple; avoid custom CSS unless absolutely necessary. |
| **lucide-react** | Any icon needed in the UI | Import individual icons, e.g., `import { Home } from "lucide-react";` and use `<Home />`. |
| **Radix UI** | When shadcn/ui component relies on Radix under the hood (most do) | No direct import needed; just use the shadcn/ui wrapper. |
| **React Router** | Defining page routes | Keep all `<Route>`/`<Router>` logic in `src/App.tsx`. Do not split routing across multiple files. |
| **TypeScript** | All new code, props, and state | Write type‑safe components, avoid `any` when a specific type is known. |
| **Development server** | Ordinary edits trigger hot reload; restart only if the server is stuck or a config change requires it. | Use `refresh` command (via the action button) for a quick preview refresh without restarting. |
| **Production build** | Final verification after major changes or config updates | Run `run_build`; do not run after trivial UI or styling tweaks. |

## Conventions

- **File locations**: 
  - Pages → `src/pages/`
  - Components → `src/components/`
  - Main/default page → `src/pages/Index.tsx`
- **Updating the main page**: Whenever a new component is created, edit `src/pages/Index.tsx` to include it so users can see the component in the preview.
- **No orphaned code**: Delete or comment out unused code only when you are certain it’s unused; prefer keeping the codebase clean.
- **Security**: Avoid command injection, XSS, SQL injection, etc. Sanitize any user input at the system boundary. Prioritize safe, secure code.

---
*These rules are intended to keep the codebase consistent, maintainable, and easy to extend. Follow them when adding new features or modifying existing parts of the app.*