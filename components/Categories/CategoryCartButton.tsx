import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import DynamicButton from "../ProductDetails/DynamicButton";

interface CategoryCartButtonProps {
  storeId: string;
  catalogId: string;
  slug: string;
  cartItemId?: string;
  initialQuantity?: number;
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
  maxQuantity?: number;
}

const CategoryCartButton: React.FC<CategoryCartButtonProps> = ({
  storeId,
  catalogId,
  slug,
  cartItemId,
  initialQuantity = 0,
  customizable = false,
  customizations = [],
  maxQuantity = 10,
}) => {
  const [itemCount, setItemCount] = useState(initialQuantity);

  // Update local state when initialQuantity changes (e.g., from cart updates)
  useEffect(() => {
    setItemCount(initialQuantity);
  }, [initialQuantity]);

  const increment = () => {
    if (itemCount < maxQuantity) {
      setItemCount(itemCount + 1);
    }
  };

  const decrement = () => {
    if (itemCount > 0) {
      setItemCount(itemCount - 1);
    }
  };

  const handleAddSuccess = () => {
    // This will be called after successful add to cart
    // The cart store should update and initialQuantity should change
    console.log("Item added successfully");
  };

  const handleUpdateSuccess = () => {
    // This will be called after successful quantity update
    console.log("Cart updated successfully");
  };

  return (
    <View>
      {itemCount === 0 ? (
        <DynamicButton
          storeId={storeId}
          slug={slug}
          catalogId={catalogId}
          qty={1}
          isNewItem={true}
          customizable={customizable}
          customizations={customizations}
          onPress={increment}
          onSuccess={handleAddSuccess}
        >
          <View style={styles.add}>
            <Image source={require("../../assets/plus.png")} />
          </View>
        </DynamicButton>
      ) : (
        <View style={styles.incrementButton}>
          <DynamicButton
            storeId={storeId}
            cartItemId={cartItemId}
            qty={itemCount - 1}
            isUpdated={true}
            onPress={decrement}
            onSuccess={handleUpdateSuccess}
          >
            <View style={styles.decrementButton}>
              <Text style={styles.buttonText}>-</Text>
            </View>
          </DynamicButton>

          <Text style={styles.countText}>{itemCount}</Text>

          <DynamicButton
            storeId={storeId}
            cartItemId={cartItemId}
            qty={itemCount + 1}
            isUpdated={true}
            onPress={increment}
            onSuccess={handleUpdateSuccess}
            disabled={itemCount >= maxQuantity}
          >
            <View
              style={[
                styles.incrementButtonStyle,
                itemCount >= maxQuantity && styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>+</Text>
            </View>
          </DynamicButton>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00BC66",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incrementButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  decrementButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  incrementButtonStyle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00BC66",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  countText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  disabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
});

export default CategoryCartButton;
