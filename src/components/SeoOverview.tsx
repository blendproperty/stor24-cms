import React from 'react'
import Link from 'next/link'
import type { ServerProps } from 'payload'
import { auditDocument, SEARCH_CONSOLE } from '../lib/seo-audit'

export async function SeoOverview({ payload, user, permissions, visibleEntities }: Pick<ServerProps, 'payload' | 'user' | 'permissions' | 'visibleEntities'>) {
  if (!user) return null
  const rows: { id: number | string; collection: string; title: string; issues: string[]; status: string }[] = []
  const unavailable: string[] = []
  for (const collection of ['posts', 'storage-insights'] as const) {
    if (!permissions?.collections?.[collection]?.read || !visibleEntities?.collections.includes(collection)) continue
    try {
      let page = 1
      while (true) {
        const result = await payload.find({ collection, page, limit: 100, depth: 0, overrideAccess: false, user })
        for (const doc of result.docs) {
          const audit = auditDocument(doc, collection === 'storage-insights')
          rows.push({ id: doc.id, collection, title: doc.title, issues: audit.issues, status: doc.status || 'draft' })
        }
        if (!result.hasNextPage) break
        page++
      }
    } catch { unavailable.push(collection === 'posts' ? 'Articles' : 'Storage guides') }
  }
  const attention = rows.filter(row => row.issues.length).sort((a, b) => Number(b.status === 'published') - Number(a.status === 'published') || b.issues.length - a.issues.length)
  return <section className="s24-seo-hub" aria-labelledby="seo-title">
    <div className="s24-section-heading"><div><p className="s24-eyebrow">GROW ORGANIC SEARCH</p><h2 id="seo-title">Your SEO workspace</h2></div><a className="s24-button" href={SEARCH_CONSOLE} target="_blank" rel="noopener noreferrer">Google Search Console ↗</a></div>
    <div className="s24-seo-stats"><div><strong>{rows.filter(row => row.status === 'published').length}</strong><span>Published articles & guides</span></div><div><strong>{attention.length}</strong><span>Items with editorial checks</span></div><div><strong>Google</strong><span>Clicks, queries & indexing reports</span></div></div>
    {unavailable.length > 0 && <p role="status">Could not check: {unavailable.join(', ')}. Counts above cover loaded content only.</p>}
    <div className="s24-bottom-grid"><div className="s24-panel"><h3>Improve these first</h3><p>Published content comes first. These checks use saved content; they are not ranking or indexing results.</p>
      {attention.length ? <ul className="s24-seo-priorities">{attention.slice(0, 5).map(row => <li key={`${row.collection}-${row.id}`}><Link href={`/admin/collections/${row.collection}/${row.id}`}><strong>{row.title}</strong></Link><small>{row.status === 'published' ? 'Published' : 'Draft'} · {row.issues.length} checks</small><p>{row.issues[0]}</p></li>)}</ul> : <p>No basic writing issues found in the content checked. Review real search results in Google.</p>}
    </div><div className="s24-panel"><h3>Measure, improve, publish</h3><ol className="s24-seo-steps"><li><strong>Find opportunities.</strong> In Search Console, review queries with impressions but few clicks.</li><li><strong>Improve the right page.</strong> Answer the search clearly, add useful local detail and link to a relevant storage option.</li><li><strong>Check the result.</strong> Inspect the published URL and compare clicks and enquiries over time.</li></ol><div className="s24-seo-tools"><a href="https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Astor24.co.za" target="_blank" rel="noopener noreferrer">Search queries & clicks ↗</a><a href="https://search.google.com/search-console/index?resource_id=sc-domain%3Astor24.co.za" target="_blank" rel="noopener noreferrer">Page indexing ↗</a><a href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fstor24.co.za%2F" target="_blank" rel="noopener noreferrer">Google PageSpeed Insights ↗</a><a href="https://stor24.co.za/sitemap.xml" target="_blank" rel="noopener noreferrer">Website sitemap ↗</a></div><p className="s24-seo-note">Google reports open in your authorised Google account. Search data is not imported into the CMS. New properties need time to collect data.</p></div></div>
  </section>
}
