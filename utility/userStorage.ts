// utility/userStorage.ts
import { getAsyncStorageItem } from "./asyncStorage";

export async function getAuthToken(): Promise<string | null> {
  try {
    const details = await getAsyncStorageItem("userDetails");
    if (!details) return null;
    const parsed = JSON.parse(details);
    return parsed?.accessToken ?? null;
  } catch (err) {
    console.error("Error getting auth token:", err);
    return null;
  }
}
