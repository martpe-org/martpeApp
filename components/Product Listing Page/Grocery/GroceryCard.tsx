import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface GroceryCardProps {
  id: string;
  itemName: string;
  cost: number;
  imageUrl: string;
  maxLimit: number;
  providerId: string;
  weight?: string;
  unit?: string;
  originalPrice?: number;
  discount?: number;
}

const GroceryCard: React.FC<GroceryCardProps> = ({
  itemName,
  cost,
  imageUrl,
  maxLimit,
  weight = "1kg",
  unit = "piece",
  originalPrice,
  discount,
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {itemName}
        </Text>
        <Text style={styles.weight}>{weight} / {unit}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{cost.toFixed(2)}</Text>
          {discount && originalPrice && (
            <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
          )}
        </View>

        {discount && <Text style={styles.discount}>{discount}% off</Text>}
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroceryCard;

const styles = StyleSheet.create({
  card: {
    width: 150,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  info: {
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: "#333",
  },
  weight: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // for spacing between price and originalPrice
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f14343",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
  },
  discount: {
    fontSize: 12,
    color: "#28a745",
    marginTop: 2,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: "#f14343",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
