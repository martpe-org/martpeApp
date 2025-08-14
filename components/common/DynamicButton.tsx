import { useRef, FC, ReactNode, useMemo } from "react";
import { Animated, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import { updateQty as updateQtyApi } from "../../state/updateQty"; // ✅ Explicit import to avoid name clash

interface DynamicButtonProps {
  children: ReactNode;
  isNewItem?: boolean;
  isUpdated?: boolean;
  storeId?: string;
  onPress?: () => void;
  onSuccess?: () => void;
  slug?: string;
  catalogId?: string;
  cartItemId?: string;
  qty?: number;
  customizable?: boolean;
  customizations?: {
    _id?: string;
    id?: string;
    groupId?: string;
    group_id?: string;
    optionId?: string;
    option_id?: string;
    name: string;
  }[];
  disabled?: boolean;
}

const DynamicButton: FC<DynamicButtonProps> = ({
  children,
  onPress,
  isNewItem,
  isUpdated,
  storeId,
  slug,
  catalogId,
  cartItemId,
  qty = 1,
  customizable = false,
  customizations = [],
  disabled = false,
  onSuccess,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const toast = useToast();
  const { authToken, isAuthenticated } = useUserDetails();
  const { addItem, removeCartItems, removeCart } = useCartStore();

  // ✅ Memoize normalization
  const normalizedCustomizations = useMemo(
    () =>
      customizations
        .map((custom) => ({
          groupId: custom.groupId || custom.group_id || "",
          optionId: custom.optionId || custom.option_id || "",
          name: custom.name || "",
        }))
        .filter((c) => c.groupId && c.optionId && c.name),
    [customizations]
  );

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
    if (disabled) return;

    animatePressIn();

    try {
      if (!isAuthenticated || !authToken) {
        toast.show("Please login to continue", { type: "danger" });
        return;
      }

      if (onPress) {
        onPress();
        return;
      }

      if (!storeId) {
        toast.show("Missing store information", { type: "danger" });
        return;
      }

      // ➕ Add new item
      if (isNewItem) {
        if (!slug || !catalogId) {
          toast.show("Missing product information", { type: "danger" });
          return;
        }

        const success = await addItem(
          storeId,
          slug,
          catalogId,
          1,
          customizable,
          normalizedCustomizations,
          authToken
        );

        toast.show(success ? "Added to cart" : "Error adding to cart", {
          type: success ? "success" : "danger",
        });

        if (success) onSuccess?.();
        return;
      }

      // 🔄 Update existing item
      if (isUpdated) {
        if (qty > 0) {
          if (!cartItemId) {
            toast.show("Missing cart item ID", { type: "danger" });
            return;
          }

          const success = await updateQtyApi(cartItemId, qty, authToken);

          toast.show(success ? "Updated cart" : "Error updating cart", {
            type: success ? "success" : "danger",
          });

          if (success) onSuccess?.();
        } else {
          // 🗑 Remove item or entire cart
          if (cartItemId) {
            const success = await removeCartItems([cartItemId], authToken);
            toast.show(success ? "Removed from cart" : "Error removing item", {
              type: success ? "success" : "danger",
            });
          } else {
            const success = await removeCart(storeId, authToken);
            toast.show(success ? "Removed from cart" : "Error clearing cart", {
              type: success ? "success" : "danger",
            });
          }
        }
        return;
      }

      toast.show("Invalid cart operation", { type: "warning" });
    } catch (error: any) {
      console.error("DynamicButton error:", error?.message);
      toast.show("Error updating cart", { type: "danger" });
    } finally {
      animatePressOut();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={disabled ? { opacity: 0.5 } : undefined}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default DynamicButton;
