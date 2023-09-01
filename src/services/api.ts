import { apiCurrentWeather } from "@/types/path";
const location = "Bekasi";

export default async function fetchApi(location?: string | number) {
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
