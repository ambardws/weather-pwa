import { apiCurrentWeather, apiLocation } from "@/types/path";
const location = "Bekasi";

export async function fetchApi(location?: string | number) {
  try {
    const res = await fetch(
      apiCurrentWeather +
        `?key=${process.env.NEXT_PUBLIC_APP_KEY}&q=${location}&aqi=no`
    );
    return res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function fetchLocation(location: string) {
  try {
    const res = await fetch(
      apiLocation +
        `?text=${location}&format=json&apiKey=${process.env.NEXT_PUBLIC_APP_KEY_PLACE}`
    );
    return res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}
