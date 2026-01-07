import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  // Check if API key is configured
  if (!process.env.NEXT_PUBLIC_APP_KEY_PLACE || process.env.NEXT_PUBLIC_APP_KEY_PLACE === "your_geoapify_api_key_here") {
    return NextResponse.json(
      { error: "Location API key not configured. Please add NEXT_PUBLIC_APP_KEY_PLACE to your .env file" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&format=json&apiKey=${process.env.NEXT_PUBLIC_APP_KEY_PLACE}`
    );

    if (!response.ok) {
      throw new Error(`Location API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
