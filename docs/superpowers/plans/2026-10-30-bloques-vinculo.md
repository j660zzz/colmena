# Bloques · Vínculo Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. The user explicitly authorized implementation in the existing `diseno/rediseno-ui` checkout; retain that branch and do not merge or push.

**Goal:** Apply the selected Bloques · Vínculo design to the live React app and its existing screens.

**Architecture:** Preserve store, session, RPCs, schema, calculations and existing navigation actions. Replace visual composition and styles, using the approved local mockup as the Muro target and the same visual language across the other screens.

**Tech Stack:** Existing Vite, React, Supabase and Fontsource. No new dependencies.

**Spec:** `mockups/rediseno-ui/ronda-2.html`, `ronda-2-vinculo.png`, `variantes.css`; user-provided `D:/colmena-brand-spec.md` and `D:/colmena-tokens.json` v2.0 take precedence over the obsolete brand section of AGENTS.md.

## Global Constraints

- Only Polen #FFF200, Tinta #0F0F0D, Blanco #FFFFFF, Niebla #F2F2EE, Verde #0F7A66. Verde is semantic. No gradients; no large Polen UI surfaces.
- Keep `src/styles/tokens.css`, `src/lib/*`, `src/data/contenido.js`, `supabase/*` unchanged.
- Space Grotesk 700/600, Hanken Grotesk 400/600, JetBrains Mono 500 for carnet/calculator data.
- Copy the official symbol exactly. Keep every example label; no invented activity or profiles.
- Touch targets at least 44 px, reduced motion, safe areas, and scroll clearance under the floating nav.

## Review Focus

- Long names and 500-character posts wrap without pushing actions outside a 320 px viewport.
- Floating navigation never prevents the last action, consent or field from being reached.
- Dark alternating cards preserve readable labels, avatars, examples and response states.
- Category filters and all existing navigation remain available, including direct carnet links.
- Native modal focus, Escape and background isolation work for composer/helper sheets.

## Task 1: Core Muro and shared visual shell

Files: `src/App.jsx`, `src/components/ui.jsx`, `src/screens/Muro.jsx`, `src/styles/app.css`.

- [x] Baseline browser check at 390 × 844: target heading absent, no brand header, navigation static, targets under 44 px. Expected failure confirmed.
- [x] Implement official brand header, Entre todos title, primary composer, compact filters and person-first alternating cards; keep existing actions/data.
- [x] Rebuild shared CSS and floating navigation with safe-area clearance, keyboard focus and reduced motion. Use native dialog for existing sheets.
- [x] Verify target heading/header/nav, full text/labels, filters, unsigned response routing and touch sizes in the browser.
- [x] Commit the independently reviewable visual core.

## Task 2: Remaining screens and PWA brand

Files: `src/screens/Bienvenida.jsx`, `Miembros.jsx`, `Carnet.jsx`, `Encuentro.jsx`, `Herramientas.jsx`, `Perfil.jsx`, `src/main.jsx`, `public/*` brand assets, `scripts/icons.mjs`, `index.html`, `vite.config.js`.

- [x] Apply the same spacing, hierarchy and controls to directory, welcome, carnet, encounter, tools, forms and empty states.
- [x] Use only allowed font weights and exact official PWA symbol/colors. Generate PNG icons from the exact SVG.
- [x] Verify all destinations, category/search filters, all six fichas, calculator, empty states, sample carnet and unsigned forms at 390 × 844; check 320 px and desktop.
- [x] Check signed UI with browser-only intercepted fixtures: no writes to production. Test composer and helper dialogs, long text, example labels and own-post controls.
- [x] Commit screens and PWA assets.

## Task 3: Validation and handoff

- [x] Compare approved screenshot and implemented Muro at 390 × 844; record intentional differences for real controls/data in `design-qa.md`.
- [x] Run `npm run build`, inspect built manifest/icons and confirm src/lib, schema, tokens and content have no diff.
- [x] Obtain an independent code review of the final change and resolve material findings.
- [x] Keep local app running; report actual checks and any limitations. Do not deploy, merge or push.

## Progress

- 2026-10-30: Plan recorded; user approval already covers implementation. Working in the explicitly requested existing branch. Baseline visual checks failed as expected. No unit-test scaffold added for reversible visual styling; browser checks cover real UI behavior.
- Task 1 complete: `bfdc9cc`. Heading, brand, floating nav, 44px targets and public filters verified; reference comparison preserves first-post y=280 and typography.
- Task 2 complete: 390/320/1440 checks pass; fonts, PWA symbol/icons and remaining screens implemented. Existing data/session/RPC/calculations untouched. Isolated intercepted suite 16/16, plus creation, welcome and public browsing checks.
- Final review: independent static review by review_vinculo. Fixed all three P2s after reproducing failures: modal errors, contrast of keyboard focus, long welcome names. No deferred findings. Details and evidence in design-qa.md.
- Task 3 complete: final build exit0, production preview checked, protected paths diff empty. Direct carnet link and manifest verified. Working branch remains unmerged and unpushed.
