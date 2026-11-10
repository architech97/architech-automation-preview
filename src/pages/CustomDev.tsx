import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, Clipboard, Mail } from 'lucide-react'
import { CONTACT } from '../data/contact'
import { productBySlug } from '../data/catalog'
import './storefront.css'

const INQUIRIES = {
  custom: {
    label: 'Custom plugin development',
    title: 'Bring us a workflow to automate',
    intro: 'Tell us what your team does by hand, which software it uses, and what the tool should produce.',
    prompt: 'What should the tool do?',
    example: 'Describe the steps today, the input files and the result you need.',
    next: 'We review your brief with you and define the inputs, expected output and scope for a proposal.',
  },
  demo: {
    label: 'Request a guided demo',
    title: 'Request a guided walkthrough',
    intro: 'Choose the ArchiTECH tool or workflow you want to see. Share your host version and the task you want to evaluate.',
    prompt: 'What would you like to see?',
    example: 'Tell us which tool or task you want to see and what you need to evaluate.',
    next: 'We use your task and host version to plan a walkthrough relevant to your team.',
  },
  pricing: {
    label: 'Pricing and licensing',
    title: 'Ask about pricing and licensing',
    intro: 'Share which tools you’re evaluating, your host version and how many people would use them.',
    prompt: 'Which tools are you considering?',
    example: 'Name the suite or plugin and tell us how you plan to use it.',
    next: 'We review the product and team requirements and confirm the available licensing terms.',
  },
  partnership: {
    label: 'Studio or enterprise licensing',
    title: 'Discuss licensing for your studio',
    intro: 'Tell us which tools your team needs, how many people will use them and what deployment looks like.',
    prompt: 'What does your team need?',
    example: 'Outline the tools, number of users and deployment requirements.',
    next: 'We discuss seats, compatible software and rollout requirements before preparing a quote.',
  },
} as const

type InquiryType = keyof typeof INQUIRIES
type EmailDraft = { subject: string; body: string }
const isInquiryType = (value: string | null): value is InquiryType => value !== null && Object.prototype.hasOwnProperty.call(INQUIRIES, value)
const PLATFORMS = ['Revit', 'Rhino', 'SketchUp', 'AutoCAD', 'Blender', 'AI / MCP automation']

export default function CustomDev() {
  const [params] = useSearchParams()
  const product = productBySlug(params.get('product') ?? '')
  const type = params.get('type')
  const plan = params.get('plan')?.trim().slice(0, 100) || undefined
  return <Inquiry key={params.toString()} initialType={isInquiryType(type) ? type : 'custom'} product={product?.name} plan={plan} />
}

function Inquiry({ initialType, product, plan }: { initialType: InquiryType; product?: string; plan?: string }) {
  const [type, setType] = useState(initialType)
  const [draft, setDraft] = useState<EmailDraft>()
  const [copyMessage, setCopyMessage] = useState('')
  const preview = useRef<HTMLTextAreaElement>(null)
  const draftHeading = useRef<HTMLHeadingElement>(null)
  const inquiry = INQUIRIES[type]
  const relevantPlan = type === 'pricing' || type === 'partnership' ? plan : undefined
  const context = [product, relevantPlan].filter(Boolean).join(' · ')

  useEffect(() => {
    if (draft) draftHeading.current?.focus()
  }, [draft])

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name')).trim()
    const message = String(data.get('message')).trim()
    if (!name || !message) {
      const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(name ? '#message' : '#name')
      field?.setCustomValidity(name ? 'Enter a short description of your inquiry.' : 'Enter your name.')
      field?.reportValidity()
      return
    }
    const fields = [
      ['Inquiry', inquiry.label], ['Product', product], ['Plan', relevantPlan], ['Name', name],
      ['Company', data.get('company')], ['Role', data.get('role')], ['Team size', data.get('team')],
      ['Software', data.getAll('platform').join(', ')], ['Host version', data.get('version')],
      ['Timeline', data.get('timeline')],
    ]
    const lines = fields.flatMap(([label, value]) => String(value ?? '').trim() ? [label + ': ' + String(value).trim()] : [])
    setDraft({ subject: '[ArchiTECH Automation] ' + inquiry.label + (product ? ' · ' + product : ''), body: [...lines, '', message].join('\n') })
    setCopyMessage('')
  }

  async function copy() {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft.subject + '\n\n' + draft.body)
      setCopyMessage('Draft copied.')
    } catch {
      preview.current?.focus()
      preview.current?.select()
      setCopyMessage('Draft selected. Use your device’s Copy command.')
    }
  }

  const mailto = draft && 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(draft.subject) + '&body=' + encodeURIComponent(draft.body)
  const resetDraft = () => {
    setDraft(undefined)
    setCopyMessage('')
  }

  return (
    <section className="section storefront-section storefront-inquiry" aria-labelledby="inquiry-title">
      <div className="wrap storefront-inquiry-grid">
        <div className="storefront-inquiry-intro">
          <p className="eyebrow">ArchiTECH Automation inquiries</p>
          <h1 id="inquiry-title">{inquiry.title}</h1>
          <p className="lead">{inquiry.intro}</p>
          {type === 'custom' && (
            <ul className="inquiry-examples" aria-label="Examples of custom development">
              <li>Revit add-ins for documentation and model data</li>
              <li>Studio standards and quality checks</li>
              <li>CAD automation and MCP integrations</li>
            </ul>
          )}
        </div>

        <form className="form storefront-inquiry-form" onSubmit={prepare} onChange={resetDraft}>
          <div className="inquiry-form-heading"><h2>Prepare your inquiry</h2><span>Email draft</span></div>
          <div className="field">
            <label htmlFor="type">Inquiry type</label>
            <select id="type" name="type" value={type} onChange={(event) => {
              const next = event.currentTarget.value
              if (isInquiryType(next)) setType(next)
            }}>
              {Object.entries(INQUIRIES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
            </select>
          </div>
          {context && <p className="inquiry-context">Regarding <strong>{context}</strong></p>}
          <div className="field">
            <label htmlFor="name">Name <small>(required)</small></label>
            <input id="name" name="name" required maxLength={100} autoComplete="name" onInput={(event) => event.currentTarget.setCustomValidity('')} />
          </div>
          <div className="field">
            <label htmlFor="message">{inquiry.prompt} <small>(required)</small></label>
            <textarea id="message" name="message" required rows={4} maxLength={1600} placeholder={inquiry.example}
              onInput={(event) => event.currentTarget.setCustomValidity('')} />
          </div>

          <details className="inquiry-details">
            <summary>Add team and software details <span>Optional</span><ChevronDown size={18} aria-hidden="true" /></summary>
            <div className="inquiry-details-fields">
              <div className="row-2">
                <div className="field"><label htmlFor="company">Company or studio</label><input id="company" name="company" autoComplete="organization" maxLength={120} /></div>
                <div className="field"><label htmlFor="role">Role</label><input id="role" name="role" autoComplete="organization-title" maxLength={100} /></div>
              </div>
              <div className="row-2">
                <div className="field"><label htmlFor="team">Team size</label><select id="team" name="team"><option value="">Choose…</option><option>1</option><option>2–10</option><option>11–50</option><option>51–200</option><option>200+</option></select></div>
                <div className="field"><label htmlFor="timeline">Timeline</label><select id="timeline" name="timeline"><option value="">Choose…</option><option>As soon as possible</option><option>Within a month</option><option>This quarter</option><option>Exploring options</option></select></div>
              </div>
              <fieldset className="inquiry-platforms">
                <legend>Software</legend>
                <div className="check-grid">{PLATFORMS.map((item) => (
                  <label key={item} className="check-pill"><input type="checkbox" name="platform" value={item} />{item}</label>
                ))}</div>
              </fieldset>
              <div className="field"><label htmlFor="version">Desktop host version</label><input id="version" name="version" maxLength={80} placeholder="For example, Revit 2024" /></div>
            </div>
          </details>

          <p className="inquiry-help">Review the draft below, then send it from your own email app.</p>
          <button className="btn btn-primary inquiry-prepare" type="submit">Prepare email draft <ArrowRight size={17} aria-hidden="true" /></button>
          {draft && (
            <section className="inquiry-draft" aria-labelledby="draft-title">
              <h3 id="draft-title" tabIndex={-1} ref={draftHeading}>Review your email draft</h3>
              <p>To {CONTACT.email}</p>
              <textarea ref={preview} aria-label="Email draft" readOnly value={draft.subject + '\n\n' + draft.body} rows={7} />
              <div>
                <a className="btn btn-primary btn-sm" href={mailto}><Mail size={16} aria-hidden="true" /> Open email app</a>
                <button type="button" className="btn btn-ghost btn-sm" onClick={copy}><Clipboard size={16} aria-hidden="true" /> Copy draft</button>
              </div>
              {copyMessage && <p role="status">{copyMessage}</p>}
            </section>
          )}
        </form>

        <aside className="storefront-inquiry-next" aria-labelledby="inquiry-next-title">
          <h2 id="inquiry-next-title">What happens next</h2>
          <p>{inquiry.next}</p>
          <a href={'mailto:' + CONTACT.email}><Mail size={16} aria-hidden="true" /> {CONTACT.email}</a>
          {type === 'demo' && <Link to="/demos">Explore browser demos <ArrowRight size={16} aria-hidden="true" /></Link>}
          {(type === 'pricing' || type === 'partnership') && <Link to="/pricing">Compare licensing options <ArrowRight size={16} aria-hidden="true" /></Link>}
        </aside>
      </div>
    </section>
  )
}
