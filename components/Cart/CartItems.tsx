import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import useUserDetails from "../../hook/useUserDetails";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import { useToast } from "react-native-toast-notifications";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId?: string; // Add storeId prop
  items: CartItemType[];
  onCartChange?: () => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cartId,
  storeSlug,
  storeId,
  items,
  onCartChange,
}) => {
  const { removeCartItems, removeCart, updateQty } = useCartStore();
  const { userDetails, isLoading: isUserLoading } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  // Local state for optimistic updates
  const [localItems, setLocalItems] = useState<CartItemType[]>(items);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const formatCurrency = useCallback(
    (amount: number) => `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`,
    []
  );

  // Optimistic quantity update
  const updateLocalQuantity = useCallback((itemId: string, newQty: number) => {
    setLocalItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { 
              ...item, 
              qty: newQty,
              total_price: (item.unit_price || 0) * newQty
            }
          : item
      )
    );
  }, []);

  // Remove item from local state
  const removeLocalItem = useCallback((itemId: string) => {
    setLocalItems(prev => prev.filter(item => item._id !== itemId));
  }, []);

  // Enhanced quantity update with optimistic UI
  const handleQuantityChange = useCallback(async (
    cartItemId: string,
    newQty: number,
    currentQty: number
  ) => {
    if (isUserLoading || !authToken || newQty < 0 || newQty === currentQty) {
      if (!authToken && !isUserLoading) {
        Alert.alert("Login Required", "Please login to update item quantity.");
      }
      return;
    }

    // Optimistically update UI
    updateLocalQuantity(cartItemId, newQty);
    
    // Add to processing set
    setProcessingItems(prev => new Set(prev).add(cartItemId));

    try {
      const success = await updateQty(cartItemId, newQty, authToken);
      
      if (!success) {
        // Revert optimistic update on failure
        updateLocalQuantity(cartItemId, currentQty);
        if (toast?.show) {
          toast.show("Failed to update quantity", {
            type: "error",
            duration: 2000,
          });
        }
      } else {
        // Optional: trigger cart refresh for server sync
        // onCartChange?.();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      
      // Revert optimistic update on error
      updateLocalQuantity(cartItemId, currentQty);
      
      let errorMessage = "Could not update quantity";
      if (error instanceof Error && error.message.includes('network')) {
        errorMessage += ". Check your connection.";
      }
      
      if (toast?.show) {
        toast.show(errorMessage, {
          type: "error",
          duration: 2000,
        });
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  }, [authToken, isUserLoading, updateQty, updateLocalQuantity, toast]);

  // Increment quantity
  const increment = useCallback((itemId: string, currentQty: number, maxQty?: number) => {
    if (!authToken) {
      Alert.alert("Login Required", "Please login to update quantities.");
      return;
    }

    if (maxQty && currentQty >= maxQty) {
      if (toast?.show) {
        toast.show("Maximum quantity reached", { type: "warning", duration: 2000 });
      }
      return;
    }

    if (currentQty >= 99) {
      if (toast?.show) {
        toast.show("Maximum quantity limit reached", { type: "warning", duration: 2000 });
      }
      return;
    }

    handleQuantityChange(itemId, currentQty + 1, currentQty);
  }, [handleQuantityChange, authToken, toast]);

  // Decrement quantity or delete item
  const decrement = useCallback((itemId: string, currentQty: number) => {
    if (!authToken) {
      Alert.alert("Login Required", "Please login to update quantities.");
      return;
    }

    if (currentQty > 1) {
      handleQuantityChange(itemId, currentQty - 1, currentQty);
    } else {
      // Delete item when quantity is 1
      handleDeleteItem(itemId);
    }
  }, [handleQuantityChange, authToken]);

  const handleDeleteItem = useCallback(async (cartItemId: string) => {
    if (!authToken || !cartItemId) {
      Alert.alert("Authentication Required", "Please login to remove items.");
      return;
    }

    const confirmDelete = () => {
      Alert.alert(
        localItems.length === 1 ? "Remove Cart" : "Remove Item",
        localItems.length === 1 
          ? "This will delete the entire cart. Are you sure?"
          : "Remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: performDelete,
          },
        ]
      );
    };

    const performDelete = async () => {
      // Optimistically remove item
      removeLocalItem(cartItemId);
      setProcessingItems(prev => new Set(prev).add(cartItemId));
      try {
        let success;
        if (localItems.length === 1) {
          // Use storeId if available, fallback to extracting from first item, or use storeSlug as last resort
          const targetStoreId = storeId || localItems[0]?.store_id || storeSlug;
          success = await removeCart(targetStoreId, authToken);
        } else {
          success = await removeCartItems([cartItemId], authToken);
        }
        if (success) {
          const message = localItems.length === 1 ? "Cart removed" : "Item removed";
          if (toast?.show) {
            toast.show(message, { type: "success", duration: 2000 });
          }
          // Optional: trigger cart refresh
          // onCartChange?.();
        } else {
          // Revert optimistic update
          setLocalItems(items);
          Alert.alert("Error", "Failed to remove item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        // Revert optimistic update
        setLocalItems(items);
        Alert.alert("Error", "Failed to remove item. Please try again.");
      } finally {
        setProcessingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartItemId);
          return newSet;
        });
      }
    };

    confirmDelete();
  }, [authToken, localItems.length, removeCart, removeCartItems, storeId, storeSlug, toast, removeLocalItem, items]);

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    if (!item) return null;

    const itemId = item._id;
    const name = item.product?.name || "Unknown Item";
    const symbol = item.product?.symbol;
    const value = item.unit_price || 0;
    const maximum_value = item.unit_max_price || value;
    const qty = item.qty || 1;
    const maxQty = item.product?.quantity;

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

            {maxQty && maxQty <= 10 && (
              <Text style={styles.stockInfo}>
                Only {maxQty} left in stock
              </Text>
            )}

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
                {formatCurrency(item.total_price || value * qty)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cartItemQuantityContainer}>
          <TouchableOpacity
            onPress={() => decrement(itemId, qty)}
            activeOpacity={0.7}
            disabled={qty <= 1}
            style={[
              styles.quantityButton,
              qty <= 1 && styles.disabledButton
            ]}
          >
            <Text style={[
              styles.sign,
              qty <= 1 && styles.disabledText
            ]}>-</Text>
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantity}>{qty}</Text>
            {isUserLoading && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
            {!authToken && !isUserLoading && (
              <Text style={styles.authRequiredText}>Login required</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => increment(itemId, qty, maxQty)}
            activeOpacity={0.7}
            style={styles.quantityButton}
          >
            <Text style={styles.sign}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const { totalCost, savings, totalItems } = useMemo(() => {
    if (!localItems?.length) return { totalCost: 0, savings: 0, totalItems: 0 };
    
    let cost = 0;
    let totalSavings = 0;
    let itemCount = 0;
    
    localItems.forEach((item) => {
      if (item) {
        const itemTotal = item.total_price || (item.unit_price * item.qty);
        const itemMaxTotal = item.total_max_price || (item.unit_max_price * item.qty);
        
        cost += itemTotal;
        totalSavings += Math.max(0, itemMaxTotal - itemTotal);
        itemCount += item.qty || 1;
      }
    });
    
    return { 
      totalCost: cost, 
      savings: totalSavings, 
      totalItems: itemCount 
    };
  }, [localItems]);

  if (!localItems?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubText}>Add some delicious items to get started!</Text>
      </View>
    );
  }

  if (!authToken && !isUserLoading) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please login to manage your cart</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => Alert.alert("Login Required", "Please login to continue.")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isUserLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f9740" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsHeader}>
          Items in cart ({localItems.length} {localItems.length === 1 ? 'item' : 'items'}, {totalItems} total)
        </Text>

        <View style={styles.listContainer}>
          <FlashList
            data={localItems}
            renderItem={renderCartItem}
            estimatedItemSize={90}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.row}>
          <Text style={[styles.text, styles.bold]}>Subtotal</Text>
          <Text style={[styles.text, styles.bold]}>
            {formatCurrency(totalCost)}
          </Text>
        </View>
        {savings > 0 && (
          <View style={styles.row}>
            <Text style={[styles.text, styles.savingsText]}>
              You saved {formatCurrency(savings)} on this order! 🎉
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
            style={[
              styles.checkoutButton,
              !authToken && styles.disabledButton
            ]}
            onPress={() => {
              if (!authToken) {
                Alert.alert("Login Required", "Please login to checkout.");
                return;
              }
              
              if (cartId) {
                router.push({
                  pathname: "./cart/[checkout]",
                  params: { id: cartId },
                });
              }
            }}
            activeOpacity={0.8}
            disabled={!authToken}
          >
            <Text style={styles.checkoutButtonText}>
              {authToken ? `Checkout ` : "Login to Checkout"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 60,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  authText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#2f9740",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 60,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sign: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  disabledText: {
    color: '#ccc',
  },
  disabledButton: {
    opacity: 0.5,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  listContainer: {
    minHeight: 100,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemDescContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  itemImgContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 64,
    height: 64,
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
    lineHeight: 20,
  },
  stockInfo: {
    fontSize: 12,
    color: "#ff6b35",
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPriceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  itemPriceText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
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
    fontWeight: "700",
    marginLeft: 8,
    color: "#2f9740",
  },
  cartItemQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    minWidth: 100,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityDisplay: {
    paddingHorizontal: 8,
    minWidth: 36,
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  authRequiredText: {
    fontSize: 10,
    color: "#ff6b35",
    textAlign: "center",
  },
  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  bold: {
    fontWeight: "700",
  },
  savingsText: {
    color: "#2f9740",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  addMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addMoreItemsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  buttons: {
    flex: 1,
    alignItems: "flex-end",
  },
  checkoutButton: {
    backgroundColor: "#f14343",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    shadowColor: "#f14343",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 60,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
});

export default CartItems;