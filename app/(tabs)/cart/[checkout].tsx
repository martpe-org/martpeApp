import React from "react";
import { useLocalSearchParams } from "expo-router";
import Checkout from "@/components/Checkout/Checkout";

export default function CheckoutScreen() {
  const { checkout: cartId, storeId } = useLocalSearchParams<{
    checkout: string;
    storeId?: string;
  }>();

  if (!cartId) return null;

  return <Checkout cartId={cartId} storeId={storeId || ""} />;
}
