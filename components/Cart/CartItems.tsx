import React, { useState, useEffect, useMemo } from "react";
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
import { AntDesign } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import { useToast } from "react-native-toast-notifications";

const { width: windowWidth } = Dimensions.get("window");
const widthPercentageToDP = (percent: string) => {
  const widthPercent = parseFloat(percent);
  return (windowWidth * widthPercent) / 100;
};

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  items: CartItemType[];
  onCartChange?: () => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cartId,
  storeSlug,
  items,
  onCartChange,
}) => {
  const { removeCartItems, removeCart, updateQty } = useCartStore();
  const { userDetails, } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast()

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [formatCurrency, setFormatCurrency] = useState<
    (amount: number) => string
  >(() => (amount: number) =>
    `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`
  );

  useEffect(() => {
    setFormatCurrency(() => (amount: number) =>
      `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`
    );
  }, []);

const handleQuantityChange = async (
  cartItemId: string,
  qty: number
) => {
  if (!authToken) {
    Alert.alert("Please login to update item quantity.");
    return;
  }
  if (!cartItemId || qty <= 0) return;
  if (isUpdating) return;

  setIsUpdating(cartItemId);
  try {
    const success = await updateQty(cartItemId, qty, authToken);
    if (!success) {
      Alert.alert("Error", "Failed to update item quantity.");
    } else {
      onCartChange?.();
    }
  } catch (error) {
    console.error("Error updating quantity", error);
    Alert.alert("Error", "Could not update the item's quantity.");
  } finally {
    setIsUpdating(null);
  }
};

// ✅ Fixed Increment & Decrement handlers
const increment = (itemId: string, qty: number) => {
  handleQuantityChange(itemId, qty + 1);
};

const decrement = (itemId: string, qty: number) => {
  if (qty > 1) {
    handleQuantityChange(itemId, qty - 1);
  } else {
    handleDeleteItem(itemId);
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
                const success = await removeCart(storeSlug, authToken);
                if (!success) {
                  Alert.alert("Error", "Failed to remove cart.");
                } else {
                  onCartChange?.();
                }
              } catch (error) {
                console.error("Error deleting cart:", error);
                Alert.alert("Error", "Failed to remove cart.");
              }
            },
          },
        ]
      );
    } else {
      try {
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          Alert.alert("Error", "Failed to remove item.");
        } else {
          onCartChange?.();
        }
      } catch (error) {
        console.error("Error deleting cart item:", error);
        Alert.alert("Error", "Failed to remove item.");
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
                    {formatCurrency(maximum_value)}{" "}
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
    onPress={() => decrement(itemId, qty)}
    activeOpacity={0.7}
  >
    <Text style={styles.sign}>-</Text>
  </TouchableOpacity>

  <Text style={styles.quantity}>{qty}</Text>

  <TouchableOpacity
    onPress={() => increment(itemId, qty)}
    activeOpacity={0.7}
  >
    <Text style={styles.sign}>+</Text>
  </TouchableOpacity>
</View>
      </View>
    );
  };

  const { totalCost, savings } = useMemo(() => {
    if (!items?.length) return { totalCost: 0, savings: 0 };
    let cost = 0;
    let totalSavings = 0;
    items.forEach((item) => {
      cost += item.total_price;
      totalSavings += item.total_max_price - item.total_price;
    });
    return { totalCost: cost, savings: totalSavings };
  }, [items]);

  if (!items?.length) {
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
          Items in the cart ({items.length})
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
            if (storeSlug) {
              router.push({
                pathname: "/(tabs)/home/result/productListing/[id]",
                params: { id: storeSlug },
              });
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
                  pathname: "./cart/[checkout]",
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
  sign: {
  fontSize: 20,
  fontWeight: "bold",
  paddingHorizontal: 10,
  color: "#333",
},
  disabledText: {
    color: '#ccc',
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