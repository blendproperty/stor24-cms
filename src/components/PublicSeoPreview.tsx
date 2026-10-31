'use client'
import React from 'react'
import { useFormFields, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'
import { MANAGED_PAGE_PATHS, normalizeRedirectPath, redirectPathIssue } from '../lib/public-seo-rules'
import styles from './PublicSeoPreview.module.css'

export function PageSeoPreview() {
  const fields = useFormFields(([fields]) => fields)
  const path = typeof fields.path?.value === 'string' && (MANAGED_PAGE_PATHS as readonly string[]).includes(fields.path.value) ? fields.path.value : null
  const canonical = typeof fields.canonicalPath?.value === 'string' && (MANAGED_PAGE_PATHS as readonly string[]).includes(fields.canonicalPath.value) ? fields.canonicalPath.value : path
  return <section className={`s24-seo-review ${styles.root}`} aria-label="Page search publishing review">
    <p className="s24-eyebrow">BEFORE YOU PUBLISH</p><h2>Review this page</h2>
    <div className="s24-search-preview"><small>{path ? `stor24.co.za${path}` : 'Choose an existing website page'}</small><strong>{String(fields.seoTitle?.value || 'Website default search title')}</strong><p>{String(fields.metaDescription?.value || 'The current website description is retained when this is blank.')}</p></div>
    <p>{fields.noIndex?.value === true ? 'Excluded from search when published. The page remains public by its link.' : 'Eligible for search when published; Google decides whether and how to display it.'}</p>
    {canonical && <p>Canonical page: https://stor24.co.za{canonical}</p>}
    {path && <a href={`https://stor24.co.za${path}`} target="_blank" rel="noopener noreferrer">Review the public page</a>}
    <p className="s24-seo-note">This previews your form, not Google results. Drafts do not change the website. Allow up to one minute after publishing.</p>
  </section>
}

export function RedirectPreview() {
  const fields = useFormFields(([fields]) => fields)
  const source = !redirectPathIssue(fields.source?.value, 'source') ? normalizeRedirectPath(fields.source?.value) : null
  const destination = !redirectPathIssue(fields.destination?.value, 'destination') ? normalizeRedirectPath(fields.destination?.value) : null
  return <section className={`s24-seo-review ${styles.root}`} aria-label="Redirect publishing review">
    <p className="s24-eyebrow">BEFORE YOU PUBLISH</p><h2>Check the replacement</h2>
    <p>{source ? `Old page: https://stor24.co.za${source}` : 'Enter a retired public address.'}</p>
    <p>{[301,308].includes(Number(fields.statusCode?.value ?? 308)) ? 'Permanent move.' : 'Temporary move.'}</p>
    {destination ? <a href={`https://stor24.co.za${destination}`} target="_blank" rel="noopener noreferrer">Review https://stor24.co.za{destination}</a> : <p>Choose a public replacement on stor24.co.za.</p>}
    <p className="s24-seo-note">Check that the replacement exists and answers the same need. Drafts do not redirect. Published content takes priority; private and required booking routes are protected. Incoming query parameters are preserved.</p>
  </section>
}

export const RedirectTypeField: NumberFieldClientComponent = ({path,field,readOnly}) => {
  const {value,setValue}=useField<number>({path:path || field.name});
  const id=`field-${path || field.name}`;
  return <div className={styles.kind}><label htmlFor={id}>Redirect type</label><select id={id} value={String(value ?? 308)} disabled={readOnly} onChange={event=>setValue(Number(event.target.value))}>
    <option value="308">Permanent move (308, recommended)</option><option value="307">Temporary move (307)</option><option value="301">Permanent move (301)</option><option value="302">Temporary move (302)</option>
  </select><p>Use a permanent move when the replacement should become the new address. Use a temporary move when the old page will return.</p></div>
}
