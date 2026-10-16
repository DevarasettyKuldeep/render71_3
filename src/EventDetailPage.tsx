import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './App.css'

const API = 'https://render72.pages.dev/api/test/events'

type Schedule = {
  event_date: string
  start_time: string
  end_time: string
  venue: string
}

type Prize = {
  rank: number
  title: string
  amount: number
  description: string
}

type FAQ = {
  question: string
  answer: string
}

type Organizer = {
  id: string
  name: string
  org_type: string
}

type Coordinator = {
  id: string
  name: string
  role: string
  contact: string
}

type EventDetail = {
  id: string
  name: string
  blurb: string
  description: string
  category: string
  tags: string[]
  event_type: string
  event_mode: string
  event_status: string
  is_featured: boolean
  is_technical: boolean
  cover_image_url: string
  cover_image_alt: string
  banner_image_url: string
  banner_image_alt: string
  gallery_images: string[]
  highlights: string[]
  what_to_expect: string[]
  eligibility: string[]
  prerequisites: string[]
  rules: string[]
  prizes: Prize[]
  faqs: FAQ[]
  schedules: Schedule[]
  price: number
  is_per_head: boolean
  min_teamsize: number
  max_teamsize: number
  total_seats: number
  seats_filled: number
  registration_deadline: string
  registration_status: string
  organizers: Organizer[]
  coordinators: Coordinator[]
  schedule_summary: {
    start_date: string
    start_time: string
    end_date: string
    end_time: string
  }
}

const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${iso}T12:00:00`))

const money = (amount: number) => (amount === 0 ? 'Free' : `₹${amount.toLocaleString('en-IN')}`)

const statusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return '#00e5cc';
    case 'SOLD_OUT': return '#ff6b6b';
    case 'CLOSED': return '#9fb3bc';
    default: return '#9fb3bc';
  }
}

function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const r = await fetch(`${API}/${id}`)
        if (!r.ok) throw Error('Could not reach the event service.')
        const d = await r.json()
        if (d.event) setEvent(d.event)
        else throw Error('Event not found.')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong while loading event details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (!id) return null

  if (loading) {
    return (
      <main className="shell" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: '800px' }} />
      </main>
    )
  }

  if (error || !event) {
    return (
      <main className="shell" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
        <h2>Couldn't load event</h2>
        <p style={{ color: 'var(--muted)' }}>{error || 'Event not found.'}</p>
        <Link to="/" className="hero-cta">← Back to events</Link>
      </main>
    )
  }

  const seatsLeft = Math.max(event.total_seats - event.seats_filled, 0)
  const isOpen = event.registration_status === 'OPEN'

  return (
    <main aria-label="Event details page">
      <nav className="nav shell">
        <Link className="brand" to="/"><span>g</span>ather</Link>
        <div className="navlinks">
          <Link to="/">Discover</Link>
          <Link to="#how">How it works</Link>
        </div>
      </nav>

      <header className="event-hero" style={{ backgroundImage: `url(${event.banner_image_url})` }} aria-label={event.name}>
        <div className="events-inner event-hero-inner">
          <p className="eyebrow">{event.category} · {event.event_mode} · {event.event_type}</p>
          <h1>{event.name}</h1>
          <div className="meta-row">
            <span><strong>{dateLabel(event.schedule_summary.start_date)}</strong> <small>{event.schedule_summary.start_time} – {event.schedule_summary.end_time}</small></span>
            <span><strong>{event.schedules[0]?.venue || 'TBA'}</strong></span>
            <span className="status-pill" style={{ background: statusColor(event.registration_status), color: event.registration_status === 'OPEN' ? '#0c1111' : '#fff' }}>
              {event.registration_status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <div className="shell" style={{ padding: '64px 0 96px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '48px' }}>
        <article>
          <section className="detail-section" aria-labelledby="about-heading">
            <h2 id="about-heading">About this event</h2>
            <p className="event-description">{event.description}</p>
          </section>

          {event.highlights?.length && (
            <section className="detail-section" aria-labelledby="highlights-heading">
              <h2 id="highlights-heading">Why go</h2>
              <ul className="highlights">
                {event.highlights.map((h, i) => <li key={i}>✳ {h}</li>)}
              </ul>
            </section>
          )}

          {event.what_to_expect?.length && (
            <section className="detail-section" aria-labelledby="expect-heading">
              <h2 id="expect-heading">What to expect</h2>
              <ul className="highlights">
                {event.what_to_expect.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </section>
          )}

          {event.gallery_images?.length && (
            <section className="detail-section" aria-labelledby="gallery-heading">
              <h2 id="gallery-heading">Gallery</h2>
              <div className="gallery-grid" role="list">
                {event.gallery_images.map((img, i) => (
                  <img key={i} src={img} alt={`${event.name} gallery ${i + 1}`} loading="lazy" role="listitem" />
                ))}
              </div>
            </section>
          )}

          {event.schedules?.length > 1 && (
            <section className="detail-section" aria-labelledby="schedule-heading">
              <h2 id="schedule-heading">Schedule</h2>
              <dl className="schedule-list">
                {event.schedules.map((s, i) => (
                  <div key={i} className="schedule-item">
                    <dt>{dateLabel(s.event_date)}</dt>
                    <dd>{s.start_time} – {s.end_time} · {s.venue}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {event.rules?.length && (
            <section className="detail-section" aria-labelledby="rules-heading">
              <h2 id="rules-heading">Rules</h2>
              <ol className="rules">
                {event.rules.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </section>
          )}

          {(event.eligibility?.length || event.prerequisites?.length) && (
            <section className="detail-section" aria-labelledby="requirements-heading">
              <h2 id="requirements-heading">Eligibility & Prerequisites</h2>
              {event.eligibility?.length && (
                <>
                  <h3>Eligibility</h3>
                  <ul className="highlights">
                    {event.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </>
              )}
              {event.prerequisites?.length && (
                <>
                  <h3>Prerequisites</h3>
                  <ul className="highlights">
                    {event.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </>
              )}
            </section>
          )}

          {event.faqs?.length && (
            <section className="detail-section" aria-labelledby="faqs-heading">
              <h2 id="faqs-heading">FAQs</h2>
              <dl className="faq-block">
                {event.faqs.map((f, i) => (
                  <div key={i} className="faq-block">
                    <dt>{f.question}</dt>
                    <dd>{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {event.organizers?.length && (
            <section className="detail-section" aria-labelledby="organizers-heading">
              <h2 id="organizers-heading">Organizers</h2>
              <ul className="people-row">
                {event.organizers.map((o) => (
                  <li key={o.id}><strong>{o.name}</strong> <small>{o.org_type}</small></li>
                ))}
              </ul>
            </section>
          )}

          {event.coordinators?.length && (
            <section className="detail-section" aria-labelledby="coordinators-heading">
              <h2 id="coordinators-heading">Coordinators</h2>
              <ul className="people-row">
                {event.coordinators.map((c) => (
                  <li key={c.id}><strong>{c.name}</strong> <small>{c.role}</small> <a href={`mailto:${c.contact}`}>{c.contact}</a></li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="event-detail-sidebar" aria-labelledby="details-heading">
          <div className="sidebar-card">
            <h2 id="details-heading" className="eyebrow">Event Details</h2>
            <dl className="detail-list">
              <div><dt>Entry</dt><dd>{money(event.price)}{event.is_per_head ? ' / person' : ''}</dd></div>
              <div><dt>Team size</dt><dd>{event.min_teamsize === 1 ? 'Solo friendly' : `${event.min_teamsize}–${event.max_teamsize} people`}</dd></div>
              <div><dt>Seats left</dt><dd>{seatsLeft} of {event.total_seats}</dd></div>
              <div><dt>Registration</dt><dd>{new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(event.registration_deadline))}</dd></div>
              <div><dt>Status</dt><dd><span className="status-pill" style={{ background: statusColor(event.registration_status), color: event.registration_status === 'OPEN' ? '#0c1111' : '#fff' }}>{event.registration_status.replace('_', ' ')}</span></dd></div>
              <div><dt>Type</dt><dd>{event.event_type}</dd></div>
              <div><dt>Mode</dt><dd>{event.event_mode}</dd></div>
              {event.is_technical && <div><dt>Technical</dt><dd>Yes</dd></div>}
            </dl>

            {event.prizes?.length && (
              <div className="prize-row" style={{ marginTop: '24px' }}>
                <h3 className="eyebrow">Prizes</h3>
                {event.prizes.map((p) => (
                  <div key={p.rank} className="prize-row">
                    <span className="rank">{p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'} {p.title}</span>
                    <span className="amount">{money(p.amount)}</span>
                    <small>{p.description}</small>
                  </div>
                ))}
              </div>
            )}

            <div className="sidebar-cta" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isOpen && (
                <a href="#" className="hero-cta" style={{ textAlign: 'center', textDecoration: 'none' }}>Register now</a>
              )}
              <Link to="/" className="hero-cta" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)', textAlign: 'center' }}>← Back to all events</Link>
            </div>
          </div>

          {event.tags?.length && (
            <div className="sidebar-card" style={{ marginTop: '16px' }}>
              <h3 className="eyebrow">Tags</h3>
              <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {event.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer>
        <div className="shell">
          <Link className="brand" to="/"><span>g</span>ather</Link>
          <p>Made for people who make plans.</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  )
}

export default EventDetailPage
