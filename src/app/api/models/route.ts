const EXTERNAL_API_URL = "https://models.dev/api.json";

export const revalidate = 18000;

export async function GET() {
  try {
    const response = await fetch(EXTERNAL_API_URL, {
      next: { revalidate: 18000 },
    });
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=18000, s-maxage=18000, stale-while-revalidate=18000",
      },
    });
  } catch (error) {
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
