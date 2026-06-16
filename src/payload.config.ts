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
      afterNavLinks: [
        { path: "@/components/Dashboard/Nav#DashboardNav" },
      ],
      views: {
        Dashboard: {
          Component: { path: "@/components/Dashboard/PowerDashboard#PowerDashboard" },
          path: "/crm-dashboard",
        },
        ContactDetail: {
          Component: { path: "@/components/Dashboard/ContactDetail#ContactDetail" },
          path: "/crm-dashboard/contact",
        },
      },
    },
  },
  plugins: [
    seoPlugin({
      collections: ["posts", "areas", "storage-units"],
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
      ],
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
    {
      slug: "contacts",
      access: { read: adminOnly, create: () => true, update: adminOnly, delete: adminOnly },
      admin: {
        useAsTitle: "email",
        defaultColumns: ["firstName", "lastName", "email", "phone", "status", "source", "score", "updatedAt"],
        listSearchableFields: ["firstName", "lastName", "email", "phone"],
      },
      fields: [
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text" },
        { name: "email", type: "email", required: true },
        { name: "phone", type: "text" },
        {
          name: "source",
          type: "select",
          options: [
            { label: "Web Form", value: "web_form" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Email", value: "email" },
            { label: "Walk In", value: "walk_in" },
            { label: "Referral", value: "referral" },
          ],
          defaultValue: "web_form",
        },
        {
          name: "unitSize",
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "Extra Large", value: "extra_large" },
          ],
        },
        { name: "moveInDate", type: "date" },
        { name: "score", type: "number", min: 0, max: 100 },
        {
          name: "status",
          type: "select",
          options: [
            { label: "New", value: "new" },
            { label: "Quoted", value: "quoted" },
            { label: "Viewing", value: "viewing" },
            { label: "Converted", value: "converted" },
            { label: "Lost", value: "lost" },
          ],
          defaultValue: "new",
        },
        { name: "notes", type: "textarea" },
      ],
      timestamps: true,
    },
    {
      slug: "deals",
      access: { read: adminOnly, create: () => true, update: adminOnly, delete: adminOnly },
      admin: {
        useAsTitle: "stage",
        defaultColumns: ["contact", "stage", "unitSize", "monthlyRate", "startDate", "endDate", "updatedAt"],
      },
      fields: [
        {
          name: "contact",
          type: "relationship",
          relationTo: "contacts",
          required: true,
        },
        {
          name: "stage",
          type: "select",
          options: [
            { label: "New Lead", value: "new_lead" },
            { label: "Quoted", value: "quoted" },
            { label: "Viewing Scheduled", value: "viewing_scheduled" },
            { label: "Active", value: "active" },
            { label: "Churned", value: "churned" },
            { label: "Lost", value: "lost" },
          ],
          defaultValue: "new_lead",
          required: true,
        },
        {
          name: "unitSize",
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "Extra Large", value: "extra_large" },
          ],
        },
        { name: "monthlyRate", type: "number" },
        { name: "startDate", type: "date" },
        { name: "endDate", type: "date" },
      ],
      timestamps: true,
    },
    {
      slug: "activities",
      access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
      admin: {
        useAsTitle: "type",
        defaultColumns: ["contact", "type", "body", "createdAt"],
      },
      fields: [
        {
          name: "contact",
          type: "relationship",
          relationTo: "contacts",
          required: true,
        },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Note", value: "note" },
            { label: "Email", value: "email" },
            { label: "Call", value: "call" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Viewing", value: "viewing" },
            { label: "Status Change", value: "status_change" },
          ],
          required: true,
        },
        { name: "body", type: "textarea" },
      ],
      timestamps: true,
    },
  ],
  db: postgresAdapter({ pool: { connectionString: dbUri } }),
  editor: lexicalEditor({}),
  secret,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
