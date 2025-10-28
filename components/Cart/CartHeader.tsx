import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface CartHeaderProps {
  totalItems: number;
  totalCarts: number;
  multipleCarts: boolean;
}

const CartHeader: React.FC<CartHeaderProps> = ({ totalItems, totalCarts, multipleCarts }) => {
  const router = useRouter();

  return (
    <>
      {/* Top Title Bar */}
      <View style={styles.title}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.titleText}>{multipleCarts ? "My Carts" : "My Cart"}</Text>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => router.push("/(tabs)/account/wishlist")}
        >
          <MaterialCommunityIcons
          name="heart-outline"
          size={24}
           color="red"
          />
        </TouchableOpacity>
      </View>

      {/* Sub-header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={16} color="black" />
        <View style={styles.headerDetails}>
          <Text style={styles.totalHeaderText}>
            {totalItems} Item{totalItems !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.dot}>{" \u25CF"}</Text>
          <Text style={styles.totalHeaderText}>
            {totalCarts} Store{totalCarts !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: { fontSize: 20, fontWeight: "700", marginLeft: 10, flex: 1 },
  wishlistButton: { flexDirection: "column", alignItems: "center" },
  wishlistText: { color: "#f14343", fontSize: 14, fontWeight: "bold" },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "white",
    elevation: 2,
  },
  headerDetails: { flexDirection: "row", alignItems: "center", gap: 6 },
  totalHeaderText: { fontSize: 14 },
  dot: { color: "#848080", fontSize: 12 },
});

export default CartHeader;
