export async function GET() {
  console.log("Dummy cron job...");

  return new Response(
    JSON.stringify({
      success: true,
    }),
  );
}
