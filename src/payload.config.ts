import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { StorageInsights } from "./collections/StorageInsights";
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
    meta: { titleSuffix: "— Stor24 CMS" },
    components: {
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
  collections: [
    StorageInsights,
    {
      slug: "users",
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
      access: { read: publicRead, create: adminOnly, update: adminOnly, delete: adminOnly },
      upload: {
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      fields: [{ name: "alt", type: "text" }],
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
      ],
    },
  ],
  db: postgresAdapter({ pool: { connectionString: dbUri } }),
  editor: lexicalEditor({}),
  secret,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
