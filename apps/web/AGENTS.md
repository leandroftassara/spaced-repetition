<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Light theme colors

Do not hard-code hex colors for the light theme in components. Use the tokens defined in `app/globals.css` (also wired into Tailwind as `primary-*` utilities).

| Token | Hex | Tailwind examples |
| --- | --- | --- |
| Primary font | `#363636` | `text-primary-font`, `text-foreground` |
| Primary background | `#F5F6F8` | `bg-primary-background`, `bg-background` |
| Primary card background | `#E3E3E3` | `bg-primary-card` |
| Primary card hover (Tailwind `neutral-300`) | `#D4D4D4` | `bg-primary-card-hover` |

Prefer the explicit `primary-*` names for new UI so intent stays clear. `background` / `foreground` mirror primary background and primary font for compatibility with existing patterns.

The `primary-*` CSS variables keep the light hex values even when `prefers-color-scheme: dark` changes `--background` / `--foreground`; use `dark:` styles or future dark tokens for dark surfaces until a dark palette is added.
