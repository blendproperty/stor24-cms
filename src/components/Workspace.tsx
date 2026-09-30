import React from 'react'
import Link from 'next/link'
import type { ServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'

const sections = [
  {
    slug: 'storage-insights',
    title: 'Storage guides',
    mark: '01',
    description:
      'Practical advice, moving guides and answers that help customers choose their space.',
  },
  {
    slug: 'posts',
    title: 'Articles',
    mark: '02',
    description: 'News, ideas and stories for the STOR24 website.',
  },
  {
    slug: 'areas',
    title: 'Location pages',
    mark: '03',
    description: 'Local introductions and useful information for the areas we serve.',
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    mark: '04',
    description: 'Clear answers to your customers’ most common questions.',
  },
  {
    slug: 'media',
    title: 'Media library',
    mark: '05',
    description: 'Photography and artwork, with descriptions that make images accessible.',
  },
  {
    slug: 'users',
    title: 'CMS users',
    mark: '06',
    description: 'Manage the people who can edit website content.',
  },
] as const

export async function Workspace({ payload, user, permissions, visibleEntities }: ServerProps) {
  if (!user) return null
  const available = sections.filter(
    ({ slug }) =>
      permissions?.collections?.[slug]?.read && visibleEntities?.collections.includes(slug),
  )
  const content = await Promise.all(
    available.map(async (section) => {
      try {
        const result = await payload.find({
          collection: section.slug,
          limit: 3,
          sort: '-updatedAt',
          depth: 0,
          overrideAccess: false,
          user,
        })
        return { ...section, count: result.totalDocs, docs: result.docs }
      } catch {
        return { ...section, count: null, docs: [] }
      }
    }),
  )
  const recent = content
    .filter(({ slug }) => slug !== 'users')
    .flatMap(({ slug, title, docs }) =>
      docs.map((doc) => ({
        id: doc.id,
        slug,
        section: title,
        title: String(
          ('title' in doc && doc.title) ||
            ('question' in doc && doc.question) ||
            ('filename' in doc && doc.filename) ||
            ('name' in doc && doc.name) ||
            'Untitled',
        ),
        updatedAt: String(doc.updatedAt),
        status: 'status' in doc && typeof doc.status === 'string' ? doc.status : null,
      })),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
  const heroVisible =
    permissions?.globals?.['homepage-hero']?.read &&
    visibleEntities?.globals.includes('homepage-hero')
  return (
    <Gutter className="s24-workspace">
      <header className="s24-page-heading">
        <div>
          <p className="s24-eyebrow">STOR24 / CONTENT STUDIO</p>
          <h1>
            A little space.
            <br />
            <span>A lot to say.</span>
          </h1>
          <p>Welcome to your website workspace. Make every word and image count.</p>
        </div>
        <a
          className="s24-button s24-button--outline"
          href="https://stor24.co.za"
          target="_blank"
          rel="noopener noreferrer"
        >
          View website <span aria-hidden="true">↗</span>
        </a>
      </header>
      {heroVisible && (
        <section className="s24-feature" aria-labelledby="homepage-title">
          <div>
            <p className="s24-eyebrow">YOUR FIRST IMPRESSION</p>
            <h2 id="homepage-title">Make the homepage yours.</h2>
            <p>Update your headline, choose your images and give visitors a reason to stay.</p>
            <Link className="s24-button" href="/admin/globals/homepage-hero">
              Edit homepage <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="s24-feature-art" aria-hidden="true">
            <span>Life happens.</span>
            <strong>
              We’ve got
              <br />
              room.
            </strong>
            <div className="s24-outline-box" />
          </div>
        </section>
      )}
      <section aria-labelledby="content-title">
        <div className="s24-section-heading">
          <div>
            <p className="s24-eyebrow">THE BUILDING BLOCKS</p>
            <h2 id="content-title">Your content</h2>
          </div>
          <span>Choose a section to get started</span>
        </div>
        <div className="s24-content-grid">
          {content.map(({ slug, title, mark, description, count }) => (
            <Link key={slug} className="s24-content-card" href={`/admin/collections/${slug}`}>
              <div className="s24-card-top">
                <span className="s24-card-mark">{mark}</span>
                <span className="s24-count">
                  {count === null
                    ? 'Count unavailable'
                    : `${count} ${count === 1 ? 'item' : 'items'}`}
                </span>
              </div>
              <h3>
                {title}
                <span aria-hidden="true">↗</span>
              </h3>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="s24-bottom-grid">
        <section className="s24-panel" aria-labelledby="recent-title">
          <p className="s24-eyebrow">PICK UP WHERE YOU LEFT OFF</p>
          <h2 id="recent-title">Recently updated</h2>
          {recent.length ? (
            <ul className="s24-recent">
              {recent.map((item) => (
                <li key={`${item.slug}-${item.id}`}>
                  <Link href={`/admin/collections/${item.slug}/${item.id}`}>
                    <span>
                      <small>{item.section}</small>
                      <strong>{item.title}</strong>
                    </span>
                    <span className="s24-recent-meta">
                      {item.status && (
                        <span
                          className={`s24-status s24-status--${item.status === 'published' ? 'published' : 'draft'}`}
                        >
                          {item.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      )}
                      <time dateTime={item.updatedAt}>
                        {new Intl.DateTimeFormat('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          timeZone: 'Africa/Johannesburg',
                        }).format(new Date(item.updatedAt))}
                      </time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your latest content updates will appear here.</p>
          )}
        </section>
        <aside className="s24-panel s24-editor-note">
          <p className="s24-eyebrow">BEFORE YOU SAVE</p>
          <h2>
            Good content.
            <br />
            Ready for the world.
          </h2>
          <ol>
            <li>
              <strong>Keep it useful.</strong>
              <span>Give customers one clear idea at a time.</span>
            </li>
            <li>
              <strong>Check your images.</strong>
              <span>Add a useful description and check the crop.</span>
            </li>
            <li>
              <strong>Review the result.</strong>
              <span>
                Check the public website after saving. Homepage changes can take up to five minutes
                to appear.
              </span>
            </li>
          </ol>
        </aside>
      </div>
      <footer className="s24-workspace-footer">
        STOR24 Content Studio <span>Space for your story.</span>
      </footer>
    </Gutter>
  )
}

export function NavIntro() {
  return (
    <div className="s24-nav-intro">
      <Link href="/admin" className="s24-wordmark">
        STOR<span>24</span>
        <span className="s24-studio-label">CONTENT STUDIO</span>
      </Link>
      <Link href="/admin" className="s24-overview-link">
        Overview <span aria-hidden="true">↗</span>
      </Link>
    </div>
  )
}
export function NavFooter() {
  return (
    <div className="s24-nav-footer">
      <a href="https://stor24.co.za" target="_blank" rel="noopener noreferrer">
        Visit website ↗
      </a>
      <a href="https://portal.stor24.co.za/login" target="_blank" rel="noopener noreferrer">
        Open CRM ↗
      </a>
      <p>Website content, all in one place.</p>
    </div>
  )
}
export function WebsiteAction() {
  return (
    <a
      className="s24-header-link"
      href="https://stor24.co.za"
      target="_blank"
      rel="noopener noreferrer"
    >
      View website ↗
    </a>
  )
}
export function LoginIntro() {
  return (
    <div className="s24-login-intro">
      <p className="s24-eyebrow">CONTENT STUDIO</p>
      <h1>Welcome back.</h1>
      <p>Your words. Your images. Your STOR24.</p>
    </div>
  )
}
export function StatusCell({ cellData }: { cellData?: string }) {
  return (
    <span className={`s24-status s24-status--${cellData === 'published' ? 'published' : 'draft'}`}>
      {cellData === 'published' ? 'Published' : cellData === 'draft' ? 'Draft' : 'Not set'}
    </span>
  )
}

export function AccountAvatar() {
  return (
    <span className="s24-account-avatar" aria-hidden="true">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </svg>
    </span>
  )
}
