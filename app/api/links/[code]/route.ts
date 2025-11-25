import { NextResponse } from "next/server";
import { deleteLink, getLinkByCode } from "@/lib/links";

type Params = { params: { code: string } };

export async function GET(_req: Request, { params }: Params) {
  const { code } = params;
  const link = await getLinkByCode(code);

  if (!link)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ link });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { code } = params;

  const ok = await deleteLink(code);
  if (!ok)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
