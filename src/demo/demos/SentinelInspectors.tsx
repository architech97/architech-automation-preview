import { useState } from 'react'
import { Btn, RevitDialog } from '../ui'
import type { DemoContext } from '../types'
import { downloadCsv } from './craftedTools'

const LINKS = [
  { id: 611701, name: 'Structure.rvt', kind: 'RVT', pinned: true },
  { id: 611712, name: 'Interiors.rvt', kind: 'RVT', pinned: false },
  { id: 611750, name: 'Site-survey.dwg', kind: 'CAD', pinned: false },
]
const PIN_ACTIONS = [
  { label: 'Pin all links', pin: true, kind: 'all' },
  { label: 'Unpin all links', pin: false, kind: 'all' },
  { label: 'Pin RVT links', pin: true, kind: 'RVT' },
  { label: 'Pin CAD links', pin: true, kind: 'CAD' },
]
type PinAction = (typeof PIN_ACTIONS)[number]

export function PinLinks({ theme, setTheme, done, rewind, notify, close }: DemoContext) {
  const [links, setLinks] = useState(LINKS)
  const [action, setAction] = useState<PinAction>()
  const [receipt, setReceipt] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const targets = (next: PinAction) => links.filter((link) => (next.kind === 'all' || link.kind === next.kind) && link.pinned !== next.pin)

  const apply = () => {
    if (!action) return
    const affected = targets(action)
    const ids = new Set(affected.map((link) => link.id))
    setLinks(links.map((link) => ids.has(link.id) ? { ...link, pinned: action.pin } : link))
    const outcome = affected.length + ' sample link placements ' + (action.pin ? 'pinned.' : 'unpinned.')
    setReceipt(outcome)
    setAction(undefined)
    notify({ kind: 'success', text: outcome })
    done('run')
  }

  return (
    <RevitDialog theme={theme} onTheme={setTheme} eyebrow="Arch Sentinel / Links" title="Pin / Unpin Links"
      caption={action ? 'Confirm pin state change' : 'Sample Residence · Link placement report'} onClose={action ? () => setAction(undefined) : close}
      footer={action ? <>
        <Btn onClick={() => setAction(undefined)}>Cancel</Btn>
        <Btn primary={action.pin} danger={!action.pin} demo="flow-run" onClick={apply}>{action.pin ? 'Pin' : 'Unpin'}</Btn>
      </> : <>
        <span className="ad-status" role="status">{receipt || 'Choose an action for the current link placements.'}</span>
        {receipt && <Btn primary disabled={reviewed} demo="flow-review" onClick={() => { setReviewed(true); done('review') }}>Mark reviewed</Btn>}
        <Btn onClick={() => notify({ kind: 'info', text: 'Refreshed the current sample link placements.' })}>Refresh</Btn>
        <Btn onClick={close}>Close</Btn>
      </>}>
      {action ? <div className="ad-result">
        <strong>Set {targets(action).length} current link placements to {action.pin ? 'PINNED' : 'UNPINNED'}?</strong>
        <p>{targets(action).map((link) => `${link.name} (ID ${link.id})`).join(' · ')}</p>
        <p>In Revit, one Undo restores this action.</p>
      </div> : <>
        <div className="ad-row"><span className="ad-note">{links.length} placements · {links.filter((link) => link.pinned).length} pinned</span></div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Kind</th><th>Link Name</th><th>Element ID</th><th>Pin State</th></tr></thead>
            <tbody>{links.map((link) => <tr key={link.id}>
              <td>{link.kind}</td><td>{link.name}</td><td>{link.id}</td><td><span className={`ad-pill ${link.pinned ? 'ok' : 'warn'}`}>{link.pinned ? 'Pinned' : 'Unpinned'}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="ad-row" data-demo="flow-choice" role="group" aria-label="Link pinning commands">
          {PIN_ACTIONS.map((next, index) => <Btn key={next.label} primary={index === 0} danger={!next.pin} disabled={targets(next).length === 0} onClick={() => {
            rewind('configure')
            done('configure')
            setReviewed(false)
            setReceipt('')
            setAction(next)
          }}>{next.label}</Btn>)}
        </div>
      </>}
    </RevitDialog>
  )
}

const FAMILIES = [
  { id: 721045, name: 'Reception Millwork', category: 'Casework', instances: 22, severity: 'Critical', recommendation: 'High instance count · convert to a loadable family' },
  { id: 721063, name: 'Test Plinth', category: 'Generic Models', instances: 0, severity: 'Warning', recommendation: 'Unused · review for purge' },
  { id: 721056, name: 'Lobby Bulkhead', category: 'Generic Models', instances: 2, severity: 'Info', recommendation: 'Low use · convert when possible' },
]

export function InPlaceInspector({ theme, setTheme, done, rewind, notify, close }: DemoContext) {
  const [families, setFamilies] = useState(FAMILIES)
  const [selected, setSelected] = useState<number>()
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const family = families.find(({ id }) => selected === id)

  const report = (text: string) => {
    setResult(text)
    setReviewed(false)
    done('run')
    notify({ kind: 'info', text })
  }
  const inspect = (show: boolean) => {
    if (!family) return
    const result = family.instances === 0 ? family.name + ' has no sample instances.'
      : show ? `Isolated ${family.instances} sample instances of ${family.name} in ArchiTECH Inspector 3D.`
        : `Selected ${family.instances} sample instances of ${family.name}.`
    report(result)
  }
  const remove = () => {
    if (!family) return
    setFamilies(families.filter(({ id }) => id !== family.id))
    setSelected(undefined)
    setConfirm(false)
    report(`Deleted ${family.name} and ${family.instances} instances from the sample.`)
  }

  return (
    <RevitDialog theme={theme} onTheme={setTheme} eyebrow="Arch Sentinel / Model Health" title={confirm ? 'Delete Family' : 'In-Place Families Inspector'}
      caption="Sample Residence · In-place family inventory" onClose={confirm ? () => setConfirm(false) : close}
      footer={confirm ? <>
        <Btn onClick={() => setConfirm(false)}>Cancel</Btn>
        <Btn danger onClick={remove}>Delete Family</Btn>
      </> : <>
        <span className="ad-status" role="status">{result || 'Select a family to inspect its instances.'}</span>
        {result && <Btn primary disabled={reviewed} demo="flow-review" onClick={() => { setReviewed(true); done('review') }}>Mark reviewed</Btn>}
        <Btn onClick={() => downloadCsv('in-place-families-sample.csv', ['Family Name', 'Category', 'Instances', 'Severity', 'Recommendation'], families.map((row) => [row.name, row.category, row.instances, row.severity, row.recommendation]))}>Download sample CSV</Btn>
        <Btn onClick={close}>Close</Btn>
      </>}>
      {confirm && family ? <div className="ad-result">
        <strong>Delete {family.name} and all {family.instances} of its instances from the sample?</strong>
        <p>In Revit, Undo is available while the model remains open.</p>
      </div> : <>
        <div className="ad-row"><span className="ad-note">{families.length} in-place families · {families.filter((row) => row.instances >= 20).length} critical · {families.filter((row) => row.instances === 0).length} unused · {families.reduce((total, row) => total + row.instances, 0)} instances</span></div>
        <div className="ad-table-wrap" data-demo="flow-choice">
          <table className="ad-table">
            <thead><tr><th>Family Name</th><th>Category</th><th>Instances</th><th>Severity</th><th>Recommendation</th></tr></thead>
            <tbody>{families.map((row) => <tr key={row.id} className={selected === row.id ? 'sel' : ''}>
              <td><button type="button" className="crafted-row-action" aria-pressed={selected === row.id} onClick={() => {
                rewind('configure')
                done('configure')
                setSelected(row.id)
                setResult('')
              }}>{row.name}</button></td>
              <td>{row.category}</td><td>{row.instances}</td><td><span className={`ad-pill ${row.severity === 'Critical' ? 'err' : row.severity === 'Warning' ? 'warn' : 'info'}`}>{row.severity}</span></td><td className="wrap">{row.recommendation}</td>
            </tr>)}
              {families.length === 0 && <tr><td colSpan={5}>No in-place families remain in the sample.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="ad-row">
          <Btn primary disabled={!family} demo="flow-run" onClick={() => inspect(true)}>Show in 3D View</Btn>
          <Btn disabled={!family} onClick={() => inspect(false)}>Select</Btn>
          <Btn danger disabled={!family} onClick={() => setConfirm(true)}>Delete Family</Btn>
        </div>
      </>}
    </RevitDialog>
  )
}
