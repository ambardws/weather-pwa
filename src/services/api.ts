// Default locations for Jabodetabek (Jakarta metropolitan area)
export const DEFAULT_LOCATIONS = [
  "Jakarta",
  "Bekasi",
  "Bogor",
  "Tangerang",
  "Depok"
];

export async function fetchApi(location?: string | number) {
  try {
    const res = await fetch(`/api/weather?location=${location}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function fetchLocation(location: string) {
  try {
    const res = await fetch(`/api/location?query=${location}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}
