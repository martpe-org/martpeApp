import { useRef, FC, ReactNode } from "react";
import { Animated, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";

interface DynamicButtonProps {
  children: ReactNode;
  isNewItem?: boolean;
  isUpdated?: boolean;
  storeId?: string;
  onPress?: () => void;
  slug?: string;
  catalogId?: string;
  cartItemId?: string;
  quantity?: number;
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
  quantity = 1,
  customizable = false,
  customizations = [],
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const toast = useToast();

  // ✅ Get auth token & auth state
  const { authToken, isAuthenticated } = useUserDetails();

  // Cart store actions
  const { addItem, updateItemQuantity, removeCartItems, removeCart } = useCartStore();

  // Button press animations
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
    animatePressIn();

    try {
      // 🔒 Require authentication
      if (!isAuthenticated || !authToken) {
        toast.show("Please login to continue", { type: "danger" });
        return;
      }

      // 🛠 If a custom press handler exists, use it
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

        const normalizedCustomizations = customizations
          .map((custom) => ({
            groupId: custom.groupId || custom.group_id || "",
            optionId: custom.optionId || custom.option_id || "",
            name: custom.name || "",
          }))
          .filter((c) => c.groupId && c.optionId && c.name);

        const success = await addItem(
          storeId,
          slug,
          catalogId,
          1,
          customizable,
          normalizedCustomizations,
          authToken // ✅ pass token
        );

        toast.show(success ? "Added to cart" : "Error adding to cart", {
          type: success ? "success" : "danger",
        });

        return;
      }

      // 🔄 Update existing item
      if (isUpdated) {
        if (quantity > 0) {
          if (!cartItemId) {
            toast.show("Missing cart item ID", { type: "danger" });
            return;
          }

          const success = await updateItemQuantity(cartItemId, quantity, authToken);
          toast.show(success ? "Updated cart" : "Error updating cart", {
            type: success ? "success" : "danger",
          });
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

      // ❓ No valid operation
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
        onPress={disabled ? undefined : handlePress}
        disabled={disabled}
        style={disabled ? { opacity: 0.5 } : undefined}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default DynamicButton;
