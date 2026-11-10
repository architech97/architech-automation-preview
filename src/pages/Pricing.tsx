import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { STATS, productBySlug } from '../data/catalog'
import { suiteById } from '../data/suites'
import './storefront.css'

const plans = [
  {
    name: 'Suite subscription',
    fit: 'One discipline',
    detail: 'Choose Arch Folio for documentation, Arch Forge for model data and production, or Arch Sentinel for model review.',
    inquiry: 'Ask about a suite',
  },
  {
    name: 'ArchiTECH Complete',
    fit: 'The full Revit workflow',
    detail: `Compare access to all ${STATS.revitTools} catalogued tools across Arch Folio, Arch Forge and Arch Sentinel.`,
    inquiry: 'Ask about Complete',
  },
  {
    name: 'Studio & Enterprise',
    fit: 'Deployment across a team',
    detail: 'Discuss seat count, supported hosts, rollout needs and any custom workflows you want to include.',
    inquiry: 'Request a studio quote',
  },
] as const

const questions = [
  ['Which Revit version should I specify?', 'The three Revit suites list Revit 2024. Check the individual product page for supported hosts and versions, and include your version in your inquiry.'],
  ['Can I test a tool before asking about licensing?', 'Every catalog product has a browser exercise on sample data. You can also request a guided walkthrough of a specific tool.'],
  ['How are commercial terms confirmed?', 'Share the product, host version and number of users. We can then confirm availability, licence terms and the scope of any deployment support.'],
] as const

export default function Pricing() {
  const [params] = useSearchParams()
  const product = productBySlug(params.get('product') ?? '')
  const suite = product ? suiteById(product.suite) : undefined
  const outsideRevitSuites = product?.suite === 'i3d' || product?.suite === 'ai'

  const inquiryLink = (type: 'pricing' | 'partnership' | 'demo', plan?: string) => {
    const query = new URLSearchParams({ type })
    if (plan) query.set('plan', plan)
    if (product && (!outsideRevitSuites || !plan || type === 'partnership')) query.set('product', product.slug)
    return '/custom-development?' + query.toString()
  }

  return (
    <div className="storefront-pricing">
      <section className="section storefront-section" aria-labelledby="pricing-title">
        <div className="wrap">
          <div className="storefront-page-heading">
            <div>
              <p className="eyebrow">Pricing &amp; licensing</p>
              <h1 id="pricing-title">Licensing for your BIM team</h1>
            </div>
            <p className="lead">Compare a single Revit suite, the complete Revit collection and licensing for a studio. Pricing and commercial terms are confirmed by inquiry.</p>
          </div>

          {product && (
            <div className="storefront-product-context">
              <p><span>Selected product</span><Link to={'/plugins/' + product.slug}>{product.name}</Link> <small>{suite?.name}</small></p>
              <Link to={inquiryLink('pricing')}>Ask about this product <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          )}

          <div className="licensing-options" aria-labelledby="licensing-options-title">
            <div className="licensing-options-heading">
              <h2 id="licensing-options-title">Revit licensing options</h2>
              <span>Quote by inquiry</span>
            </div>
            <ol>
              {plans.map((plan, index) => (
                <li key={plan.name}>
                  <span className="licensing-index" aria-hidden="true">0{index + 1}</span>
                  <div><h3>{plan.name}</h3><p className="licensing-fit">{plan.fit}</p></div>
                  <p className="licensing-detail">{plan.detail}</p>
                  <Link className="btn btn-ghost btn-sm" to={inquiryLink(index === 2 ? 'partnership' : 'pricing', plan.name)}>
                    {plan.inquiry} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <aside className="licensing-addons" aria-label="I3D and connectors">
            <div><h2>I3D, Assistant &amp; MCP connectors</h2><p>Ask about availability for the tool and desktop host you use.</p></div>
            <Link className="btn btn-primary btn-sm" to={outsideRevitSuites ? inquiryLink('pricing') : '/custom-development?type=pricing'}>
              Ask about I3D or connectors <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <section className="section storefront-section licensing-questions" aria-labelledby="licensing-questions-title">
        <div className="wrap">
          <div>
            <p className="eyebrow">Before you buy</p>
            <h2 id="licensing-questions-title">Licensing questions</h2>
            <Link to={inquiryLink('demo')}>Request a guided walkthrough <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="faq">
            {questions.map(([question, answer]) => (
              <details key={question}><summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary><p>{answer}</p></details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
