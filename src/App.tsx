import { useEffect, useMemo, useState } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import EventDetailPage from './EventDetailPage'

const API = 'https://render72.pages.dev/api/test/events'

type EventItem = {
  id: string; name: string; blurb: string; cover_image_url: string; cover_image_alt: string; category: string; tags: string[]; event_mode: string; event_type: string; event_status: string; is_featured: boolean; is_technical: boolean; price: number; is_per_head: boolean; min_teamsize: number; max_teamsize: number; total_seats: number; seats_filled: number; registration_status: string; registration_deadline: string; schedule_summary: { start_date: string; start_time: string; end_date?: string; end_time?: string };
  description?: string; highlights?: string[];
}

const dateLabel = (iso: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${iso}T12:00:00`))
const money = (a: number) => (a === 0 ? 'Free' : `₹${a.toLocaleString('en-IN')}`)

const statusColor = (s: string) => { switch(s) { case 'OPEN': return '#9fff9d'; case 'SOLD_OUT': return '#ff8a8a'; case 'CLOSED': return '#8888aa'; default: return '#8888aa'; } }

function EventCard({ event, onClick }: { event: EventItem; onClick: () => void }) {
  const seatsLeft = Math.max(event.total_seats - event.seats_filled, 0)
  return (
    <article className="event-card" onClick={onClick} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }} role="button" aria-label={`View ${event.name} details`}>
      <div className="event-card-image">
        <img src={event.cover_image_url} alt={event.cover_image_alt} loading="lazy" />
        {event.is_featured && <span className="badge">Featured</span>}
        <div className="date-pill"><b>{dateLabel(event.schedule_summary.start_date)}</b><small>{event.schedule_summary.start_time}</small></div>
        <span className="arrow-icon" aria-hidden="true">↗</span>
      </div>
      <div className="event-card-body">
        <div className="cat">{event.category} · {event.event_mode}</div>
        <h3>{event.name}</h3>
        <p>{event.blurb}</p>
        <div className="event-card-footer">
          <span className="tags">{event.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}</span>
          <div className="meta-row">
            <span className="dot" style={{ background: statusColor(event.registration_status) }} aria-label={event.registration_status} />
            <span>{seatsLeft} left</span>
            <span>{money(event.price)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function LandingPage() {
  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/"><span>g</span>ather</Link>
        <div className="navlinks">
          <Link to="/events" aria-current={typeof window !== 'undefined' && window.location.pathname === '/events' ? 'page' : undefined}>Discover</Link>
          <Link to="#how">How it works</Link>
        </div>
        <Link className="navcta" to="/events">Explore events <b>↗</b></Link>
      </nav>

      <main aria-label="Landing page">

      <section className="hero">
        <div className="bg-glow" aria-hidden="true">
          <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        </div>
        <div className="hero-inner">
          <p className="eyebrow">THE CAMPUS CALENDAR, CURATED</p>
          <h1>Make your next<br /><em>memory.</em></h1>
          <p className="hero-copy">From maker nights to moonlit music — find the rooms, people and ideas worth showing up for.</p>
          <Link className="hero-cta" to="/events">Find an event <b>↘</b></Link>
          <div className="hero-deco" aria-hidden="true"><div className="hero-deco-inner" /></div>
        </div>
      </section>

      <section className="marquee-strip" aria-hidden="true">
        <div className="track">WORKSHOPS ✦ FESTIVALS ✦ TALKS ✦ COMPETITIONS ✦ WORKSHOPS ✦ FESTIVALS ✦ TALKS ✦ COMPETITIONS ✦</div>
      </section>

      <section className="statement">
        <div className="statement-inner">
          <p className="eyebrow">WHY GATHER</p>
          <h2>Less searching.<br /><em>More showing up.</em></h2>
          <p>Thoughtful discovery for the things happening around you — designed to make a full calendar feel human again.</p>
        </div>
      </section>

      <section className="steps" id="how">
        <div className="steps-inner">
          <p className="eyebrow" style={{ marginBottom: 32 }}>SIMPLE BY DESIGN</p>
          <div className="steps-grid">
            {[
              ['01', 'Discover', 'Browse what\'s happening, without the noise.'],
              ['02', 'Decide', 'Get the details you need in a single glance.'],
              ['03', 'Show up', 'Make room for a story worth telling later.'],
            ].map(s => (
              <article key={s[0]} className="steps-card">
                <span className="num">{s[0]}</span>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <Link className="brand" to="/"><span>g</span>ather</Link>
          <p>Made for people who make plans.</p>
          <a href="#how">Back to top ↑</a>
        </div>
      </footer>
    </main>
    </>
  )
}

function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(API)
      if (!r.ok) throw new Error('Could not reach the event service.')
      const d = await r.json()
      if (!Array.isArray(d.events)) throw new Error('Unexpected data format.')
      setEvents(d.events)
    } catch (e: any) {
      setError(e.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.category)))], [events])
  const shown = useMemo(() => events.filter(e => (filter === 'All' || e.category === filter) && (`${e.name} ${e.category} ${e.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))), [events, filter, query])
  const featured = events.find(e => e.is_featured) ?? events[0]

  const open = (e: EventItem) => navigate(`/events/${e.id}`)

  return (
    <main aria-label="Events list page">
      <nav className="nav">
        <Link className="brand" to="/"><span>g</span>ather</Link>
        <div className="navlinks">
          <Link to="/events" aria-current={typeof window !== 'undefined' && window.location.pathname === '/events' ? 'page' : undefined}>Discover</Link>
          <Link to="#how">How it works</Link>
        </div>
        <Link className="navcta" to="/">Back home <b>↗</b></Link>
      </nav>

      <section className="events-section" id="discover">
        <div className="events-inner">
          <div className="section-head">
            <h2>Choose your<br /><em>moment.</em></h2>
            <p>Real events, one clear place. No endless group-chat scrolling.</p>
          </div>

          <div className="search-bar">
            <label>
              <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(176,168,200,0.5)', fontSize: 16 }}>⌕</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, interests..." aria-label="Search events" style={{ paddingLeft: 44 }} />
            </label>
            <button onClick={load} disabled={loading} aria-label="Reload events">↻</button>
          </div>

          <div className="filters" role="tablist" aria-label="Event categories">
            {categories.map(c => (
              <button key={c} role="tab" aria-selected={filter === c} className={filter === c ? 'active' : ''} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>

          {error ? (
            <div className="empty-state" role="alert"><strong>We couldn't load the events.</strong><br /><small>{error}</small><br /><button onClick={load} style={{ marginTop: 12, padding: '10px 22px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Try again</button></div>
          ) : loading ? (
            <div className="event-grid" aria-busy="true">
              {[1,2,3,4,5,6].map(n => <div key={n} className="event-card" style={{ minHeight: 360, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }} />)}
            </div>
          ) : (
            <>
              {featured && !query && filter === 'All' && (
                <Link to={`/events/${featured.id}`} className="featured-card">
                  <img src={featured.cover_image_url} alt={featured.name} loading="eager" />
                  <div className="featured-card-content">
                    <i>EDITOR'S PICK</i>
                    <h2>{featured.name}</h2>
                    <p>{featured.blurb}</p>
                    <span className="view-link">View details ↗</span>
                  </div>
                  <div className="featured-date"><b>{dateLabel(featured.schedule_summary.start_date)}</b><small>{featured.schedule_summary.start_time}</small></div>
                </Link>
              )}
              {shown.length ? (
                <div className="event-grid" role="list">
                  {shown.map(e => <EventCard key={e.id} event={e} onClick={() => open(e)} />)}
                </div>
              ) : (
                <div className="empty-state">No events match that search. Try another word or category.</div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="statement">
        <div className="statement-inner">
          <p className="eyebrow">WHY GATHER</p>
          <h2>Less searching.<br /><em>More showing up.</em></h2>
          <p>Thoughtful discovery for the things happening around you — designed to make a full calendar feel human again.</p>
        </div>
      </section>

      <section className="steps" id="how">
        <div className="steps-inner">
          <p className="eyebrow" style={{ marginBottom: 32 }}>SIMPLE BY DESIGN</p>
          <div className="steps-grid">
            {[
              ['01', 'Discover', 'Browse what\'s happening, without the noise.'],
              ['02', 'Decide', 'Get the details you need in a single glance.'],
              ['03', 'Show up', 'Make room for a story worth telling later.'],
            ].map(s => (
              <article key={s[0]} className="steps-card">
                <span className="num">{s[0]}</span>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <Link className="brand" to="/"><span>g</span>ather</Link>
          <p>Made for people who make plans.</p>
          <a href="#discover">Back to events ↑</a>
        </div>
      </footer>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
    </Routes>
  )
}

export default App
