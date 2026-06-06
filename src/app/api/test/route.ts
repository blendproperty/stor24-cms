export async function GET() {
  return Response.json({ 
    secret: process.env.PAYLOAD_SECRET ? "found" : "missing",
    db: process.env.DATABASE_URI ? "found" : "missing"
  });
}
