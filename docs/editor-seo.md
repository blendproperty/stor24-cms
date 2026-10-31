# Page SEO and redirects

Use Search & discovery → Page SEO for existing verified public pages. Choose the page, then set its search title, description and optional social title, description and approved media image. Blank fields retain website defaults. Save as Draft to review without changing the website; publish when ready. Published changes may take up to one minute.

Canonical page is for genuinely equivalent content. It must remain on an approved STOR24 page. Excluded canonical targets and chains are rejected. Exclude from search results removes the page from the sitemap and asks crawlers not to index it; the page stays publicly accessible. This is not a privacy control. Unpublish or remove a settings record to restore website defaults.

Use Redirects for retired public addresses. Enter the old and replacement STOR24 paths, choose permanent or temporary, review the destination and publish. Campaign query parameters, including repeated parameters, are preserved. External destinations, private/API/payment paths, current fixed pages, required legacy redirects, loops and excessive chains are rejected. Published articles and guides take priority over redirects; unpublish the old article before retiring its address. Check the replacement exists and meets the same need. Drafts have no routing effect. Unpublish a redirect to stop it.

Existing Articles and Storage Insights retain their publishing, SEO/image/FAQ and search-exclusion controls. Content Ideas remains a private planning workspace; an idea does not publish a public page. Search Console and Google tool links remain in Search & discovery. Google decides indexing and results; publishing does not guarantee either.

The additive 20261031_071213_editor_seo_controls migration retains existing content and adds only page settings, redirect records and their editor-lock relations. Replaying retains records. Application rollback retains the tables and editorial choices. Release CMS schema/API before the companion website consumer. Existing authenticated editor access and published-only anonymous reads are unchanged in policy; no raw script/schema editor or additional password system is introduced.

Validation: isolated PostgreSQL replay/constraints, 22 units/types, 74 real HTTP checks plus 4 responsive editor and 6 XSS browser checks. Real production editor acceptance is separate: prior direct CMS reads returned403, with no alternate client or permission workaround. Record hosted checks, migration and deployment in PROJECT_CONTEXT.md before calling this release live.
