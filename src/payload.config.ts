import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [
    {
      slug: "users",
      auth: true,
      fields: [],
    },
    {
      slug: "storage-units",
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
      ],
    },
    {
      slug: "media",
      upload: true,
      fields: [{ name: "alt", type: "text" }],
    },
    {
      slug: "posts",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "status", type: "select", options: ["draft", "published"], defaultValue: "draft", required: true },
        { name: "publishedAt", type: "date" },
        { name: "excerpt", type: "textarea" },
        { name: "content", type: "richText" },
        { name: "featuredImage", type: "upload", relationTo: "media" },
        { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
      ],
    },
    {
      slug: "faqs",
      admin: { useAsTitle: "question" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
        { name: "order", type: "number" },
      ],
    },
    {
      slug: "pricing",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "dimensions", type: "text" },
        { name: "price", type: "text", required: true },
        { name: "goodFor", type: "textarea" },
        { name: "popular", type: "checkbox" },
      ],
    },
    {
      slug: "areas",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true },
        { name: "intro", type: "textarea", required: true },
        { name: "personalCopy", type: "textarea" },
        { name: "businessCopy", type: "textarea" },
        { name: "nearby", type: "array", fields: [{ name: "area", type: "text" }] },
      ],
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "postgresql://stor4_user:stor4_pass@localhost:5432/stor4_db",
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "fallback-secret-key-32-chars-ok!",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
