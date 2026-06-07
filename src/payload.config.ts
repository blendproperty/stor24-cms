import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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

const seoFields = {
  name: "seo",
  type: "group" as const,
  label: "SEO",
  fields: [
    { name: "metaTitle", type: "text" as const, label: "Meta Title (50-60 chars)" },
    { name: "metaDescription", type: "textarea" as const, label: "Meta Description (150-160 chars)" },
    { name: "ogTitle", type: "text" as const, label: "OG Title" },
    { name: "ogDescription", type: "textarea" as const, label: "OG Description" },
    { name: "ogImage", type: "upload" as const, relationTo: "media" as const, label: "OG Image" },
    { name: "canonicalUrl", type: "text" as const, label: "Canonical URL" },
    { name: "noIndex", type: "checkbox" as const, label: "No Index (hide from Google)", defaultValue: false },
  ],
};

export default buildConfig({
  admin: {
    user: "users",
    meta: { titleSuffix: "— Stor24 CMS" },
    components: {
      graphics: {
        Logo: { path: "@/components/Logo#Logo" },
        Icon: { path: "@/components/Icon#Icon" },
      },
    },
  },
  collections: [
    {
      slug: "users",
      auth: {
        maxLoginAttempts: 5,
        lockTime: 10 * 60 * 1000,
        tokenExpiration: 7200,
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
      slug: "storage-units",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "size", type: "text", required: true },
        { name: "dimensions", type: "text" },
        { name: "pricePerMonth", type: "number", required: true },
        { name: "features", type: "array", fields: [{ name: "feature", type: "text" }] },
        { name: "available", type: "checkbox", defaultValue: true },
        { name: "popular", type: "checkbox", defaultValue: false },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
        seoFields,
      ],
    },
    {
      slug: "media",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      upload: {
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      fields: [
        { name: "alt", type: "text" },
      ],
    },
    {
      slug: "posts",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "status", type: "select", options: ["draft", "published"], defaultValue: "draft", required: true },
        { name: "publishedAt", type: "date" },
        { name: "excerpt", type: "textarea" },
        { name: "content", type: "richText", editor: lexicalEditor({}) },
        { name: "featuredImage", type: "upload", relationTo: "media" },
        { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
        seoFields,
      ],
    },
    {
      slug: "faqs",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "question" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
        { name: "order", type: "number" },
      ],
    },
    {
      slug: "areas",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true },
        { name: "intro", type: "textarea", required: true },
        { name: "personalCopy", type: "textarea" },
        { name: "businessCopy", type: "textarea" },
        { name: "nearby", type: "array", fields: [{ name: "area", type: "text" }] },
        seoFields,
      ],
    },
    {
      slug: "pages",
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        seoFields,
      ],
    },
  ],
  db: postgresAdapter({ pool: { connectionString: dbUri } }),
  editor: lexicalEditor({}),
  secret,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
