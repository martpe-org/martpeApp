import React, { FC, useEffect, useState } from "react";
import { View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import ChangeQtyButton from "../Cart/ChangeQtyButton";
import CustomizationGroup from "../customization/CustomizationGroup";
import DynamicButton from "./DynamicButton";

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
  const { addItem } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  // lookup actual cart item from Zustand store
  const cartItem = useCartStore((state) =>
    state.allCarts
      .find((c) => c.store._id === storeId)
      ?.cart_items.find((it) => it.slug === slug)
  );

  const cartItemId = cartItem?._id;

  useEffect(() => {
    setShowAddButton(!cartItem);
  }, [cartItem]);

  const handleAddSuccess = async (customizations?: any[]) => {
    if (!storeId || storeId === "unknown-store" || storeId === "default-provider") {
      return;
    }

    // If customizations are provided, add the customized item to cart
    if (customizations && customizations.length > 0) {
      if (!authToken) {
        toast.show("Please login to continue", { type: "danger" });
        return;
      }

      try {
        const success = await addItem(
          storeId,
          slug,
          catalogId,
          1, // quantity
          true, // customizable
          customizations,
          authToken
        );

        if (success) {
          toast.show("Item added to cart", { type: "success" });
          setShowCustomization(false);
        } else {
          toast.show("Failed to add to cart", { type: "danger" });
        }
      } catch (error) {
        console.error("Error adding customized item:", error);
        toast.show("Error adding to cart", { type: "danger" });
      }
    }

    setShowAddButton(false);
  };

  const handleQtyChange = (newQty: number) => {
    if (newQty === 0) {
      setShowAddButton(true);
    }
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
          onQtyChange={handleQtyChange}
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
          productName={productName}
        />
      )}
    </>
  );
};

export default AddToCart;