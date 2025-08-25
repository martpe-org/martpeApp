import React from "react";
import { StyleSheet, View } from "react-native";
import ChangeQtyButton from "../Cart/ChangeQtyButton";
import { useCartStore } from "../../state/useCartStore";
import AddToCart from "../ProductDetails/AddToCart";

interface CategoryCartButtonProps {
  storeId: string;
  catalogId: string;
  slug: string;
  price: number;
  maxQuantity?: number;
}

const CategoryCartButton: React.FC<CategoryCartButtonProps> = ({
  storeId,
  catalogId,
  slug,
  price,
  maxQuantity = 10,
}) => {
  // ✅ lookup actual cart item from Zustand store
  const cartItem = useCartStore((state) =>
    state.allCarts
      .find((c) => c.store._id === storeId)
      ?.cart_items.find((it) => it.slug === slug)
  );

  if (!cartItem) {
    return (
      <AddToCart
        price={price}
        storeId={storeId}
        slug={slug}
        catalogId={catalogId}
      />
    );
  }

  return (
    <View style={styles.incrementButton}>
      <ChangeQtyButton
        cartItemId={cartItem._id}
        qty={cartItem.qty}
        max={maxQuantity}
        instock={cartItem.product?.instock ?? true}
        productName={cartItem.product?.name ?? ""}
        catalogId={catalogId}
        storeId={storeId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  incrementButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

export default CategoryCartButton;
