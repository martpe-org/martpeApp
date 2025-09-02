import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useCartStore } from "@/state/useCartStore";
import { FontAwesome } from "@expo/vector-icons";
import CartItems from "./CartItems";
import { router } from "expo-router";
import useUserDetails from "../../hook/useUserDetails";

interface CartCardProps {
  store: {
    _id: string;
    name?: string;
    slug?: string;
  };
  items: any[];
  id: string;
}

const CartCard: React.FC<CartCardProps> = ({ store, items,id }) => {
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;

  const [isRemoving, setIsRemoving] = useState(false);

  if (!items || items.length === 0) return null;

// ✅ Handle delete with confirm
const handleRemoveCart = () => {
  if (!authToken || !store?._id) {
    Alert.alert("Login Required", "Please login to remove cart.");
    return;
  }

  Alert.alert(
    "Remove Cart",
    `Are you sure you want to remove the cart from "${store.name || "this store"}"?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setIsRemoving(true);
          try {
            // Use the removeCart method from your Zustand store instead of the imported function
            const success = await useCartStore.getState().removeCart(store._id, authToken);
            
            if (!success) {
              throw new Error("Failed to remove cart");
            }
            
            // Optionally sync with API after successful removal
            await useCartStore.getState().syncCartFromApi(authToken);
          } catch (err) {
            console.error("CartCard: removeCart failed", err);
            Alert.alert("Error", "Failed to remove cart. Please try again.");
          } finally {
            setIsRemoving(false);
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <TouchableOpacity
            onPress={() =>
              store?.slug &&
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
          >
            <Text style={styles.title}>{store?.name || "Unknown Store"}</Text>
          </TouchableOpacity>
          <Text style={styles.itemCount}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRemoveCart}
          disabled={isRemoving || !authToken}
          style={styles.trashButton}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="#e11d48" />
          ) : (
            <FontAwesome
              name="trash"
              size={18}
              color={authToken ? "#e11d48" : "#ccc"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Items */}
<View style={styles.itemsList}>
  <CartItems
    cartId={id}
    storeSlug={store?.slug ?? ""}
    storeId={store?._id}
    items={items}
  />
</View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  storeInfo: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemCount: { fontSize: 12, color: "#666", fontWeight: "500" },
  trashButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsList: { paddingBottom: 8 },
});

export default CartCard;
