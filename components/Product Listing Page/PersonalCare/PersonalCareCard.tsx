import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.46; // responsive: 2 per row

interface PersonalCareCardProps {
  title: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  maxValue: number;
  id: string;
  providerId: string | string[];
}

const PersonalCareCard: React.FC<PersonalCareCardProps> = ({
  title,
  description,
  price,
  discount,
  image,
  maxValue,
  providerId,
  id,
}) => {
  const handlePress = () => {
    router.push(`/(tabs)/home/result/productDetails/${id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.85}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{
            uri: image || "https://via.placeholder.com/150?text=No+Image",
          }}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description || "No description available"}
        </Text>

        {/* Prices */}
        {discount > 1 && (
          <Text style={styles.strikedOff}>Rs.{maxValue}</Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs.{price}</Text>
          {discount > 1 && (
            <Text style={styles.discount}>{discount}% Off</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonalCareCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    elevation: 4,
    backgroundColor: "#fff",
    paddingBottom: 10,
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  imageContainer: {
    backgroundColor: "#f7f7f7",
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  title: {
    fontWeight: "700",
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  description: {
    color: "#777",
    fontSize: 12,
    marginBottom: 6,
  },
  strikedOff: {
    color: "#999",
    fontSize: 11,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f14343",
  },
  discount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#28a745",
  },
});
