// app/[code]/page.tsx
import { redirect, notFound } from "next/navigation";
import { getLinkByCode, incrementClick } from "@/lib/links";

// This is a Server Component page that handles `/:code`
// In Next.js 16, dynamic route `params` is a Promise, so we `await` it.
export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params; // ✅ Next 16 requires awaiting params

  // Look up the link in the database
  const link = await getLinkByCode(code);

  if (!link) {
    // If no link with this code exists -> show 404 page
    notFound();
  }

  // Increment click count & last_clicked timestamp
  await incrementClick(code);

  // Redirect to the original URL
  redirect(link.url);
}
