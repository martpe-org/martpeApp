import { useCartStore } from "@/state/useCartStore";
import { getAuthToken } from "./userStorage";


export async function refreshCartFromApi() {
  const { syncCartFromApi } = useCartStore.getState();

  const token = await getAuthToken();
  if (token) {
    await syncCartFromApi(token);
  }
}
