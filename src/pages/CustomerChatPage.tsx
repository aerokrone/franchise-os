import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Menu, MessageSquarePlus, Mic } from 'lucide-react'

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string }

const starter: ChatMsg[] = [
  {
    id: 'a1',
    role: 'assistant',
    text:
      'Hi — I’m Franchise Support. Ask about your orders, pickup times, delivery, or anything about Mid Valley Cafe & our shop.',
  },
]

export function CustomerChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>(starter)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = useCallback(() => {
    const t = draft.trim()
    if (!t) return
    const id = `u-${Date.now()}`
    const rid = `a-${Date.now()}`
    setMessages((m) => [
      ...m,
      { id, role: 'user', text: t },
      {
        id: rid,
        role: 'assistant',
        text:
          "Thanks for your message. In this demo there's no live AI — your note is stored locally. For orders, use My orders in the top bar or contact the store.",
      },
    ])
    setDraft('')
  }, [draft])

  return (
    <div className="customer-chat-page">
      <aside className="customer-chat-rail">
        <button type="button" className="customer-chat-rail__new">
          <MessageSquarePlus size={18} strokeWidth={2} aria-hidden />
          New chat
        </button>
        <div className="customer-chat-rail__label">Recent</div>
        <button type="button" className="customer-chat-rail__item is-active">
          Help — Mid Valley
        </button>
        <button type="button" className="customer-chat-rail__item muted">
          Delivery & pickup
        </button>
        <button type="button" className="customer-chat-rail__item muted">
          Returns policy
        </button>
      </aside>

      <div className="customer-chat-main">
        <header className="customer-chat-header">
          <button type="button" className="customer-chat-header__menu" aria-label="Menu">
            <Menu size={20} strokeWidth={2} />
          </button>
          <div className="customer-chat-header__title">
            <span className="customer-chat-header__name">Franchise Support</span>
            <span className="customer-chat-header__status">
              <span className="pulse" aria-hidden />
              Online · typical reply under 2 min
            </span>
          </div>
        </header>

        <div ref={listRef} className="customer-chat-stream">
          {messages.map((m) => (
            <div key={m.id} className={`customer-chat-bubble customer-chat-bubble--${m.role}`}>
              <div className="customer-chat-bubble__text">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="customer-chat-composer-outer">
          <div className="customer-chat-composer">
            <textarea
              className="customer-chat-input"
              rows={1}
              placeholder="Message Franchise Support…"
              value={draft}
              aria-label="Message"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <div className="customer-chat-composer__foot">
              <span className="muted" style={{ fontSize: 12 }}>
                Demo: no backend · Enter to send
              </span>
              <div className="customer-chat-composer__actions">
                <button type="button" className="customer-chat-iconbtn" aria-label="Voice input">
                  <Mic size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="customer-chat-send"
                  aria-label="Send"
                  disabled={!draft.trim()}
                  onClick={send}
                >
                  <ArrowUp size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
          <p className="customer-chat-disclaimer">AI assistant demo. Don’t share passwords or card numbers.</p>
        </div>
      </div>
    </div>
  )
}
