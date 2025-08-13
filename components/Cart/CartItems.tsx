import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { DecrementIcon, IncrementIcon } from "../../constants/icons/carticons";
import { AntDesign } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";

interface CartItemsProps {
  cartId: string;
  storeId: string;
  items: CartItemType[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartId, storeId, items }) => {
  const { removeCartItems, removeCart, updateQty } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const formatCurrency = useCallback(
    (amount: number) => `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`,
    []
  );

  const handleQuantityChange = async (cartItemId: string, qty: number) => {
    if (!authToken || !cartItemId || qty < 0) return;

    setIsUpdating(cartItemId);
    try {
      console.log("Updating item quantity:", cartItemId, "to:", qty);

      const success = await updateQty(cartItemId, qty, authToken);

      if (!success) {
        Alert.alert(
          "Error",
          "Failed to update item quantity. Please try again."
        );
      } else {
        console.log("Quantity updated successfully");
      }
    } catch (error) {
      console.error("Error updating item quantity", error);
      Alert.alert("Error", "Failed to update item quantity. Please try again.");
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
                console.log("Removing entire cart for store:", storeId);
                const success = await removeCart(storeId, authToken);
                if (!success) {
                  Alert.alert("Error", "Failed to remove cart. Please try again.");
                } else {
                  console.log("Cart removed successfully");
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
        console.log("Removing single item:", cartItemId);
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          Alert.alert("Error", "Failed to remove item. Please try again.");
        } else {
          console.log("Item removed successfully");
        }
      } catch (error) {
        console.error("Error deleting cart item:", error);
        Alert.alert("Error", "Failed to remove item. Please try again.");
      }
    }
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    if (!item) return null;

    const itemId = item._id; // this is the cartItemId
    const name = item.product.name || "Unknown Item";
    const symbol = item.product.symbol;
    const value = item.unit_price || 0;
    const maximum_value = item.unit_max_price || value;
    const quantity = item.qty;
    const maxCount = item.product.quantity || 999;
    const availableCount = item.product.instock ? maxCount : 0;

    const maxLimit = Math.min(maxCount, availableCount);
    const isItemUpdating = isUpdating === itemId;

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

              <Text style={styles.quantityText}>x {quantity}</Text>

              <Text style={styles.itemTotalCostText}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cartItemQuantityContainer}>
          {/* Decrement button */}
          <TouchableOpacity
            onPress={() => {
              if (isItemUpdating) return;

              if (quantity > 1) {
                handleQuantityChange(itemId, quantity - 1);
              } else {
                handleDeleteItem(itemId);
              }
            }}
            disabled={isItemUpdating}
            activeOpacity={0.7}
          >
            <DecrementIcon />
          </TouchableOpacity>

          <Text style={styles.quantity}>{quantity}</Text>

          {/* Increment button */}
          {quantity < maxLimit ? (
            <TouchableOpacity
              onPress={() => {
                if (isItemUpdating) return;
                handleQuantityChange(itemId, quantity + 1);
              }}
              disabled={isItemUpdating}
              activeOpacity={0.7}
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
              router.push(`./home/result/productListing/${storeId}`);
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
                  pathname: "./(tabs)/cart/[checkout]",
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
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: "#666",
  },
  itemsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  itemsHeader: {
    paddingVertical: 10, 
    fontWeight: "500", 
    fontSize: 14,
    color: "#333",
  },
  listContainer: {
    minHeight: 2, 
    marginBottom: 10,
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 5,
  },
  itemDescContainer: {
    flexDirection: "row",
    flex: 3,
    alignItems: "center",
  },
  itemImgContainer: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  productImage: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    width: 50,
    height: 50,
    borderRadius: 8,
    resizeMode: "contain",
  },
  placeholderImage: {
    backgroundColor: '#e9ecef',
  },
  itemDetails: {
    justifyContent: "center",
    flex: 1,
    maxWidth: 150,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemPriceInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  itemPriceText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  strikethroughPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.5,
    fontSize: 12,
    color: "#666",
  },
  quantityText: {
    fontSize: 12,
    color: "#666",
  },
  cartItemQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 12,
    minWidth: 80,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00BC66",
    minWidth: 20,
    textAlign: "center",
  },
  itemTotalCostText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  priceContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    marginHorizontal: 15,
  },
  text: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#666",
  },
  bold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  savingsText: {
    color: "#00BC66",
    fontWeight: "500",
    fontSize: 13,
  },
  actionButtonsContainer: {
    flex: 1, 
    flexDirection: "row", 
    marginVertical: 10,
    gap: 10,
  },
  addMoreContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderRadius: 50,
    paddingVertical: 12,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  addMoreItemsText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "500",
  },
  buttons: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  checkoutButton: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#208b3a",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#208b3a",
    width: "100%",
  },
  checkoutButtonText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#fff",
  },
});

export default CartItems;