import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import DynamicButton from "../common/DynamicButton";
import useUserDetails from "../../hook/useUserDetails";
import { useToast } from "react-native-toast-notifications";
import { useCartStore } from "../../state/useCartStore";

const { width } = Dimensions.get("window");

interface AddToCartButtonProps {
  storeId: string;
  slug: string;
  catalogId: string;
  cartItemId?: string;
  maxQuantity?: number;
  initialQty?: number;
  customizable?: boolean;
  customizations?: {
    groupId?: string;
    optionId?: string;
    name: string;
  }[];
}

const AddToCartButton: FC<AddToCartButtonProps> = ({
  storeId,
  slug,
  catalogId,
  cartItemId,
  maxQuantity = 10,
  initialQty = 0,
  customizable = false,
  customizations = [],
}) => {
  const [itemCount, setItemCount] = useState(initialQty);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { authToken, isAuthenticated } = useUserDetails();
  const { addItem, updateQty, removeCartItems, removeCart } = useCartStore();

  const increment = async () => {
    if (itemCount >= maxQuantity) return;
    if (!isAuthenticated || !authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }
    setLoading(true);
    try {
      if (itemCount === 0) {
        const success = await addItem(
          storeId,
          slug,
          catalogId,
          1,
          customizable,
          customizations,
          authToken
        );
        if (success) {
          setItemCount(1);
          toast.show("Added to cart", { type: "success" });
        }
      } else {
        if (!cartItemId) return toast.show("Missing cart item ID", { type: "danger" });
        const success = await updateQty(cartItemId, itemCount + 1, authToken);
        if (success) setItemCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Increment failed", err);
    } finally {
      setLoading(false);
    }
  };

  const decrement = async () => {
    if (itemCount <= 0) return;
    if (!isAuthenticated || !authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }
    setLoading(true);
    try {
      if (itemCount === 1) {
        if (cartItemId) {
          const success = await removeCartItems([cartItemId], authToken);
          if (success) setItemCount(0);
        } else {
          const success = await removeCart(storeId, authToken);
          if (success) setItemCount(0);
        }
      } else {
        if (!cartItemId) return toast.show("Missing cart item ID", { type: "danger" });
        const success = await updateQty(cartItemId, itemCount - 1, authToken);
        if (success) setItemCount((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Decrement failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="small" color="green" />;

  return (
    <View>
      {itemCount === 0 ? (
        // Use DynamicButton for first ADD
        <DynamicButton
          isNewItem
          storeId={storeId}
          slug={slug}
          catalogId={catalogId}
          customizable={customizable}
          customizations={customizations}
          onPress={increment} // call increment
        >
          <View style={styles.addButton}>
            <Text style={styles.buttonText}>ADD</Text>
          </View>
        </DynamicButton>
      ) : (
        // Use increment / decrement directly
        <View style={styles.addButtonNext}>
          <TouchableOpacity onPress={decrement} style={styles.itemCountChangeButton}>
            <Text style={styles.incrementDecrementButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.itemCount}>{itemCount}</Text>

          <TouchableOpacity onPress={increment} style={styles.itemCountChangeButton}>
            <Text style={styles.incrementDecrementButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AddToCartButton;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.04,
    borderRadius: 4,
    elevation: 2,
  },
  addButtonNext: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: width * 0.02,
    borderRadius: 4,
    elevation: 2,
  },
  itemCountChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.09,
    height: width * 0.09,
    borderColor: "green",
  },
  buttonText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  incrementDecrementButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "green",
  },
  itemCount: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
