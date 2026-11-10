import type { Product } from './types'

interface ProductCompatibility {
  platform: string
  host: string
  scope: string
}

// Connector package payload has a distinct add-in for each listed Revit year.
export const REVIT_MCP_PACKAGE_TARGETS = ['2024', '2025', '2026', '2027']

const CONSOLIDATED_FOLIO_KEYS = new Set(['ManageText', 'ManageDimension', 'TemplateManager'])

// Compatibility claims reflect packaging inputs and scoped native validation records.
const EXTRA_COMPATIBILITY: Partial<Record<string, ProductCompatibility>> = {
  'architech-i3d': {
    platform: 'Windows 10/11 x64',
    host: 'Full Revit 2024 for RFA export',
    scope: 'The documented desktop package targets Windows x64. The Revit family export workflow has native validation in Revit 2024.',
  },
  'revit-mcp': {
    platform: 'Windows x64',
    host: 'Autodesk Revit and an MCP client',
    scope: 'The connector package contains builds for all listed years. The documented native approval and readback exercise used Revit 2024.',
  },
  'architech-assistant': {
    platform: 'Windows desktop · .NET 8',
    host: 'ArchiTECH Revit MCP for model operations',
    scope: 'The desktop app uses a local or server model. The documented native approval and readback exercise used the separate Connector in Revit 2024.',
  },
  'autocad-mcp': {
    platform: 'Windows',
    host: 'Autodesk AutoCAD 2025',
    scope: 'The release guide specifies AutoCAD 2025. Its native QA recorded line creation, movement, deletion and independent readback.',
  },
  'rhino-mcp': {
    platform: 'Windows',
    host: 'Rhino 8',
    scope: 'The Windows package builds against the Rhino 8 SDK. Native connector checks used Rhino 8.35.',
  },
  'sketchup-mcp': {
    platform: 'Windows',
    host: 'SketchUp 2026',
    scope: 'The deployed Ruby extension and matching MCP server were exercised in SketchUp 2026 on Windows.',
  },
  'blender-mcp': {
    platform: 'Windows',
    host: 'Blender 5.2.0 validation host',
    scope: 'The Windows release was exercised with Blender 5.2.0 on the validation workstation using representative native scene fixtures.',
  },
}

export function productCompatibility(product: Product): ProductCompatibility {
  const extra = EXTRA_COMPATIBILITY[product.slug]
  if (extra) return extra
  if (product.panel === 'Start' || product.key === 'PointCloudVisibility') {
    return {
      platform: 'Windows · .NET Framework 4.8',
      host: 'Autodesk Revit 2024',
      scope: product.panel === 'Start'
        ? 'This launcher is part of the installed suite ribbon.'
        : 'This command ships in the Point Cloud Tools split button alongside Point Cloud Slicer.',
    }
  }
  return {
    platform: 'Windows · .NET Framework 4.8',
    host: 'Autodesk Revit',
    scope: CONSOLIDATED_FOLIO_KEYS.has(product.key)
      ? 'The current suite source configures this tool for Revit 2024, and its add-in is registered in that host. The earlier suite package predates this consolidated tool.'
      : 'The suite installer registers this C# add-in in Revit 2024.',
  }
}
