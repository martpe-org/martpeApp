import React, { FC, useState, useEffect } from "react";
import { View } from "react-native";
import { useCartStore } from "../../state/useCartStore";
import DynamicButton from "./DynamicButton";
import ChangeQtyButton from "../Cart/ChangeQtyButton";

interface AddToCartProps {
  price: number;
  storeId: string;
  slug: string;
  catalogId: string;
}

const AddToCart: FC<AddToCartProps> = ({
  price,
  storeId,
  slug,
  catalogId,
}) => {
  const [showAddButton, setShowAddButton] = useState(false);

  // ✅ lookup actual cart item from Zustand store
  const cartItem = useCartStore((state) =>
    state.allCarts
      .find((c) => c.store._id === storeId)
      ?.cart_items.find((it) => it.slug === slug)
  );

  const cartItemId = cartItem?._id; // ✅ real backend ID

  useEffect(() => {
    setShowAddButton(!cartItem);
  }, [cartItem]);

  if (!showAddButton && cartItem) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ChangeQtyButton
          cartItemId={cartItemId!}
          qty={cartItem.qty}
          max={5}
          instock={cartItem.product?.instock}
          productName={cartItem.product?.name}
          onQtyChange={(newQty: any) => {
            if (newQty === 0) {
              setShowAddButton(true);
            }
          }}
        />
      </View>
    );
  }

  return (
    <DynamicButton
      storeId={storeId}
      slug={slug}
      catalogId={catalogId}
      onAddSuccess={() => {
        if (!storeId || storeId === "unknown-store" || storeId === "default-provider") {
          console.log("⚠️ AddToCart attempted without a valid storeId:", {
            slug,
            catalogId,
            storeId,
          });
        } else {
          console.log("✅ Item successfully added to cart:", {
            slug,
            catalogId,
            storeId,
          });
        }
        setShowAddButton(false);
      }}
    />
  );
};

export default AddToCart;
