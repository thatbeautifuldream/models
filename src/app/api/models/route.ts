const EXTERNAL_API_URL = "https://models.dev/api.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(EXTERNAL_API_URL);
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "[API Route] Data received, providers:",
      Object.keys(data).length
    );

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[API Route] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
