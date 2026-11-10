# ArchiTECH Automation · Plugins website

The commercial marketplace for ArchiTECH's BIM productivity software, with interactive browser
demos for the Revit suites, ArchiTECH-I3D, Assistant and the MCP connectors. The suite launchers
and Point Cloud On/Off are covered as ribbon workflows.

This repository publishes the isolated [Automation staging preview](https://architech97.github.io/architech-automation-preview/).
It starts from Automation source revision `ee7f8f50b0ceb2e76619c0d74b1f8578a9924cc7`. The preview is excluded from search indexing.

## What is in this repository

Website code and public product information only:

- product copy taken from each plugin's own ribbon tooltip and long description;
- dialog screenshots rendered from each plugin's own layout with sample data;
- guided Revit simulations, browser workflows paired with reconstructed dialog layouts, and product-specific command and connector simulations.

It contains **no plugin source code, licensing logic, credentials or client data**. The demos never run Revit,
open a model or call any service.

The AT-01 Sample Residence project board links four demos using fictional rooms, sheets and warning groups. Each demo starts with independent sample state. Sample reports are generated in the browser.

The Home page includes an attributed roof perspective and schematic plan exported from Autodesk's Snowdon Towers sample in Revit 2024. Those views are separate from the AT-01 fixtures. The I3D chair is a desktop result preview.

## Stack

Vite + React + TypeScript, static output for GitHub Pages. No backend.

| Path | Purpose |
|---|---|
| `src/data/` | The catalogue: `tools.generated.json` (generated from the plugin sources), `problems.ts`, `extras.ts` (I3D, MCP, Assistant), `suites.ts`, `catalog.ts` |
| `src/demo/` | The demo framework: `DemoPlayer` (simulated Revit window, guided steps, notifications, log), `ui.tsx` (dialog primitives), `dialog.css` (the plugins' own Dark/Light palette), `sample.ts`, `registry.ts` |
| `src/demo/demos/` | Hand-built Revit demo components |
| `src/pages/` | Home, catalogue, product, demos, pricing, custom development |
| `public/media/` | Dialog renders, I3D captures and sample Blender render |
| `public/demo-layouts/` | Public dialog layout fixtures loaded by the simulations |

## Adding an interactive demo

1. Write `src/demo/demos/<Name>.tsx`: a component that receives `DemoContext`
   (`theme`, `setTheme`, `done(stepId)`, `notify()`, `close()`) and builds the dialog from the primitives in
   `src/demo/ui.tsx`. Give the controls the guide should point at a `demo="..."` prop.
2. Add an entry to `src/demo/registry.ts`: the ribbon location, the guided steps (`id`, `title`, `hint`,
   `target`), and the facts the simulation is based on (`basis`).
3. Map the tool's key to the demo id in `DEMO_BY_KEY` in `src/data/catalog.ts`.

Use the real dialog's labels, options and rules. Do not add capabilities the plugin does not have.

Coverage counts in the demo library are derived from the catalogue and registry. For layout-based
demos, the browser workflow and dialog layout share sample state. Validate inputs and show a result
the visitor can inspect before marking the guide complete.

## Revit 2024 dialog alignment

The suite audit compared 58 installed tool registrations and the shared ribbon registration with the
catalogue and dialog references. Installed WPF resource names were checked for window coverage. The
shared Home dialog opens as Folio Home, Forge Home or Sentinel Home, with 19, 17 and 23 tool entries
respectively. Sample availability and generated output are simulated independently of the desktop.

Layout-based demos open in Dialog layout on wider screens and in Browser workflow on smaller
screens. Native file generation and model edits are represented by sample results and receipts.

Licensing and custom-development enquiries prepare an email draft locally. Visitors review it and send
it with their own email client.

## Develop

```bash
npm ci
npm run dev
npm run build   # type-check and build to dist/
```

The Pages workflow deploys only from `main` of this staging repository. The build emits static entry
points for direct product and demo links. The workflow checks staging HTML for `noindex, nofollow`.
