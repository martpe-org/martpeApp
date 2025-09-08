import React, { FC, useState, useEffect } from "react";
import { View } from "react-native";
import { useCartStore } from "../../state/useCartStore";
import DynamicButton from "./DynamicButton";
import ChangeQtyButton from "../Cart/ChangeQtyButton";
import CustomizationGroup from "./CustomizationGroup";

interface AddToCartProps {
  price: number;
  storeId: string;
  slug: string;
  catalogId: string;
  productName?: string;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
}

const AddToCart: FC<AddToCartProps> = ({
  price,
  storeId,
  slug,
  catalogId,
  productName,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
}) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  // ✅ lookup actual cart item from Zustand store
  const cartItem = useCartStore((state) =>
    state.allCarts
      .find((c) => c.store._id === storeId)
      ?.cart_items.find((it) => it.slug === slug)
  );

  const cartItemId = cartItem?._id;

  useEffect(() => {
    setShowAddButton(!cartItem);
  }, [cartItem]);

  const handleAddSuccess = () => {
    console.log("🛒 AddToCart attempt:", {
      slug,
      catalogId,
      storeId,
      price,
    });

    if (!storeId || storeId === "unknown-store" || storeId === "default-provider") {
      console.error("❌ AddToCart failed: invalid storeId", {
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
  };

  if (!showAddButton && cartItem) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ChangeQtyButton
          cartItemId={cartItemId!}
          qty={cartItem.qty}
          max={5}
          instock={cartItem.product?.instock}
          productName={cartItem.product?.name}
          storeId={storeId}
          catalogId={catalogId}
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
    <>
      {showAddButton && (
        <DynamicButton
          storeId={storeId}
          slug={slug}
          catalogId={catalogId}
          customizable={customizable}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
          onAddSuccess={handleAddSuccess}
          onShowCustomization={() => setShowCustomization(true)}
        />
      )}

  {/* Customization Modal */}
      {customizable && directlyLinkedCustomGroupIds.length > 0 && (
        <CustomizationGroup
          productSlug={slug}
          storeId={storeId}
          catalogId={catalogId}
          productPrice={price}
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds}
          visible={showCustomization}
          onClose={() => setShowCustomization(false)}
          onAddSuccess={handleAddSuccess}
          productName={productName} // ✅ Add this line
        />
      )}
    </>
  );
};

export default AddToCart;