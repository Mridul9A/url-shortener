export async function GET() {
  return Response.json({
    ok: true,
    version: process.env.APP_VERSION || "1.0",
  });
}
