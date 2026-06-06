"use server";

import { redirect } from "next/navigation";

export async function submitQuote(formData: FormData) {
  const data = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    area: formData.get("area"),
    storageType: formData.get("storageType"),
    items: formData.get("items"),
    unitSize: formData.get("unitSize"),
    startDate: formData.get("startDate"),
    duration: formData.get("duration"),
    collection: formData.get("collection"),
    contactMethod: formData.get("contactMethod"),
  };

  await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  redirect("/thank-you");
}
