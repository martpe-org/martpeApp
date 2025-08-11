import { useRef, FC, ReactNode } from "react";
import { Animated, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";

import { useCartStore } from "../../state/useCartStore";

interface DynamicButtonProps {
  children: ReactNode;
  isNewItem?: boolean;
  isUpdated?: boolean;
  storeId?: string;
  onPress?: () => void;
  slug?: string; // Changed from itemId to slug
  catalogId?: string; // Added catalog ID
  cartItemId?: string; // Added for update operations
  quantity?: number;
  customizable?: boolean; // Added customizable flag
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
  
  // Get cart store actions
  const { addItem, updateItemQuantity, removeCartItems, removeCart } = useCartStore();

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
      if (onPress) {
        onPress();
        return;
      }

      if (!storeId) {
        toast.show("Missing storeId", { type: "danger" });
        return;
      }

      if (isNewItem) {
        // Adding new item to cart
        if (!slug || !catalogId) {
          toast.show("Missing product information", { type: "danger" });
          return;
        }

        // Normalize customizations for API
        const normalizedCustomizations = customizations.map(custom => ({
          groupId: custom.groupId || custom.group_id || '',
          optionId: custom.optionId || custom.option_id || '',
          name: custom.name
        }));

        const success = await addItem(
          storeId,
          slug,
          catalogId,
          1, // Always add 1 item initially
          customizable,
          normalizedCustomizations
        );

        if (success) {
          toast.show("Added to cart", { type: "success" });
        } else {
          toast.show("Failed to add to cart", { type: "danger" });
        }
      } else if (isUpdated) {
        if (quantity > 0) {
          // Update quantity
          if (!cartItemId) {
            toast.show("Missing cart item ID", { type: "danger" });
            return;
          }

          const success = await updateItemQuantity(cartItemId, quantity);
          
          if (success) {
            toast.show("Updated cart", { type: "success" });
          } else {
            toast.show("Failed to update cart", { type: "danger" });
          }
        } else {
          // Remove item (quantity is 0 or negative)
          if (cartItemId) {
            // Remove specific cart item
            const success = await removeCartItems([cartItemId]);
            
            if (success) {
              toast.show("Removed from cart", { type: "success" });
            } else {
              toast.show("Failed to remove item", { type: "danger" });
            }
          } else {
            // Remove entire cart for this store
            const success = await removeCart(storeId);
            
            if (success) {
              toast.show("Removed from cart", { type: "success" });
            } else {
              toast.show("Failed to remove from cart", { type: "danger" });
            }
          }
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
        disabled={disabled}
        style={disabled ? { opacity: 0.5 } : undefined}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default DynamicButton;