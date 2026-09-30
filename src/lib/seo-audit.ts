export const SEARCH_CONSOLE = 'https://search.google.com/search-console?resource_id=sc-domain%3Astor24.co.za'
export type SeoDocument = {
  title?: string | null; slug?: string | null; excerpt?: string | null; status?: string | null
  seoTitle?: string | null; metaDescription?: string | null; primaryKeyword?: string | null
  meta?: { title?: string | null; description?: string | null } | null
  content?: unknown
}
type RichNode = { type?: string; tag?: string; text?: string; children?: RichNode[]; fields?: { url?: string } }
export function auditDocument(doc: SeoDocument, guide = false) {
  const title = (guide ? doc.seoTitle : doc.meta?.title)?.trim() || ''
  const description = (guide ? doc.metaDescription : doc.meta?.description)?.trim() || ''
  const root = (doc.content as { root?: RichNode } | null)?.root
  const nodes: RichNode[] = []
  const visit = (node?: RichNode) => { if (!node) return; nodes.push(node); node.children?.forEach(visit) }
  visit(root)
  const body = nodes.map(n => n.text || '').join(' ').trim()
  const words = body ? body.split(/\s+/).length : 0
  const issues: string[] = []
  if (!title) issues.push('Write a search title. The page title is currently used as a fallback.')
  else if (title.length > 65) issues.push('Review the long search title; Google may shorten it.')
  if (!description) issues.push('Write a search description. The excerpt is currently used as a fallback.')
  else if (description.length > 160) issues.push('Review the long search description; Google may shorten it.')
  if (!doc.slug?.trim()) issues.push('Add a clear page address before publishing.')
  if (!words) issues.push('Add useful body content before publishing.')
  if (words > 150 && !nodes.some(n => n.type === 'heading')) issues.push('Break up the content with descriptive subheadings.')
  if (!nodes.some(n => ['link', 'autolink'].includes(n.type || '') && /^(\/(?!\/)|https:\/\/stor24\.co\.za(?:\/|$))/.test(n.fields?.url || ''))) issues.push('Link naturally to a relevant STOR24 guide, service or location in the body.')
  const keyword = doc.primaryKeyword?.trim().toLowerCase()
  if (guide && keyword && !`${title} ${doc.title || ''}`.toLowerCase().includes(keyword)) issues.push('Review whether the search title or page heading reflects the target topic naturally.')
  return { title: title || doc.title || 'Untitled', description: description || doc.excerpt || '', words, issues }
}
