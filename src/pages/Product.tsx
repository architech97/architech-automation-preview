import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, CheckCircle2, ShieldCheck, PlayCircle, MessageSquare } from 'lucide-react'
import { DEMO_PROJECT } from '../data/demoProject'
import { PRODUCTS, productBySlug } from '../data/catalog'
import { productCompatibility } from '../data/compatibility'
import { suiteById } from '../data/suites'
import { demoById } from '../demo/registry'
import type { DemoDefinition } from '../demo/types'
import { DialogGallery } from '../components/DialogGallery'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Layout'
import { asset } from '../components/Brand'
import NotFound from './NotFound'
import './product-evidence.css'

const DemoPlayer = lazy(() => import('../demo/DemoPlayer').then((module) => ({ default: module.DemoPlayer })))

const WORKFLOW_EXAMPLES: Partial<Record<string, { input: string; result: string; reference?: string }>> = {
  'sheet-export': { input: 'AT-01 drawing sheets and one or more export formats', result: 'Review output filenames and download a sample manifest or drawing register.' },
  'parameter-manager': { input: 'An Asset Tag project parameter bound to Doors and Windows', result: 'Apply the definition to sample data and export the resulting parameter list to CSV.' },
  'model-health': { input: 'Selected inventory categories in the AT-01 sample model', result: 'Review the inventory and export a sample Model Health report.' },
  'sheet-manager': {
    input: 'A-101 Ground Floor Plan and A-102 First Floor Plan',
    result: 'Check the occupied A-102 number, then issue the two plans as GA-101 and GA-102.',
  },
  'room-to-view': {
    input: '101 Living Room and 102 Kitchen',
    result: 'Create plans and elevations, then see which views fit the selected sheet layout.',
  },
  'room-to-finishes': {
    input: 'Rooms 101, 102, 103 and 105 with a floor, ceiling and lining type',
    result: 'Review 12 planned rows, including Kitchen’s existing ceiling and the skipped Entrance Hall curtain wall.',
  },
  'warnings-inspector': {
    input: 'Critical warnings and wall element 301178',
    result: 'Review six affected element IDs and download the CSV for all nine warning groups.',
  },
  'architech-i3d': {
    input: 'Prepared chair mesh or Dragon photo or mesh, with a known height in millimetres',
    result: 'Review family save, load and placement as separate sample outcomes.',
    reference: 'Chair and Dragon sample fixtures',
  },
  'architech-assistant': {
    input: 'The active Revit view, or wall 401284 and its instance Comments value',
    result: 'Inspect the Cover view response or review a proposed Comments update and check the resulting value.',
  },
  'revit-mcp': {
    input: 'A sheet number and an A1 title block for Building Sections',
    result: 'Check a proposed write, then verify the new sheet in the sample index or see why a duplicate number is refused.',
  },
  'autocad-mcp': {
    input: 'Door, chair and desk blocks in the sample fit-out drawing',
    result: 'Inspect block quantities grouped by name and layer.',
  },
  'rhino-mcp': {
    input: 'One of two plinth sizes in millimetres',
    result: 'Review the creation call, then verify the solid’s layer, measured bounds and volume.',
  },
  'sketchup-mcp': {
    input: 'A 100 × 200 mm group with a +300 mm or −300 mm extrusion',
    result: 'Inspect the measured world-space limits above or below the origin.',
  },
  'blender-mcp': {
    input: 'An eye-level camera route or a low route through a furnished room',
    result: 'Check the route against an 80 mm clearance and see which path is accepted.',
  },
}

const DEMO_FORMATS = {
  crafted: {
    label: 'Guided browser demo',
    description: 'Work through a specific task with sample inputs and check what changes.',
  },
  replica: {
    label: 'Dialog workflow',
    description: 'Use the reconstructed Revit controls to run a sample task and inspect the result.',
  },
  workflow: {
    label: 'Browser workflow',
    description: 'Run the sample scenario and inspect the illustrated result.',
  },
}

// A few exported descriptions grouped the whole workflow under safeguards.
const FEATURE_SECTIONS: Record<string, { capabilities: string[]; safeguards: string[] }> = {
  'off-axis-resolver': {
    capabilities: ['Scan for elements whose XY angle has drifted off orthogonal.', 'Review the proposed corrections and apply eligible fixes in one undoable step.'],
    safeguards: ['Grid lines are preview-only. A sketch line can be corrected when its loop still closes.'],
  },
  'model-health': {
    capabilities: ['Choose rule checks, export options and the report folder.', 'Review searchable tables with column filters and sorting.', 'Export a CSV from any report section.'],
    safeguards: [],
  },
  'match-opening': {
    capabilities: ['Detect rectangular wall openings in a selected Revit link.', 'Preview the matches on host model walls.'],
    safeguards: ['Creating or resizing an opening requires confirming its match.'],
  },
  'manage-text': {
    capabilities: ['Change case, clean up text, or preview a regular-expression replacement.', 'Merge notes, adjust their spacing and alignment, or edit their text types.', 'Find text across sheets and views, then round-trip edits through CSV.'],
    safeguards: ['Each run is grouped into one undoable step.'],
  },
  'spell-check': {
    capabilities: ['Check spelling with Hunspell and SymSpell.', 'Review spelling results in an interactive HTML report.'],
    safeguards: [],
  },
}

const CHAIR_PREVIEW = 'media/i3d/chair-mesh.png'
const DRAGON_PLACEMENT = 'media/i3d/revit-placement-0.6.36.webp'

const DESKTOP_PREVIEWS: Record<string, { src: string; title: string; alt: string }> = {
  'architech-i3d': {
    src: 'media/native/i3d-material.webp',
    title: 'Material workspace',
    alt: 'I3D Desktop showing a textured chair and its mesh budget',
  },
  'architech-assistant': {
    src: 'media/native/assistant-modes.webp',
    title: 'Ask, Search and Build',
    alt: 'Assistant desktop workspace with Ask, Search and Build modes',
  },
  'revit-mcp': {
    src: 'media/native/revit-mcp-connector.webp',
    title: 'Connector status',
    alt: 'Native Revit MCP Connector showing that it is ready for MCP clients',
  },
}

function ProductDemo({ demo }: { demo: DemoDefinition }) {
  const format = DEMO_FORMATS[demo.kind]
  const section = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(() => window.location.hash === '#demo' || typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (ready || !section.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setReady(true)
    }, { rootMargin: '220px 0px' })
    observer.observe(section.current)
    const openOnHash = () => {
      if (window.location.hash === '#demo') setReady(true)
    }
    window.addEventListener('hashchange', openOnHash)
    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', openOnHash)
    }
  }, [ready])

  return (
    <section ref={section} className="section product-section" id="demo" aria-labelledby="product-demo-title">
      <div className="wrap-wide">
        <div className="section-head">
          <div>
            <span className="eyebrow">{format.label}</span>
            <h2 id="product-demo-title">{demo.title}</h2>
            <p className="product-demo-note">{format.description}</p>
          </div>
          <Link className="btn btn-ghost" to={'/demos/' + demo.id}>Open demo page <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        {ready ? (
          <Suspense fallback={<p className="product-demo-pending" role="status">Loading browser demo…</p>}>
            <DemoPlayer demo={demo} />
          </Suspense>
        ) : <div className="product-demo-pending" aria-hidden="true" />}
        <details className="product-provenance">
          <summary>Demo sources and scope</summary>
          <ul>{demo.basis.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </details>
      </div>
    </section>
  )
}

export default function Product() {
  const { slug = '' } = useParams()
  const p = productBySlug(slug)
  if (!p) return <NotFound />
  const suite = suiteById(p.suite)
  const demo = p.demo ? demoById(p.demo) : undefined
  const format = demo ? DEMO_FORMATS[demo.kind] : undefined
  const example = WORKFLOW_EXAMPLES[p.slug]
  const compatibility = productCompatibility(p)
  const dialog = p.dialogs[0]
  const dialogImage = dialog?.dark ?? dialog?.light
  const desktopPreview = DESKTOP_PREVIEWS[p.slug]
  const hasChairPreview = p.slug === 'architech-i3d'
  const { capabilities, safeguards } = FEATURE_SECTIONS[p.slug] ?? p
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.suite === p.suite && x.panel === p.panel).concat(PRODUCTS.filter((x) => x.slug !== p.slug && x.suite === p.suite && x.panel !== p.panel)).slice(0, 3)
  const isRevitTool = ['folio', 'forge', 'sentinel'].includes(p.suite)
  const detailLink = `/custom-development?type=pricing&product=${p.slug}`
  const demoLink = demo ? '/demos/' + demo.id : undefined

  return (
    <article className="product-page">
      <section className="p-hero">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/plugins">Plugins</Link><span>/</span><Link to={`/plugins?suite=${p.suite}`}>{suite.name}</Link><span>/</span><span>{p.name}</span>
          </nav>
          <div className="p-hero-grid">
            <div className="product-intro">
              <span className="suite-tag" style={{ ['--suite' as string]: suite.color }}>{suite.name} · {p.panel}</span>
              <h1>{p.name}</h1>
              <p className="lead">{p.tagline}</p>
              <div className="hero-cta">
                {format && <a className="btn btn-primary" href="#demo"><PlayCircle size={18} aria-hidden="true" /> Try live demo</a>}
                <Link className={`btn ${format ? 'btn-ghost' : 'btn-primary'}`} to={detailLink}><MessageSquare size={17} aria-hidden="true" /> Enquire</Link>
              </div>
              {example ? (
                <section className="product-scenario" aria-label="Sample workflow">
                  <p className="product-scenario-label">{format?.label} <span>{example.reference ?? DEMO_PROJECT.code + ' · ' + DEMO_PROJECT.name}</span></p>
                  <dl>
                    <div><dt>Input</dt><dd>{example.input}</dd></div>
                    <div><dt>Review</dt><dd>{example.result}</dd></div>
                  </dl>
                </section>
              ) : format && demo && (
                <section className="product-scenario" aria-label="Sample workflow">
                  <p className="product-scenario-label">{format.label} <span>Sample data</span></p>
                  <p className="product-format-note">{demo.summary}</p>
                </section>
              )}
            </div>
            <aside className="product-dossier" aria-label="Product reference and compatibility">
              {dialogImage && (
                <a className="product-plate" href="#dialog-reference">
                  <div className="product-plate-image"><img src={asset(dialogImage)} alt={p.name + ' · ' + dialog.title} decoding="async" /></div>
                  <div className="product-plate-caption">
                    <span><strong>{dialog.title}</strong><small>{dialog.source === 'reconstructed' ? 'Dialog reconstruction' : 'Dialog layout render'} · Sample data</small></span>
                    <ArrowDown size={17} aria-hidden="true" />
                  </div>
                </a>
              )}
              {desktopPreview && demoLink && (
                <Link className="product-plate" to={demoLink + '#native-build'}>
                  <div className="product-plate-image"><img src={asset(desktopPreview.src)} alt={desktopPreview.alt} decoding="async" /></div>
                  <div className="product-plate-caption">
                    <span><strong>{desktopPreview.title}</strong><small>Captured in the installed application</small></span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </div>
                </Link>
              )}
              <div className="product-spec">
                <h2>Compatibility</h2>
                <dl>
                  {compatibility.host && <div><dt>{p.slug === 'architech-assistant' ? 'Model integration' : 'Host'}</dt><dd>{compatibility.host}</dd></div>}
                  {p.revit.length > 0 && <div><dt>Revit package {p.revit.length === 1 ? 'target' : 'targets'}</dt><dd>{p.revit.join(' · ')}</dd></div>}
                  <div><dt>Platform</dt><dd>{compatibility.platform}</dd></div>
                  {isRevitTool && <div><dt>Revit ribbon</dt><dd>{suite.name} › {p.panel}</dd></div>}
                </dl>
                <p>{compatibility.scope}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section product-section" aria-labelledby="product-workflow-title">
        <div className="wrap product-workflow">
          <div className="product-overview">
            <span className="eyebrow">Workflow</span>
            <h2 id="product-workflow-title">What it solves</h2>
            {p.problem && <p>{p.problem}</p>}
            {!capabilities.length && !safeguards.length && p.description !== p.tagline && <p>{p.description}</p>}
          </div>
          <div className="product-feature-panel">
            {capabilities.length > 0 && (
              <div>
                <h3>Capabilities</h3>
                <ul className="feature-list">
                  {capabilities.map((c) => <li key={c}><CheckCircle2 size={18} aria-hidden="true" /><span>{c}</span></li>)}
                </ul>
              </div>
            )}
            {safeguards.length > 0 && (
              <div>
                <h3>Checks and safeguards</h3>
                <ul className="feature-list">
                  {safeguards.map((c) => <li key={c}><ShieldCheck size={18} aria-hidden="true" /><span>{c}</span></li>)}
                </ul>
              </div>
            )}
            {p.requirements && (
              <div>
                <h3>System requirements</h3>
                <ul>{p.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {demo && <ProductDemo key={demo.id} demo={demo} />}

      {(p.dialogs.length > 0 || p.media?.length) && (
        <section className="section product-section" id="dialog-reference">
          <div className="wrap">
            <Reveal className="section-head">
              <div><span className="eyebrow">Product reference</span><h2>{p.dialogs.length ? 'Plugin dialogs' : 'Desktop captures and illustrations'}</h2></div>
              {p.dialogs.length > 0 && <p className="lead">Review {p.dialogs.length === 1 ? 'the dialog' : p.dialogs.length + ' dialogs'} with sample data and enlarge any view to inspect the controls.</p>}
            </Reveal>
            {p.dialogs.length > 0 && <Reveal><DialogGallery key={p.slug} dialogs={p.dialogs} name={p.name} /></Reveal>}
            {p.media && (
              <div className={hasChairPreview ? 'grid-2 product-media-pair' : 'grid-3 product-media-grid'}>
                {hasChairPreview && (
                  <figure id="desktop-chair-preview" className="product-media">
                    <img src={asset(CHAIR_PREVIEW)} alt="Upholstered chair in the textured I3D Desktop Material workspace" loading="lazy" />
                    <figcaption>
                      <strong>Captured in I3D Desktop</strong>
                      <span>Chair geometry and texture at the desktop preview stage, before export.</span>
                    </figcaption>
                  </figure>
                )}
                {p.media.map((media) => {
                  const placement = media.src === DRAGON_PLACEMENT
                  const label = placement ? 'Recorded in Revit 2024' : media.kind === 'animation' ? 'Workflow illustration' : 'Desktop capture'
                  return (
                    <figure key={media.src} id={placement ? 'recorded-placement' : undefined} className="product-media">
                      <img src={asset(media.src)} alt={media.alt} loading="lazy" />
                      <figcaption>
                        <strong>{label}</strong>
                        <span>{placement ? 'Dragon placement from a separate desktop validation run.' : media.alt}</span>
                      </figcaption>
                    </figure>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section product-section product-enquiry">
        <div className="wrap">
          <div>
            <span className="eyebrow">Licensing and rollout</span>
            <h2>Discuss {p.name} for your team</h2>
            <p>Tell us your host version, team size and workflow. We’ll use those details to discuss fit and licensing.</p>
          </div>
          <Link className="btn btn-primary" to={detailLink}>Enquire <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section product-section">
          <div className="wrap">
            <div className="section-head"><div><span className="eyebrow">Related</span><h2>More in {suite.name}</h2></div><Link className="btn btn-ghost" to={`/plugins?suite=${p.suite}`}>All {suite.short} products <ArrowRight size={17} /></Link></div>
            <div className="grid-3">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
          </div>
        </section>
      )}
    </article>
  )
}
