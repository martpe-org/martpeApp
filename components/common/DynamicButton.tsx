import { useRef, FC, ReactNode } from "react";
import { Animated, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";

import { addToCartAction } from "../../state/addToCart";
import { updateCartItemQtyAction } from "../../state/updateQty";
import { removeCartAction } from "../../state/removeCart";

interface DynamicButtonProps {
  children: ReactNode;
  isNewItem?: boolean;
  isUpdated?: boolean;
  storeId?: string;
  itemId?: string;
  quantity?: number;
  customizations?: {
    id: string;
  }[];
  disabled?: boolean;
}

const DynamicButton: FC<DynamicButtonProps> = ({
  children,
  isNewItem,
  isUpdated,
  storeId,
  itemId,
  quantity = 1,
  customizations = [],
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const toast = useToast();

  const animatePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      speed: 15,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 2,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    try {
      if (!storeId || !itemId) {
        toast.show("Missing storeId or itemId", { type: "danger" });
        return;
      }

      if (isNewItem) {
        const res = await addToCartAction({
          store_id: storeId,
          slug: itemId,
          catalog_id: itemId,
          qty: 1,
          customizable: customizations.length > 0,
          customizations: customizations.map((c) => ({
            groupId: c.id,
            optionId: c.id,
            name: "custom",
          })),
        });

        if (res.success) {
          toast.show("Added to cart", { type: "success" });
        } else {
          toast.show("Failed to add to cart", { type: "danger" });
        }
      } else if (isUpdated && quantity > 0) {
        const res = await updateCartItemQtyAction(itemId, quantity);
        if (res.success) {
          toast.show("Updated cart", { type: "success" });
        } else {
          toast.show("Failed to update cart", { type: "danger" });
        }
      } else if (isUpdated && quantity <= 0) {
        const res = await removeCartAction(storeId);
        if (res.success) {
          toast.show("Removed from cart", { type: "success" });
        } else {
          toast.show("Failed to remove item", { type: "danger" });
        }
      } else {
        toast.show("Unhandled cart action", { type: "warning" });
      }
    } catch (error: any) {
      console.error("DynamicButton error:", error?.message);
      toast.show("Error updating cart", { type: "danger" });
    }

    animatePressOut();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        onPress={disabled ? undefined : handlePress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default DynamicButton;
