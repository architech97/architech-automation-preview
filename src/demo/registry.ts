import type { DemoDefinition } from './types'
import type { Product } from '../data/types'
import { PRODUCTS } from '../data/catalog'
import { LAYOUTS, generatedSteps } from './generatedRegistry'
import { connectorDemos } from './connectorRegistry'
import { studioDemos } from './studioRegistry'
import { suiteHomeSteps } from './suiteHomeCatalog'


// Every interactive demo. To add one: write src/demo/demos/<Name>.tsx (a component that takes
// DemoContext), add an entry here, and map the tool key to its id in src/data/catalog.ts.
const CRAFTED: Omit<DemoDefinition, 'kind'>[] = [
  {
    id: 'excel-to-schedule', productSlug: 'excel-to-schedule', width: 1040,
    ribbon: { tab: 'Arch Folio', panel: 'Schedules', button: 'Excel to Schedule' },
    title: 'Excel to Schedule',
    summary: 'Choose an Excel region, preview the cells and review a relink of a placed sample schedule.',
    basis: [
      'The workbook, worksheet, options and preview panes follow the installed Revit 2024 dialog.',
      'The sample uses the workbook region, target eligibility and relink rules from the native command. Existing schedule IDs and placements carry through the simulated refresh.',
    ],
    steps: [
      { id: 'workbook', title: 'Open the sample workbook', hint: 'Browse for a fictional workbook and inspect its worksheet tabs.', target: 'excel-workbook' },
      { id: 'region', title: 'Choose an Excel region', hint: 'Try a print area or named region and compare the cell preview.', target: 'excel-region' },
      { id: 'worksheet', title: 'Tick one worksheet', hint: 'Leave one worksheet checked when choosing an existing target.', target: 'excel-worksheets' },
      { id: 'target', title: 'Choose an existing schedule', hint: 'Review ownership and sheet placements before choosing a target.', target: 'excel-existing' },
      { id: 'refresh', title: 'Confirm the refresh', hint: 'Review the source and target, then check the retained sample schedule identity.', target: 'excel-confirm' },
    ],
    load: () => import('./demos/ExcelToSchedule'),
  },
  {
    id: 'replace-materials', productSlug: 'replace-materials', width: 900,
    ribbon: { tab: 'Arch Forge', panel: 'Finishes', button: 'Replace Materials' },
    title: 'Replace Materials',
    summary: 'Set material, categories and scope, scan the impact, then apply the reviewed sample replacements.',
    basis: ['The controls and impact-scan requirement follow the deployed Revit 2024 dialog and scoped material replacement rules.'],
    steps: [
      { id: 'configure', title: 'Set replacement scope', hint: 'Choose the two materials, work scope and type handling.', target: 'replace-configure' },
      { id: 'scan', title: 'Scan impact', hint: 'Check how many elements and types the current settings affect.', target: 'replace-scan' },
      { id: 'replace', title: 'Apply the reviewed replacement', hint: 'Run the sample replacement with a current impact scan.', target: 'replace-apply' },
    ],
    load: () => import('./demos/ReplaceMaterials'),
  },
  {
    id: 'match-opening', productSlug: 'match-opening', width: 1040,
    ribbon: { tab: 'Arch Forge', panel: 'Rooms', button: 'Match Opening' },
    title: 'Match Opening',
    summary: 'Scan a linked model, review opening differences and apply the selected sample changes.',
    basis: ['The scan, tolerances, opening review and apply order follow the deployed Match Opening dialog.'],
    steps: [
      { id: 'scan', title: 'Scan the linked openings', hint: 'Choose a linked model and check the scan settings.', target: 'opening-scan' },
      { id: 'select', title: 'Review the candidates', hint: 'Tick a Create or Resize row in the sample comparison.', target: 'opening-select' },
      { id: 'apply', title: 'Apply selected changes', hint: 'Review and confirm any host replacement before applying.', target: 'opening-apply' },
    ],
    load: () => import('./demos/MatchOpening'),
  },
  {
    id: 'point-cloud-on-off', productSlug: 'point-cloud-on-off', width: 820,
    ribbon: { tab: 'Arch Forge', panel: 'Scan to BIM', button: 'Point Cloud On/Off' },
    title: 'Point Cloud On/Off',
    summary: 'Toggle point clouds in the sample view and restore the previous visibility with Undo.',
    basis: ['The native split-button command toggles the Point Clouds category in the active view. A view template or unsupported view can block the toggle.'],
    steps: [
      { id: 'view', title: 'Choose a sample view', hint: 'Compare a working view with a view that cannot change point-cloud visibility.', target: 'pointcloud-view' },
      { id: 'toggle', title: 'Toggle the point cloud', hint: 'Run Point Cloud On/Off in a supported sample view.', target: 'pointcloud-toggle' },
      { id: 'undo', title: 'Restore the previous view', hint: 'Undo the sample visibility change.', target: 'pointcloud-undo' },
    ],
    load: () => import('./demos/PointCloudVisibility'),
  },
  {
    id: 'sheet-export', productSlug: 'sheet-export', width: 1080,
    ribbon: { tab: 'Arch Folio', panel: 'Publish', button: 'Sheet Export' },
    title: 'Sheet Export: publish a drawing set',
    summary: 'Select sheets, configure export formats and review the filenames before downloading a sample drawing register.',
    basis: [
      'Selection, Format and Create stages follow ArchSheetExportWindow.xaml and use the AT-01 sample sheets.',
      'The browser generates a CSV output manifest and drawing register. The Revit add-in produces drawing files and an optional XLSX register.',
    ],
    steps: [
      { id: 'selection', title: 'Select sheets', hint: 'Tick individual sheets or use Tick shown, then continue to Format.', target: 'tick-shown' },
      { id: 'format', title: 'Set export formats', hint: 'Choose PDF or other formats. Try combining the sheets into one PDF, then continue to Create.', target: 'continue-format' },
      { id: 'export', title: 'Review and run the export', hint: 'Check the filenames, run the sample export and download its manifest or drawing register.', target: 'run-sheet-export' },
    ],
    load: () => import('./demos/SheetExport'),
  },
  {
    id: 'parameter-manager', productSlug: 'parameter-manager', width: 1080,
    ribbon: { tab: 'Arch Forge', panel: 'Parameters', button: 'Parameter Manager' },
    title: 'Parameter Manager: define and bind a project parameter',
    summary: 'Create a project parameter, assign categories and export the resulting definitions.',
    basis: [
      'Parameters and Categories use the names, data types and category bindings shown in ParameterManagerWindow.xaml.',
      'The exercise applies changes to a browser fixture and downloads a CSV of its definitions.',
      'Nested Parameters requires an active family document in Revit. Choose the sample family under Families to try association and read back the results.',
    ],
    steps: [
      { id: 'add', title: 'Draft a parameter', hint: 'Use Add Parameter and review the name, data type and instance or type setting.', target: 'add-parameter' },
      { id: 'categories', title: 'Open Categories', hint: 'Switch to Categories to assign the new definition.', target: 'parameter-categories' },
      { id: 'bind', title: 'Choose its categories', hint: 'Tick one or more categories, such as Doors and Windows.', target: 'assign-categories' },
      { id: 'apply', title: 'Apply the definition', hint: 'Apply and check the receipt for the name, binding and categories.', target: 'apply-parameter' },
      { id: 'csv', title: 'Export the definitions', hint: 'Download a sample CSV to inspect the new definition and the existing rows.', target: 'parameter-csv' },
    ],
    load: () => import('./demos/ParameterManager'),
  },
  {
    id: 'sheet-manager', productSlug: 'sheet-manager', width: 1060,
    ribbon: { tab: 'Arch Folio', panel: 'Sheets', button: 'Sheet Manager' },
    title: 'Sheet Manager: renumber a sheet set',
    summary: 'Check an occupied sheet number, then issue the Ground Floor and First Floor plans as GA-101 and GA-102.',
    basis: [
      'The browser dialog follows SheetManagerWindow.xaml and uses the fictional Sample Residence sheet list.',
      'The sample shortcuts load exact inputs for the clash and issue cases. The preview and receipt report changes to the browser fixture.',
      'In Revit the renumber command skips occupied numbers and groups the successful changes into one Undo step.',
    ],
    steps: [
      { id: 'tick', title: 'Load the two floor plans', hint: 'Load A-101 Ground Floor Plan and A-102 First Floor Plan to open Renumber / Rename.', target: 'sheet-sample' },
      { id: 'collision', title: 'Check an occupied number', hint: 'Try changing A-101 to A-102. The First Floor Plan already uses A-102, so the preview blocks the change.', target: 'sheet-collision' },
      { id: 'rule', title: 'Set the GA issue rule', hint: 'Replace the A- prefix with GA- for both floor plans.', target: 'sheet-issue' },
      { id: 'preview', title: 'Review the two new numbers', hint: 'Confirm GA-101 and GA-102 in Preview, then mark it reviewed.', target: 'preview' },
      { id: 'run', title: 'Apply and check the receipt', hint: 'Run Renumber / rename. Check the old and new numbers, sheet names, revision and view counts.', target: 'run' },
    ],
    load: () => import('./demos/SheetManager'),
  },
  {
    id: 'warnings-inspector', productSlug: 'warnings-inspector', width: 1080,
    ribbon: { tab: 'Arch Sentinel', panel: 'Model Health', button: 'Warnings Inspector' },
    title: 'Warnings Inspector: critical warnings first',
    summary: 'Review grouped warnings by severity class and frequency, search descriptions or an element ID, inspect a group and isolate its elements, then export the scan.',
    basis: ['Stat tiles, filters, review panel and stale-scan guard follow the native Warnings Inspector.', 'The browser maps sample warnings to documented failure definitions and labels description-based fallbacks. Counts and element IDs are fictional.', 'The native tool exports an XLSX workbook. This browser exercise downloads all groups as a sample CSV.'],
    steps: [
      { id: 'filter', title: 'Show critical warnings', hint: 'Set Severity class to CRITICAL.', target: 'severity' },
      { id: 'pick', title: 'Review a warning group', hint: 'Click a row to read its full description and affected element IDs.', target: 'grid' },
      { id: 'isolate', title: 'Isolate the affected elements', hint: 'Press Isolate affected elements to review them in the view.', target: 'isolate' },
      { id: 'search', title: 'Search by element ID', hint: 'Type an element ID from the list (for example 301178) into the search box.', target: 'search' },
      { id: 'export', title: 'Export the report', hint: 'Download the sample CSV. It includes every warning group, even those hidden by filters.', target: 'export' },
    ],
    load: () => import('./demos/WarningsInspector'),
  },
  {
    id: 'purge-merge', productSlug: 'purge-and-merge', width: 1060,
    ribbon: { tab: 'Arch Sentinel', panel: 'Clean Up', button: 'Purge and Merge' },
    title: 'Purge & Merge: clean up unused content',
    summary: 'Review unused and referenced entries, confirm a sample deletion preview, or merge a concrete material pair.',
    basis: ['Columns, Show filters, type tags and footer actions from PurgeWindow.xaml.', 'The native tool previews deletion in a rolled-back Revit transaction. The browser shows fictional eligible, protected and referenced records.', 'The sample merge redirects six model type references to the chosen surviving material.'],
    steps: [
      { id: 'scan', title: 'Read the scan', hint: 'Unused entries are listed by default. Tick Used to see referenced ones too.', target: 'show-used' },
      { id: 'search', title: 'Find CAD-import leftovers', hint: 'Search "IMPORT" to find line styles and patterns brought in by CAD imports.', target: 'search' },
      { id: 'select', title: 'Select what is safe', hint: 'Use Select all visible, or tick rows one by one.', target: 'select-visible' },
      { id: 'purge', title: 'Purge selected', hint: 'Review the deletion scope, including any in-use entries, before confirming.', target: 'purge' },
    ],
    load: () => import('./demos/PurgeMerge'),
  },
  {
    id: 'room-to-finishes', productSlug: 'room-to-finishes', width: 1000,
    ribbon: { tab: 'Arch Forge', panel: 'Finishes', button: 'Room to Finishes' },
    title: 'Room to Finishes: floors, ceilings and wall linings',
    summary: 'Choose the finishes and their types, review the scope and creation plan, then approve the plan row by row before anything is created.',
    basis: ['Run modes, finish options, expanders and the Review scope panel from FinishingWindow.xaml.', 'The review step (each room, finish kind and intended action; only approved rows are applied) from FinishReviewWindow.', 'Basic walls and columns are supported; curtain and stacked walls are skipped.'],
    steps: [
      { id: 'types', title: 'Choose finish types', hint: 'Pick a floor type, a ceiling type and a wall lining type.', target: 'floor-type' },
      { id: 'option', title: 'Set a position option', hint: 'Open Position and door thresholds and tick Extend into door openings.', target: 'floor-pos' },
      { id: 'review', title: 'Review the plan', hint: 'Press Review plan to see each room, finish kind and intended action.', target: 'review' },
      { id: 'apply', title: 'Apply the approved rows', hint: 'Untick anything you do not want, then Apply reviewed plan.', target: 'apply' },
    ],
    load: () => import('./demos/RoomFinishes'),
  },
  {
    id: 'one-parameter', productSlug: 'one-parameter', width: 1000,
    ribbon: { tab: 'Arch Forge', panel: 'Parameters', button: 'One Parameter' },
    title: 'One Parameter: preview, edit and write one parameter',
    summary: 'Pick a category and a parameter, preview every element\'s value, edit the proposed values with find/replace, prefix or suffix, then write the ticked rows.',
    basis: ['Scope, category, parameter list, edit tools and preview grid from OneParameterWindow.xaml.', 'Replace in preview edits proposed values only; nothing is written until Apply Changes.', 'A type parameter is written once per type.'],
    steps: [
      { id: 'category', title: 'Pick a category', hint: 'Choose Doors in the CATEGORY list.', target: 'category' },
      { id: 'param', title: 'Pick a parameter', hint: 'Click Comments in the PARAMETER list.', target: 'params' },
      { id: 'replace', title: 'Edit in the preview', hint: 'Find "internal", replace with "Internal door", then Replace in preview.', target: 'replace' },
      { id: 'apply', title: 'Apply the ticked rows', hint: 'Apply Changes writes the ticked rows in one transaction.', target: 'apply' },
    ],
    load: () => import('./demos/OneParameter'),
  },
  {
    id: 'room-to-view', productSlug: 'room-to-view', width: 1080,
    ribbon: { tab: 'Arch Folio', panel: 'Views', button: 'Room to View' },
    title: 'Room to View: room packages in one run',
    summary: 'Tick rooms, choose which views to make (floor plan, ceiling plan, 3D, elevations) with crop, scale and template, then create them.',
    basis: ['Steps (Rooms, Floor Plan, Ceiling Plan, 3D View, Elevations, Masking, Place on Sheet) and options from RoomToViewWindow.xaml.', 'Elevation layouts: all walls, 4 elevations on a shared marker, or by direction (N/E/S/W).', 'Views are named from the room number and name; curved boundaries are skipped for elevations.'],
    steps: [
      { id: 'rooms', title: 'Tick the rooms', hint: 'Tick Kitchen and Living Room (or use Tick shown).', target: 'rooms' },
      { id: 'floor', title: 'Set the floor plan', hint: 'Open Floor Plan to set the crop, scale and view template.', target: 'nav:Floor Plan' },
      { id: 'elev', title: 'Choose elevations', hint: 'Open Elevations and choose one of the three layouts.', target: 'nav:Elevations' },
      { id: 'create', title: 'Create the views', hint: 'Press Create to generate the views for every ticked room.', target: 'create' },
    ],
    load: () => import('./demos/RoomToView'),
  },
  {
    id: 'model-health', productSlug: 'model-health', width: 980,
    ribbon: { tab: 'Arch Sentinel', panel: 'Model Health', button: 'Model Health' },
    title: 'Model Health: export and review a report',
    summary: 'Select inventory sections, run a sample health check, review its findings and download a section CSV.',
    basis: [
      'ReportSelectionForm and ExportProgressForm supply the code-built WPF option labels, inventory categories and cancellation behavior.',
      'CheckSetRunner supplies Model Check Reviews and the Result, Severity and Reason override fields. The dashboard follows the desktop export’s searchable and sortable section tables.',
      'All model counts, receipts and downloadable CSV rows use the fictional AT-01 fixture.',
    ],
    steps: [
      { id: 'categories', title: 'Choose inventory categories', hint: 'Keep the defaults or tick the model inventory sections you want to export.', target: 'health-categories' },
      { id: 'run', title: 'Run the sample check', hint: 'Choose Run check to collect the selected inventory. Use Cancel after current section to see a partial receipt.', target: 'health-run' },
      { id: 'review', title: 'Review the findings', hint: 'Mark a failure reviewed, edit an override or leave the results as they are, then finish the review.', target: 'health-review' },
      { id: 'dashboard', title: 'Open the dashboard', hint: 'Check the sample receipt and open the dashboard to explore exported sections.', target: 'health-dashboard' },
      { id: 'download', title: 'Download a section CSV', hint: 'Pick an inventory section, filter its rows and download the sample CSV.', target: 'health-download' },
    ],
    load: () => import('./demos/ModelHealthExport'),
  },
]


const SUITE_TAB: Record<string, string> = { folio: 'Arch Folio', forge: 'Arch Forge', sentinel: 'Arch Sentinel' }

const SENTINEL_COMMANDS: Partial<Record<string, { width: number; basis: string[]; steps: DemoDefinition['steps'] }>> = {
  'pin-unpin-links': {
    width: 1000,
    basis: ['The four commands, pin-state table and confirmation follow the code-built native workbench.', 'Every change affects only the three fictional browser placements.'],
    steps: [
      { id: 'configure', title: 'Choose a pinning scope', hint: 'Choose Pin RVT links to change the unpinned Revit link while leaving CAD alone.', target: 'flow-choice' },
      { id: 'run', title: 'Review and apply', hint: 'Check the number and IDs of affected placements, then confirm the sample operation.', target: 'flow-run' },
      { id: 'review', title: 'Check the pin states', hint: 'Read the refreshed grid and mark the result reviewed.', target: 'flow-review' },
    ],
  },
  'in-place-inspector': {
    width: 940,
    basis: ['The report columns, severity thresholds and row actions follow the code-built native inspector.', 'The browser tracks only fictional family records. The CSV contains the current sample rows.'],
    steps: [
      { id: 'configure', title: 'Choose an in-place family', hint: 'Select Reception Millwork to review its 22 sample instances.', target: 'flow-choice' },
      { id: 'run', title: 'Show in 3D View', hint: 'Check the sample isolation result for the selected family.', target: 'flow-run' },
      { id: 'review', title: 'Review the result', hint: 'Read the result and mark it reviewed. You can also inspect or delete another sample family.', target: 'flow-review' },
    ],
  },
}

function defineDemo(product: Product): DemoDefinition {
  const crafted = CRAFTED.find((entry) => entry.productSlug === product.slug)
  if (crafted) return { ...crafted, kind: 'crafted' }

  const ribbon = { tab: SUITE_TAB[product.suite] ?? product.software[0] ?? product.name, panel: product.panel, button: product.name }
  const base = { id: product.demo ?? product.slug, productSlug: product.slug, ribbon, summary: product.tagline }
  if (product.panel === 'Start' && (product.suite === 'folio' || product.suite === 'forge' || product.suite === 'sentinel')) {
    const suite = product.suite
    return {
      ...base,
      kind: 'crafted',
      width: 1080,
      title: product.name,
      summary: 'Browse the ribbon groups, find a tool and review whether it can open in the sample context.',
      basis: ['The launcher matches the installed Revit 2024 layout, panel order and tool labels. Opening a tool leads to its browser simulation.'],
      steps: suiteHomeSteps(suite),
      load: async () => ({ default: (await import('./demos/SuiteHome')).makeSuiteHome(suite) }),
    }
  }
  const studio = studioDemos[product.slug] ?? connectorDemos[product.slug]
  if (studio) return { ...base, kind: 'workflow', width: 1020, frame: 'app', ...studio }

  const layouts = LAYOUTS[product.slug]
  if (layouts?.length) {
    return {
      ...base,
      kind: 'replica',
      width: Math.min(1180, layouts[0].w),
      title: product.name,
      basis: [
        `The ${product.name} simulation uses the dialog’s layout, labels and tooltips as a reference.`,
        'Actions and results use a representative sample scope.',
      ],
      steps: generatedSteps(product.slug),
      load: async () => ({ default: (await import('./GeneratedDemo')).makeGenerated(product.slug) }),
    }
  }

  const command = SENTINEL_COMMANDS[product.slug]
  return {
    ...base,
    kind: 'workflow',
    width: command?.width ?? 660,
    title: product.name,
    basis: command?.basis ?? [
      `This sample scenario follows the command documented by ${product.name}.`,
      'The browser shows illustrative inputs and outcomes for Sample Residence.',
    ],
    steps: command?.steps ?? [
      { id: 'configure', title: 'Choose a sample input', hint: 'Pick an option to see how it affects the outcome.', target: 'flow-choice' },
      { id: 'run', title: 'Run the command', hint: 'Apply the command to the selected sample input.', target: 'flow-run' },
      { id: 'review', title: 'Review the result', hint: 'Inspect the sample results and mark them reviewed.', target: 'flow-review' },
    ],
    load: async () => ({ default: (await import('./FlowDemo')).makeCommand(product) }),
  }
}

export const DEMOS = PRODUCTS.map(defineDemo)
const byId = new Map(DEMOS.map((demo) => [demo.id, demo]))
const byProduct = new Map(DEMOS.map((demo) => [demo.productSlug, demo]))

export const demoById = (id: string) => byId.get(id)
export const demoForProduct = (slug: string) => byProduct.get(slug)
