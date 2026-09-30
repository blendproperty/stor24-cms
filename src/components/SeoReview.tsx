"use client"
import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { auditDocument, SEARCH_CONSOLE, type SeoDocument } from '../lib/seo-audit'
export function SeoReview({ guide = false }: { guide?: boolean }) {
  const fields = useFormFields(([fields]) => fields)
  const doc: SeoDocument = {
    title: fields.title?.value as string, slug: fields.slug?.value as string,
    excerpt: fields.excerpt?.value as string, content: fields.content?.value,
    seoTitle: fields.seoTitle?.value as string, metaDescription: fields.metaDescription?.value as string,
    primaryKeyword: fields.primaryKeyword?.value as string,
    meta: { title: fields['meta.title']?.value as string, description: fields['meta.description']?.value as string },
  }
  const audit = auditDocument(doc, guide)
  return <section className="s24-seo-review" aria-label="SEO publishing review">
    <p className="s24-eyebrow">BEFORE YOU PUBLISH</p><h2>Search readiness</h2>
    <p>{audit.words} words · {audit.issues.length ? `${audit.issues.length} editorial checks to review` : 'Basic editorial checks passed'}</p>
    <div className="s24-search-preview"><small>stor24.co.za / {guide ? 'storage-insights' : 'blog'} / {doc.slug || 'page-address'}</small><strong>{audit.title}</strong><p>{audit.description || 'Add a useful description of what the reader will find.'}</p></div>
    {audit.issues.length > 0 && <ul>{audit.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
    <p className="s24-seo-note">These are writing checks, not a Google ranking score. Google may choose different search text. Review accuracy, originality and customer usefulness before publishing.</p>
    <a href={SEARCH_CONSOLE} target="_blank" rel="noopener noreferrer">Check indexing and search performance in Google ↗</a>
  </section>
}
