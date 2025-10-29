import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RedirectProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      // Redirect to your existing route
      router.replace(`/(tabs)/home/result/productDetails/${id}`);
    }
  }, [id]);

  return null; // no UI, it just redirects
}
