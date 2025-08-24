import React from "react";
import { useLocalSearchParams } from "expo-router";
import Checkout from "@/components/Checkout/Checkout";

export default function CheckoutScreen() {
  const { checkout: storeId } = useLocalSearchParams<{ checkout: string }>();

  if (!storeId) {
    return null;
  }

  return <Checkout storeId={storeId} />;
}