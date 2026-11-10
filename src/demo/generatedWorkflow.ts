import { fixtureResult } from './generatedFixtures'

export interface WorkflowField { label: string; value: string }
export interface WorkflowRecord { label: string; columns: Record<string, string> }
interface WorkflowInput {
  slug: string
  action: string
  fields: WorkflowField[]
  records: WorkflowRecord[]
}
export interface WorkflowResult {
  summary: string
  rows: { label: string; value: string }[]
}

export const MATERIALS = ['Paint – Warm White', 'Concrete – Exposed', 'Oak – Natural', 'Porcelain – Matt Grey']
export const TEMPLATE_NAMES = ['Architectural Plan – 1:50', 'Interior RCP – 1:50', 'Building Elevation – 1:100']

const field = (fields: WorkflowField[], name: RegExp) => fields.find(({ label }) => name.test(label))?.value ?? ''
const resultRow = (label: string, value: string) => ({ label, value })

function millimetres(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(mm|cm|m)?$/i)
  if (!match) return NaN
  return Number(match[1]) * ({ m: 1000, cm: 10, mm: 1 }[match[2]?.toLowerCase() ?? 'mm'] ?? 1)
}

export function simulatedResult({ slug, action, fields, records }: WorkflowInput): WorkflowResult | string {
  const get = (name: RegExp) => field(fields, name)
  const value = (record: WorkflowRecord, ...columns: string[]) => columns.map((column) => record.columns[column]).find((item) => item && item !== '—') ?? ''
  const rowResults = (format: (record: WorkflowRecord, index: number) => string) => records.map((record, index) => resultRow(record.label, format(record, index)))

  switch (slug) {
    case 'section-box': {
      const padding = millimetres(get(/padding/i))
      if (!Number.isFinite(padding) || padding > 100000) return 'Enter padding between 0 and 100,000 mm. You can use mm, cm, or m.'
      return {
        summary: 'Applied the sample selection bounds to an orthographic 3D view.',
        rows: [
          resultRow('Padding on each face', `${padding} mm`),
          resultRow('Resulting extents', [4.2, 3.6, 3.15].map((extent) => (extent + padding / 500).toFixed(2)).join(' × ') + ' m'),
          resultRow('Isolation', get(/temporarily isolate/i) || 'Off'),
        ],
      }
    }
    case 'deviation-inspector': {
      const tolerance = Number(get(/^tolerance/i))
      const max = Number(get(/maximum points/i))
      const spacing = Number(get(/^spacing/i))
      if (!Number.isFinite(tolerance) || tolerance <= 0 || !Number.isSafeInteger(max) || max <= 0 || !Number.isFinite(spacing) || spacing <= 0) {
        return 'Enter positive tolerance and spacing in millimetres, and a positive whole number for the sample limit.'
      }
      const metric = get(/^evaluate$/i)
      const column = metric === 'Mean' ? 'Avg deviation' : metric === 'Maximum' ? 'Maximum' : 'P95'
      let misses = 0
      let measured = 0
      const rows = rowResults((record) => {
        const samples = Math.min(max, Math.floor(Number(value(record, 'Samples')) * Math.min(1, 30.48 / spacing)))
        const reading = parseFloat(value(record, column))
        if (samples < 5 || !Number.isFinite(reading)) return 'Unmeasured · fewer than 5 valid sample points'
        measured++
        if (reading > tolerance) misses++
        return `${reading} mm · ${reading > tolerance ? 'Above tolerance' : 'Within tolerance'} · ${samples} points`
      })
      return { summary: `${misses} of ${measured} measured records exceed ${tolerance} mm (${metric}).`, rows }
    }
    case 'reorder-pro': {
      const start = Number(get(/^start at$/i))
      const step = Number(get(/^step$/i))
      const digits = Number(get(/^digits/i))
      if (!/^-?\d+$/.test(get(/^start at$/i)) || !Number.isSafeInteger(start) || !Number.isSafeInteger(step) || step < 1 || !Number.isInteger(digits) || digits < 0 || digits > 8 || !Number.isSafeInteger(start + records.length * step)) {
        return 'Enter a whole start number, a positive whole step and between 0 and 8 digits.'
      }
      const rows = rowResults((record, index) => {
        const currentNumber = start + (get(/^increment each element$/i) === 'Off' ? 0 : index) * step
        const number = (currentNumber < 0 ? '-' : '') + String(Math.abs(currentNumber)).padStart(digits, '0')
        const prefix = get(/^prefix$/i)
        const suffix = get(/^suffix$/i)
        const separator = get(/^separator$/i)
        const next = [prefix, number, suffix].filter(Boolean).join(separator)
        const current = value(record, 'Current Value')
        return current === next ? `${current} · already matches` : `${current} → ${next}`
      })
      return { summary: `Prepared numbering for ${rows.length} sample elements using ${get(/^write to$/i) || 'Mark'}.`, rows }
    }
    case 'replace-materials': {
      const source = get(/^material to replace$/i)
      const replacement = get(/^replacement material$/i)
      if (!source || !replacement || source === replacement) return 'Choose two different materials before scanning or replacing.'
      const types = [3, 2, 4, 2][MATERIALS.indexOf(source)] ?? 0
      const scope = get(/^work scope$/i)
      const count = scope === 'Selection' ? 1 : scope === 'Active view' || scope === 'Selected rooms' ? Math.min(types, 2) : types
      return {
        summary: `${action === 'Scan impact' ? 'Found' : 'Prepared replacements for'} ${count} in-scope ${count === 1 ? 'type' : 'types'} in the sample model.`,
        rows: [
          resultRow('Material change', `${source} → ${replacement}`),
          resultRow('Type handling', get(/^type changes$/i) || 'Duplicate system types in scope'),
          resultRow('Outside the work scope', `${types - count} sample types retain their original material`),
        ],
      }
    }
    case 'point-cloud-slicer': {
      const bottom = Number(get(/^bottom offset/i))
      const top = Number(get(/^top offset/i))
      const buffer = Number(get(/^xy planar buffer/i))
      const outputs = [get(/generate 3d/i) === 'On' ? '3D section box' : '', get(/generate cropped 2d/i) === 'On' ? 'cropped floor plan' : ''].filter(Boolean)
      if (![bottom, top, buffer].every(Number.isFinite) || buffer < 0 || Math.max(Math.abs(bottom), Math.abs(top), buffer) > 10000) return 'Enter offsets between −10,000 and 10,000 mm, with a nonnegative XY buffer.'
      if (!outputs.length) return 'Choose a 3D section box, a cropped floor plan, or both.'
      if (records.some((record) => Number.parseFloat(value(record, 'Story Height')) + top <= bottom)) return 'The bottom offset must leave a positive slice height at every selected level.'
      return {
        summary: `Prepared ${records.length * outputs.length} sample views with ${buffer} mm horizontal clearance.`,
        rows: rowResults((record) => {
          const start = Number.parseFloat(value(record, 'Elevation'))
          const end = start + Number.parseFloat(value(record, 'Story Height'))
          return `${outputs.join(' and ')} · ${start + bottom}–${end + top} mm`
        }),
      }
    }
    case 'compliance-guard': {
      const pin = action === 'Pin selected'
      const remove = action === 'Delete reviewed candidates'
      const rows = rowResults((record) => {
        const issue = value(record, 'SOP Issue')
        if (pin) return issue.startsWith('Unpinned') ? 'Coordination link pinned in the sample' : `${issue} · unchanged`
        if (remove) return issue.startsWith('Imported') ? 'Reviewed CAD line style queued for removal in the sample' : `${issue} · unchanged`
        return `${issue} · ${value(record, 'View / Location')}`
      })
      return { summary: pin || remove ? 'Reviewed the selected sample issues against the chosen fix.' : `Found ${records.length} sample compliance findings.`, rows }
    }
    case 'room-height-adjust':
      return { summary: 'Prepared room upper limits from the first valid ceiling above each room.', rows: rowResults((record) => `${value(record, 'Height now')} → ${value(record, 'New height')} · ${value(record, 'Change')}`) }
    case 'room-level-assigner':
      return { summary: 'Prepared target-level assignments and retained the sample room numbers.', rows: rowResults((record) => `${value(record, 'Current Level')} → ${value(record, 'Target Level')}`) }
    case 'text-tag-align': {
      const horizontal = action === 'Align Horizontally'
      return {
        summary: `Aligned three sample annotation heads to the primary reference’s ${horizontal ? 'vertical position' : 'horizontal position'}.`,
        rows: [[24, 30], [46, 44], [72, 24]].map(([x, y], index) => resultRow(`Annotation AT-${index + 2}`, `(${x}, ${y}) → (${horizontal ? x : 12}, ${horizontal ? 36 : y}) mm`)),
      }
    }
    case 'detail-view':
      return {
        summary: action === 'Place on sheets' ? 'Prepared placements for each level’s sample detail views.' : 'Prepared a wall section and ceiling, floor, and wall detail callouts for each level.',
        rows: rowResults((record) => action === 'Place on sheets' ? `A-${record.label === 'Roof' ? '503' : record.label.endsWith('02') ? '502' : '501'} · ${record.label} details` : 'Wall section · Ceiling junction · Floor edge · Wall head'),
      }
    case 'spell-check': {
      const words: Record<string, string> = { 'A-101': 'CONCETE → CONCRETE', 'A-102': 'PARTITON → PARTITION', 'A-501': 'SEPERATION → SEPARATION' }
      return { summary: `Found ${records.length} terms to review against the sample project dictionary.`, rows: rowResults((record) => words[record.label.split(' ')[0]] ?? 'No issue') }
    }
    case 'make-pattern': {
      const scale = Number(get(/^scale multiplier/i))
      const rotation = Number(get(/^rotation/i))
      if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(rotation) || !get(/^rotation/i).trim()) return 'Enter a positive scale multiplier and a numeric rotation.'
      const kind = get(/^patterntarget$/i) || 'Model Pattern'
      const angle = ((rotation % 360) + 360) % 360
      return {
        summary: action === 'Export PAT File' ? 'Prepared a sample PAT definition.' : 'Built a sample fill pattern from the selected linework.',
        rows: [
          resultRow('Pattern', get(/pattern name/i)),
          resultRow('Target', kind),
          resultRow('Repeat spacing', `${Number((100 * scale).toFixed(2))} mm`),
          resultRow('Rotation', `${angle}°`),
          resultRow('Filled region', get(/^create filled region$/i) || 'Off'),
        ],
      }
    }
    case 'parameter-colorizer':
      return { summary: `Prepared color overrides for ${records.length} sample value groups.`, rows: rowResults((record) => `${value(record, 'Elements')} elements · ${value(record, 'Color')}`) }
    case 'scope-box-synchronizer':
      return {
        summary: 'Compared the sample host scope boxes with the master link.',
        rows: rowResults((record) => `${value(record, 'Status')} · ${value(record, 'Source Link Extents')}${value(record, 'Drift (mm)') ? ` · ${value(record, 'Drift (mm)')} mm drift` : ''}`),
      }
    case 'off-axis-resolver': {
      const tolerance = Number(get(/accidental tolerance|^tolerance/i) || 1)
      if (!Number.isFinite(tolerance) || tolerance <= 0 || tolerance > 45) return 'Enter an accidental angle tolerance greater than 0° and no more than 45°.'
      const fixing = /^fix/i.test(action)
      return {
        summary: `Reviewed ${records.length} sample offsets against the nearest orthogonal axis at a ${tolerance}° tolerance.`,
        rows: rowResults((record) => {
          const route = value(record, 'Route')
          const deviation = parseFloat(value(record, 'Deviation'))
          return route === 'Review only' || deviation > tolerance
            ? `${value(record, 'Current')} · ${value(record, 'Reason') || 'Requires review'} · unchanged`
            : `${value(record, 'Current')} → ${value(record, 'Target')} · ${fixing ? 'Corrected in sample' : route}`
        }),
      }
    }
    case 'structural-qa': {
      const beams = get(/^inspection mode$/i) === 'Beam endpoint contact'
      const rows = beams
        ? [{ label: 'Beam B-01 · Grid A/1', value: 'Endpoint intersects support · Pass' }, { label: 'Beam B-02 · Grid B/2', value: '18 mm endpoint gap · Review' }]
        : rowResults((record) => `${value(record, 'QA Status')} · ${value(record, 'Measured Deviation / Reference')}`)
      return { summary: beams ? 'Checked sample beam endpoint contact.' : 'Checked the selected sample columns against their nearest grid intersection.', rows }
    }
    case 'template-manager':
      if (action === 'Transfer Selected Templates') {
        const source = get(/pick an open model/i)
        const target = get(/^copy to$/i)
        const mode = get(/already exists|conflict/i)
        if (!source || !target || source === target) return 'Choose a destination model different from the source.'
        return { summary: `Prepared template transfer to ${target}.`, rows: rowResults((record) => record.label === TEMPLATE_NAMES[0] ? `Already in destination · ${mode || 'Overwrite'}` : 'New in destination · copy') }
      }
      break
    case 'update-schedule': {
      const overwrite = get(/also overwrite/i) === 'On'
      return { summary: `Prepared spreadsheet edits with conflicting values ${overwrite ? 'included' : 'skipped'}.`, rows: rowResults((record, index) => index === 1 && !overwrite ? 'Conflict · kept the current Revit value' : `${value(record, 'Now in Revit')} → ${value(record, 'From the file')}`) }
    }
  }
  return {
    summary: fixtureResult(slug, action, records.length || undefined),
    rows: records.length
      ? rowResults((record) => Object.entries(record.columns).filter(([, item]) => item && item !== '—').slice(2, 5).map(([name, item]) => `${name}: ${item}`).join(' · ') || 'Included in this sample operation')
      : fields.filter(({ value: item }) => item !== '' && item !== 'Off').slice(0, 5),
  }
}
