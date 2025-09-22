import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";

interface CartCheckoutButtonProps {
  cartId: string;
  storeId: string;
  items: CartItemType[];
  isStoreOpen?: boolean; // true = store is open
}

const CartCheckoutButton: React.FC<CartCheckoutButtonProps> = ({
  cartId,
  storeId,
  items,
  isStoreOpen = true,
}) => {
  const hasItems = items && items.length > 0;
  
  // FIXED: Only check for unavailable items among items that exist
  const availableItems = items.filter((item) => item.product?.instock === true);
  const unavailableItems = items.filter((item) => item.product?.instock === false);
  
  const hasUnavailableItems = unavailableItems.length > 0;
  const hasAvailableItems = availableItems.length > 0;

  console.log('Checkout button logic:', {
    hasItems,
    isStoreOpen,
    totalItems: items.length,
    availableItems: availableItems.length,
    unavailableItems: unavailableItems.length,
    hasUnavailableItems,
    hasAvailableItems
  });

  // Early returns with proper messages
  if (!hasItems) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>No items in cart</Text>
        </View>
      </View>
    );
  }

  if (!isStoreOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>Store is closed. Checkout unavailable.</Text>
        </View>
      </View>
    );
  }

  // If there are unavailable items but also available items
  if (hasUnavailableItems && hasAvailableItems) {
    return (
      <View style={styles.container}>
        <View style={styles.warningButton}>
          <Text style={styles.warningText}>
            {unavailableItems.length} item(s) unavailable. Remove them to checkout.
          </Text>
        </View>
      </View>
    );
  }

  // If ALL items are unavailable
  if (hasUnavailableItems && !hasAvailableItems) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>All items unavailable. Cannot checkout.</Text>
        </View>
      </View>
    );
  }

  // All good - show checkout button
  const handlePress = () => {
    router.push({
      pathname: "/(tabs)/cart/[checkout]",
      params: { checkout: cartId, storeId },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkout}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.checkoutText}>
          Checkout ({availableItems.length} item{availableItems.length !== 1 ? 's' : ''})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  checkout: {
    backgroundColor: "#f14343",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#f14343",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#e5e5e5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#fff3cd",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});

export default CartCheckoutButton;