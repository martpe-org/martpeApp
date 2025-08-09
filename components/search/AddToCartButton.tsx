import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import DynamicButton from "../common/DynamicButton";
import { addToCartAction } from "../../state/addToCart";
import { removeCartAction } from "../../state/removeCart";
import { updateCartItemQtyAction } from "../../state/updateQty";
import useUserDetails from "../../hook/useUserDetails";

interface AddToCartButtonProps {
  storeId: string;
  itemId: string;
  maxQuantity?: number;
}

const { width } = Dimensions.get("window");

const AddToCartButton: FC<AddToCartButtonProps> = ({
  storeId,
  itemId,
  maxQuantity = 10,
}) => {
  const [itemCount, setItemCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { authToken } = useUserDetails();

  const increment = async () => {
    if (itemCount >= maxQuantity || !authToken) return;
    setLoading(true);
    try {
      if (itemCount === 0) {
        const result = await addToCartAction(
          {
            store_id: storeId,
            slug: itemId,
            catalog_id: itemId,
            qty: 1,
            customizable: false,
          },
          // authToken
        );
        if (result.success) setItemCount(1);
      } else {
        const result = await updateCartItemQtyAction(itemId, itemCount + 1);
        if (result.success) setItemCount((prev) => prev + 1);
      }
    } catch (err) {
      console.log("Increment failed", err);
    } finally {
      setLoading(false);
    }
  };

  const decrement = async () => {
    if (itemCount <= 0 || !authToken) return;
    setLoading(true);
    try {
      if (itemCount === 1) {
        const result = await removeCartAction(storeId);
        if (result.success) setItemCount(0);
      } else {
        const result = await updateCartItemQtyAction(itemId, itemCount - 1);
        if (result.success) setItemCount((prev) => prev - 1);
      }
    } catch (err) {
      console.log("Decrement failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="green" />;
  }

  return (
    <View>
      {itemCount === 0 ? (
        <DynamicButton
          onPress={increment}
          isNewItem={true}
          storeId={storeId}
          itemId={itemId}
        >
          <View style={styles.addButton}>
            <Text style={styles.buttonText}>ADD</Text>
          </View>
        </DynamicButton>
      ) : (
        <View style={styles.addButtonNext}>
          <DynamicButton onPress={decrement} storeId={storeId} itemId={itemId}>
            <View style={styles.itemCountChangeButton}>
              <Text style={styles.incrementDecrementButtonText}>-</Text>
            </View>
          </DynamicButton>

          <Text style={styles.itemCount}>{itemCount}</Text>

          <DynamicButton onPress={increment} storeId={storeId} itemId={itemId}>
            <View style={styles.itemCountChangeButton}>
              <Text style={styles.incrementDecrementButtonText}>+</Text>
            </View>
          </DynamicButton>
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
