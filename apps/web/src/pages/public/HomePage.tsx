import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUpRight, AtSign } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'

import { AdminLoginDialog } from '../../components/public/AdminLoginDialog'
import { HomeNavigation } from '../../components/public/HomeNavigation'
import { PageMeta } from '../../components/PageMeta'
import { articleQueries } from '../../features/articles/article-queries'
import { homepageQueries } from '../../features/homepage/homepage-api'
import type { ArticleSummary } from '../../types/article'
import type { HomepageContent, HomepageLocation } from '../../types/homepage'
import './home-page.css'

const fallbackHomepage: HomepageContent = {
  id: 'home',
  name: 'Hüseyin Tepe',
  eyebrow: 'Independent developer / Personal archive',
  role: 'Software, writing & digital experiments',
  locations: [
    { city: 'Berlin', timeZone: 'Europe/Berlin' },
    { city: 'Istanbul', timeZone: 'Europe/Istanbul' },
  ],
  aboutHeadline: 'I came,\nI wandered,\nI learned —\nnow I write.',
  aboutNote: 'Notes shaped by curiosity, practice, and experience.',
  currently: 'Berlin / Istanbul',
  interests: 'Systems, interfaces, creative code',
  instagramLabel: 'tepee.huseyin',
  instagramUrl: 'https://www.instagram.com/tepee.huseyin/',
  collageImages: Array.from(
    { length: 12 },
    (_, index) => `/images/home-collage/collage-${String(index + 1).padStart(2, '0')}.jpg`,
  ),
  updatedAt: '',
}

export function HomePage() {
  const [activeSection, setActiveSection] = useState(1)
  const homepageQuery = useQuery(homepageQueries.public())
  const content = homepageQuery.data ?? fallbackHomepage

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-home-section]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleSection) {
          setActiveSection(Number((visibleSection.target as HTMLElement).dataset.homeSection))
        }
      },
      { threshold: [0.45, 0.7] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="home-experience">
      <PageMeta description={content.aboutNote} />
      <HomeChrome activeSection={activeSection} />
      <section className="home-panel hero-panel" id="identity" data-home-section="1">
        <Collage images={content.collageImages} />
        <div className="hero-panel__veil" />
        <div className="hero-panel__content">
          <p className="eyebrow">{content.eyebrow}</p>
          <motion.h1
            aria-label={content.name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {content.name.toLocaleUpperCase('tr-TR').split(' ').map((word, wordIndex) => (
              <span className="name-word" key={word}>
                {Array.from(word).map((letter, letterIndex) => {
                  const animationIndex = wordIndex * 8 + letterIndex

                  return (
                    <span
                      aria-hidden="true"
                      className="name-letter"
                      key={`${letter}-${letterIndex}`}
                      style={{ '--letter-index': animationIndex } as CSSProperties}
                    >
                      {letter}
                    </span>
                  )
                })}
              </span>
            ))}
          </motion.h1>
          <p className="hero-panel__role">{content.role}</p>
        </div>
        <CityTimes locations={content.locations} />
        <a className="hero-scroll" href="#recent-notes">
          <span>Scroll to enter</span>
          <ArrowDown aria-hidden="true" />
        </a>
      </section>

      <LatestArticlesSection />

      <section className="home-panel about-panel" id="personal-note" data-home-section="3">
        <div className="section-heading">
          <p className="eyebrow">03 / Personal note</p>
          <span className="section-heading__line" />
        </div>
        <div className="about-panel__body">
          <h2>{content.aboutHeadline.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h2>
          <div className="about-panel__note">
            <p>{content.aboutNote}</p>
            <dl>
              <div>
                <dt>Currently</dt>
                <dd>{content.currently}</dd>
              </div>
              <div>
                <dt>Interested in</dt>
                <dd>{content.interests}</dd>
              </div>
            </dl>
            <Link className="text-link" to="/articles">
              Explore the archive <ArrowUpRight aria-hidden="true" />
            </Link>
            <a
              className="text-link"
              href={content.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <AtSign aria-hidden="true" /> {content.instagramLabel}
            </a>
          </div>
        </div>
        <p className="about-panel__footer">© {new Date().getFullYear()} {content.name}</p>
      </section>
    </div>
  )
}

function HomeChrome({ activeSection }: { activeSection: number }) {
  const onDarkSection = activeSection === 2

  return (
    <>
      <div className={`home-chrome${onDarkSection ? ' home-chrome--light' : ''}`}>
        <a className="home-mark" href="#identity" aria-label="Go to the first section">
          HT
        </a>
        <nav aria-label="Homepage shortcuts">
          <HomeNavigation />
          <AdminLoginDialog />
        </nav>
      </div>
      <div
        className={`section-indicator${onDarkSection ? ' section-indicator--light' : ''}`}
        aria-label={`Section ${activeSection} of 3`}
      >
        <span>{String(activeSection).padStart(2, '0')}</span>
        <i />
        <span>03</span>
      </div>
    </>
  )
}

function Collage({ images }: { images: string[] }) {
  const collageRows = [images.slice(0, 4), images.slice(4, 8), images.slice(8, 12)]

  const adaptImageRatio = (image: HTMLImageElement) => {
    const figure = image.parentElement

    if (!figure || image.naturalHeight === 0) return

    const naturalRatio = image.naturalWidth / image.naturalHeight
    const displayRatio = Math.min(2.4, Math.max(0.6, naturalRatio))
    figure.style.setProperty('--image-ratio', String(displayRatio))
  }

  return (
    <div className="hero-collage" aria-hidden="true">
      {collageRows.map((row, rowIndex) => {
        const repeatedRow = [...row, ...row]
        return (
          <div className={`collage-row collage-row--${rowIndex + 1}`} key={rowIndex}>
            <div className="collage-track">
              {repeatedRow.map((imageUrl, imageIndex) => (
                <figure key={`${imageUrl}-${imageIndex}`}>
                  <img
                    src={imageUrl}
                    alt=""
                    onLoad={(event) => adaptImageRatio(event.currentTarget)}
                  />
                </figure>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CityTimes({ locations }: { locations: HomepageLocation[] }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <aside className="city-times" aria-label="Local times">
      <p className="eyebrow">Local / {now.getFullYear()}</p>
      {locations.map((location) => (
        <CityTime key={`${location.city}-${location.timeZone}`} {...location} now={now} />
      ))}
    </aside>
  )
}

function CityTime({ city, timeZone, now }: { city: string; timeZone: string; now: Date }) {
  let time = '--:--:--'
  let offset = 'UTC'
  try {
    time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone,
    }).format(now)
    offset = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(now).find((part) => part.type === 'timeZoneName')?.value ?? 'UTC'
  } catch {
    // Keep the homepage usable if an invalid timezone was saved.
  }

  return (
    <div className="city-time">
      <span>{city}</span>
      <strong>{time}</strong>
      <small>{offset}</small>
    </div>
  )
}

function LatestArticlesSection() {
  const latestArticlesQuery = useQuery(articleQueries.latest(3))
  const articles = latestArticlesQuery.data?.items ?? []

  return (
    <section className="home-panel articles-panel" id="recent-notes" data-home-section="2">
      <div className="section-heading">
        <p className="eyebrow">02 / Recent notes</p>
        <span className="section-heading__line" />
        <Link to="/articles">View all ↗</Link>
      </div>
      <div className="article-grid">
        {latestArticlesQuery.isPending && <ArticleLoadingState />}
        {latestArticlesQuery.isError && (
          <ArticleMessageState
            title="The archive is offline"
            message="Start the API to load published articles."
          />
        )}
        {latestArticlesQuery.isSuccess && !articles.length && (
          <ArticleMessageState
            title="No published notes yet"
            message="Published articles will appear here."
          />
        )}
        {latestArticlesQuery.isSuccess &&
          articles.map((article, index) => (
            <ArticleCard article={article} index={index} key={article.id} />
          ))}
      </div>
    </section>
  )
}

function ArticleLoadingState() {
  return (
    <div className="article-state article-state--loading" aria-label="Loading recent articles">
      <span />
      <span />
      <span />
    </div>
  )
}

function ArticleMessageState({ title, message }: { title: string; message: string }) {
  return (
    <div className="article-state article-state--message">
      <p className="eyebrow">Archive status</p>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

function ArticleCard({ article, index }: { article: ArticleSummary; index: number }) {
  const body = (
    <>
      <img
        src={
          article.headerImageUrl ??
          `/images/home-collage/collage-${String(index + 2).padStart(2, '0')}.jpg`
        }
        alt={`Header visual for ${article.title}`}
      />
      <div className="article-card__shade" />
      <div className="article-card__meta">
        <span>{article.category?.name ?? 'Uncategorized'}</span>
        <time dateTime={article.publishedAt}>
          {new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(article.publishedAt))}
        </time>
      </div>
      <div className="article-card__content">
        <span>0{index + 1}</span>
        <h3>{article.title}</h3>
        {index === 0 && article.summary && <p>{article.summary}</p>}
      </div>
    </>
  )

  return article.slug ? (
    <Link className={`article-card article-card--${index + 1}`} to={`/articles/${article.slug}`}>
      {body}
    </Link>
  ) : (
    <article className={`article-card article-card--${index + 1}`}>{body}</article>
  )
}
