// app/[code]/page.tsx
import { redirect, notFound } from "next/navigation";
import { getLinkByCode, incrementClick } from "@/lib/links";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params; 

  const link = await getLinkByCode(code);

  if (!link) {

    notFound();
  }

  await incrementClick(code);

  redirect(link.url);
}
