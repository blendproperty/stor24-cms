import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { StorageInsights } from "./collections/StorageInsights";
import { HomepageHero } from "./globals/HomepageHero";
import { editorialCollection } from "./admin/editorial";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const secret = process.env.PAYLOAD_SECRET;
if (!secret) throw new Error("PAYLOAD_SECRET environment variable is required");

const dbUri = process.env.DATABASE_URI;
if (!dbUri) throw new Error("DATABASE_URI environment variable is required");

const publicRead = () => true;
const adminOnly = ({ req: { user } }: any) => !!user;

export default buildConfig({
  admin: {
    user: "users",
    theme: 'light',
    avatar: { Component: '@/components/Workspace#AccountAvatar' },
    dateFormat: 'dd MMM yyyy, HH:mm',
    meta: { titleSuffix: "— Stor24 CMS" },
    components: {
      views: { dashboard: { Component: '@/components/Workspace#Workspace' } },
      beforeNavLinks: ['@/components/Workspace#NavIntro'],
      afterNavLinks: ['@/components/Workspace#NavFooter'],
      actions: ['@/components/Workspace#WebsiteAction'],
      beforeLogin: ['@/components/Workspace#LoginIntro'],
      graphics: {
        Logo: { path: "@/components/Logo#Logo" },
        Icon: { path: "@/components/Icon#Icon" },
      },
    },
  },
  plugins: [
    seoPlugin({
      collections: ["posts", "areas"],
      uploadsCollection: "media",
      generateTitle: ({ doc }: any) => `${doc?.title || doc?.name || ""} | Stor24`,
      generateDescription: ({ doc }: any) => doc?.excerpt || doc?.intro || doc?.description || "",
    }),
  ],
  collections: ([
    StorageInsights,
    {
      slug: "users",
      labels: { singular: 'CMS user', plural: 'CMS users' },
      admin: { group: 'Settings', useAsTitle: 'email', defaultColumns: ['email', 'updatedAt'], description: 'People with access to this content studio. Website customers and staff operations are managed in the CRM.' },
      auth: {
        maxLoginAttempts: 5,
        lockTime: 10 * 60 * 1000,
        tokenExpiration: 7200,
        useAPIKey: true,
      },
      access: {
        read: adminOnly,
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
      },
      fields: [],
    },
    {
      slug: "media",
      labels: { singular: 'Image', plural: 'Media library' },
      admin: { group: 'Library', useAsTitle: 'filename', defaultColumns: ['filename', 'alt', 'updatedAt'], description: 'Your website photography and artwork. Upload a clear, high-quality image and add a short description for accessibility.' },
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      upload: {
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      fields: [{ name: "alt", label: 'Image description', type: "text", admin: { description: 'Describe what is in the image. This helps people using screen readers and makes your library easier to understand.' } }],
    },
    {
      slug: "posts",
      labels: { singular: 'Article', plural: 'Articles' },
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "title", group: 'Website content', defaultColumns: ['title', 'status', 'updatedAt'], description: 'News, stories and practical advice. Open an article to edit its content, imagery and search information.' },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", label: 'Page address', type: "text", required: true, unique: true, admin: { description: 'Use lowercase words separated by hyphens. Changing a published address can break existing links.' } },
        { name: "status", type: "select", options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }], defaultValue: "draft", required: true, admin: { description: 'Check the article before setting it to Published.', components: { Cell: '@/components/Workspace#StatusCell' } } },
        { name: "publishedAt", type: "date" },
        { name: "excerpt", type: "textarea" },
        { name: "content", type: "richText", editor: lexicalEditor({}) },
        { name: "featuredImage", type: "upload", relationTo: "media" },
        { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
      ],
    },
    {
      slug: "faqs",
      labels: { singular: 'FAQ', plural: 'FAQs' },
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "question", group: 'Website content', defaultColumns: ['question', 'order', 'updatedAt'], description: 'Helpful answers for the website. Keep each question specific and each answer clear.' },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
        { name: "order", label: 'Display order', type: "number", admin: { description: 'Lower numbers appear first.' } },
      ],
    },
    {
      slug: "areas",
      labels: { singular: 'Location page', plural: 'Location pages' },
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "name", group: 'Website content', defaultColumns: ['name', 'slug', 'updatedAt'], description: 'Local content for the areas you serve. Explain the benefits for both personal and business storage.' },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true },
        { name: "intro", type: "textarea", required: true },
        { name: "personalCopy", type: "textarea" },
        { name: "businessCopy", type: "textarea" },
        { name: "nearby", type: "array", fields: [{ name: "area", type: "text" }] },
      ],
    },
  ] satisfies import('payload').CollectionConfig[]).map(editorialCollection),
  globals: [HomepageHero],
  db: postgresAdapter({ pool: { connectionString: dbUri } }),
  editor: lexicalEditor({}),
  secret,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
