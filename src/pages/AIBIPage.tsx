import { useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import content from '../data/content-details.json'
import { ModuleTitlerow } from '../components/ModuleTitlerow'

const page = content.pages['ai-bi'] as typeof content.pages['ai-bi'] & {
  moduleTitlerow?: { lead: string }
}

export function AIBIPage() {
  const nlq = page.elements.find((e) => e.id === 'nlq-hero')!.content as {
    badge?: { text: string }
    title: string
    subtitle: string
    suggestedQueries: string[]
    input: { placeholder: string; actionButton: { label: string } }
  }

  const resp = page.elements.find((e) => e.id === 'ai-response')!.content as {
    answer: string
    visualization: { data: { outlet: string; change: number }[] }
    followUp: string
  }

  const anomalies = page.elements.find((e) => e.id === 'anomalies-card')!.content as {
    items: { outlet: string; description: string; severity: string }[]
  }

  const [show, setShow] = useState(false)
  const runQuery = () => setShow(true)
  const badgeLabel = nlq.badge?.text ?? 'Natural Language Query'

  return (
    <div className={`stack-page stack-page--ai-chat${show ? ' stack-page--ai-chat-has-results' : ''}`}>
      <ModuleTitlerow
        align="center"
        lead={page.moduleTitlerow?.lead ?? 'Insights'}
        meta={
          <>
            {badgeLabel} · <b>{nlq.suggestedQueries.length}</b> suggested prompts
          </>
        }
      />
      <div className="ai-chat-landing">
        <div className={`ai-chat-landing__hero${show ? ' ai-chat-landing__hero--compact' : ''}`}>
          <div className="ai-chat-landing__hero-inner">
            <div className="ai-chat-landing__eyebrow">
              <span className="ai-chat-landing__eyebrow-icon" aria-hidden="true">
                <Sparkles size={18} strokeWidth={2} />
              </span>
              <span>{badgeLabel}</span>
            </div>
            <p className="ai-chat-landing__subtitle">{nlq.subtitle}</p>

            <div className="ai-chat-landing__composer">
              <div className="ai-chat-landing__field">
                <input
                  className="ai-chat-landing__input"
                  type="text"
                  placeholder={nlq.input.placeholder}
                  aria-label={nlq.input.placeholder}
                  onKeyDown={(e) => e.key === 'Enter' && runQuery()}
                />
                <button
                  type="button"
                  className="ai-chat-landing__send"
                  onClick={runQuery}
                  aria-label={nlq.input.actionButton.label}
                  title={nlq.input.actionButton.label}
                >
                  <Send size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="ai-chat-landing__chips">
                {nlq.suggestedQueries.map((q) => (
                  <button key={q} type="button" className="ai-chat-landing__chip" onClick={runQuery}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {show ? (
        <div className="ai-chat-landing__results">
          <section className="stack-section reveal d1">
            <div className="ai-chat-result-head">
              <div className="ai-chat-result-head__icon">
                <Bot size={16} strokeWidth={2} />
              </div>
              <div>
                <strong>AI Response</strong>
                <div className="panel-sub">Confidence 84%</div>
              </div>
            </div>
            <p className="ai-chat-result__answer muted">{resp.answer}</p>
            <div className="bar-mini">
              {resp.visualization.data.map((d) => (
                <div
                  key={d.outlet}
                  className={`bar${d.change < 0 ? ' neg' : ''}`}
                  style={{ height: `${Math.max(15, Math.abs(d.change) * 3)}%` }}
                  title={`${d.outlet}: ${d.change}%`}
                />
              ))}
            </div>
            <p className="ai-chat-result__follow">{resp.followUp}</p>
          </section>

          <div className="ai-chat-landing__grid2">
            <section className="stack-section reveal d2">
              <h2>7-Day Sales Forecast</h2>
              <p className="muted">All outlets · 80% confidence interval</p>
              <p className="ai-chat-forecast-val">RM 41,500 expected</p>
            </section>
            <section className="stack-section reveal d3">
              <h2>Anomalies Detected</h2>
              <ul className="anomaly-list">
                {anomalies.items.map((a) => (
                  <li key={a.outlet + a.description}>
                    <span className={a.severity === 'high' ? 'sev-high' : 'sev-med'}>{a.severity}</span>
                    <div className="ai-chat-anomaly-outlet">{a.outlet}</div>
                    <div className="muted">{a.description}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
