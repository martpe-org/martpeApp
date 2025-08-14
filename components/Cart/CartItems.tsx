import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { DecrementIcon, IncrementIcon } from "../../constants/icons/carticons";
import { AntDesign } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";

const { width: windowWidth } = Dimensions.get("window");
const widthPercentageToDP = (percent: string) => {
  const widthPercent = parseFloat(percent);
  return (windowWidth * widthPercent) / 100;
};

interface CartItemsProps {
  cartId: string;
  storeId: string;
  items: CartItemType[];
  onCartChange?: () => void;
    updateQty?: (cartItemId: string, qty: number) => Promise<boolean>;  // Add callback for cart changes
}

const CartItems: React.FC<CartItemsProps> = ({ cartId, storeId, items, onCartChange }) => {
  const { removeCartItems, removeCart, updateQty } = useCartStore();
 const { userDetails, isLoading: isUserLoading } = useUserDetails();
const authToken = userDetails?.accessToken;



  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const formatCurrency = useCallback(
    (amount: number) => `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`,
    []
  );

const handleQuantityChange = async (
  cartItemId: string,
  qty: number,
  authToken: string
) => {
  if (!cartItemId || qty < 0 || !authToken) {
    console.warn("Cannot update quantity: Invalid input", {
      cartItemId,
      qty,
      authToken,
    });
    return;
  }

  setIsUpdating(cartItemId);

  try {
    console.log("Updating cart item", { cartItemId, qty });

    const success = updateQty
      ? await updateQty(cartItemId, qty, authToken)
      : await useCartStore.getState().updateQty(cartItemId, qty, authToken);

    if (!success) {
      console.error("Failed to update quantity for", cartItemId);
      Alert.alert(
        "Error",
        "Failed to update item quantity. Please check stock or try again."
      );
    } else {
      console.log("Quantity updated successfully for", cartItemId);
      onCartChange?.();
    }
  } catch (error) {
    console.error("Error updating item quantity", error);
    Alert.alert(
      "Error",
      "Failed to update item quantity. Please check your connection and try again."
    );
  } finally {
    setIsUpdating(null);
  }
};


  const handleDeleteItem = async (cartItemId: string) => {
    if (!authToken || !cartItemId) return;

    if (items?.length === 1) {
      Alert.alert(
        "Remove Cart",
        "This is the last item in your cart. Removing it will delete the entire cart. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await removeCart(storeId, authToken);
                if (!success) {
                  Alert.alert("Error", "Failed to remove cart. Please try again.");
                } else {
                  // The Zustand store already updates the state
                  onCartChange?.();
                }
              } catch (error) {
                console.error("Error deleting cart:", error);
                Alert.alert("Error", "Failed to remove cart. Please try again.");
              }
            },
          },
        ]
      );
    } else {
      try {
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          Alert.alert("Error", "Failed to remove item. Please try again.");
        } else {
          // The Zustand store already updates the state
          onCartChange?.();
        }
      } catch (error) {
        console.error("Error deleting cart item:", error);
        Alert.alert("Error", "Failed to remove item. Please try again.");
      }
    }
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    if (!item) return null;

    const itemId = item._id;
    const name = item.product.name || "Unknown Item";
    const symbol = item.product.symbol;
    const value = item.unit_price || 0;
    const maximum_value = item.unit_max_price || value;
    const qty = item.qty;
    const maxCount = item.product.quantity || 999;
    const availableCount = item.product.instock ? maxCount : 0;

    const maxLimit = Math.min(maxCount, availableCount);
const isItemUpdating = isUpdating === itemId;
const isDisabled = isItemUpdating || !authToken || isUserLoading;

    return (
      <View style={styles.itemContainer} key={itemId}>
        <View style={styles.itemDescContainer}>
          <View style={styles.itemImgContainer}>
            {symbol ? (
              <Image
                source={{ uri: symbol }}
                style={styles.productImage}
                onError={() => console.warn("Failed to load product image")}
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]} />
            )}
          </View>

          <View style={styles.itemDetails}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>

            <View style={styles.itemPriceInfoContainer}>
              <Text style={styles.itemPriceText}>
                {maximum_value > value && (
                  <Text style={styles.strikethroughPrice}>
                    {formatCurrency(maximum_value)}{"  "}
                  </Text>
                )}
                {formatCurrency(value)}
              </Text>

              <Text style={styles.quantityText}>x {qty}</Text>

              <Text style={styles.itemTotalCostText}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cartItemQuantityContainer}>
    <TouchableOpacity
  onPress={() => {
    if (isDisabled) return;

    if (!authToken) {
      Alert.alert("Login Required", "Please login to update item quantity.");
      return;
    }

    if (qty > 1) {
      handleQuantityChange(itemId, qty - 1, authToken);
    } else {
      handleDeleteItem(itemId);
    }
  }}
  disabled={isDisabled}
  activeOpacity={0.7}
  style={[isDisabled && { opacity: 0.5 }]}
>
  <DecrementIcon />
</TouchableOpacity>


          <Text style={styles.quantity}>{qty}</Text>

       {qty < maxLimit ? (
 <TouchableOpacity
  onPress={() => {
    if (isDisabled || qty >= maxLimit) return;

    if (!authToken) {
      Alert.alert("Login Required", "Please login to update item quantity.");
      return;
    }

    handleQuantityChange(itemId, qty + 1, authToken);
  }}
  disabled={isDisabled || qty >= maxLimit}
  activeOpacity={0.7}
  style={[isDisabled && { opacity: 0.5 }]}
>
  <IncrementIcon />
</TouchableOpacity>
) : (
  <IncrementIcon disabled />
)}

        </View>
      </View>
    );
  };

  const { totalCost, savings } = useMemo(() => {
    if (!items || items.length === 0) return { totalCost: 0, savings: 0 };

    let cost = 0;
    let totalSavings = 0;

    items.forEach((item) => {
      cost += item.total_price;
      totalSavings += item.total_max_price - item.total_price;
    });

    return { totalCost: cost, savings: totalSavings };
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsHeader}>
          Items in the cart ({items?.length || 0})
        </Text>

        <View style={styles.listContainer}>
          <FlashList
            data={items}
            renderItem={renderCartItem}
            estimatedItemSize={83}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.row}>
          <Text style={[styles.text, styles.bold]}>Total</Text>
          <Text style={[styles.text, styles.bold]}>
            {formatCurrency(totalCost)}
          </Text>
        </View>

        {savings > 0 && (
          <View style={styles.row}>
            <Text style={[styles.text, styles.savingsText]}>
              You are saving {formatCurrency(savings)} on this order!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.addMoreContainer}
          onPress={() => {
            if (storeId) {
              router.back();
            }
          }}
          activeOpacity={0.7}
        >
          <AntDesign name="plus" size={16} color="black" />
          <Text style={styles.addMoreItemsText}>Add more items</Text>
        </TouchableOpacity>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
              if (cartId) {
                router.push({
                  pathname: "../app/(tabs)/cart/[checkout]",
                  params: { id: cartId },
                });
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9ecef",
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  itemsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listContainer: {
    minHeight: 100,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemDescContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemImgContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  placeholderImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPriceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemPriceText: {
    fontSize: 14,
    color: "#333",
  },
  strikethroughPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    marginRight: 4,
  },
  quantityText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  itemTotalCostText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  cartItemQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 6,
  },
  quantity: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  savingsText: {
    color: "#4CAF50",
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  addMoreItemsText: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttons: {
    flex: 1,
    alignItems: "flex-end",
  },
  checkoutButton: {
    backgroundColor: "#2f9740",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "white",
    elevation: 2,
  },
  headerDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalHeaderText: {
    fontSize: 14,
  },
  dot: {
    color: "#848080",
    fontSize: 12,
  },
  listWrapper: {
    minHeight: 2,
    paddingVertical: 10,
  },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTextContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#292935",
    fontWeight: "600",
    fontSize: 20,
  },
  emptySubtitle: {
    color: "#707077",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 10,
  },
  startShoppingButton: {
    backgroundColor: "#f14343",
    width: widthPercentageToDP("90"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  startShoppingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
});

export default CartItems;