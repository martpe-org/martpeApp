import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DiscountBadgeProps {
  percent: number;
  style?: object;
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({ percent, style }) => {
  if (!percent || percent <= 0) return null;

  return (
    <View style={[styles.offerBadge, style]}>
      <Text style={styles.offerBadgeText}>{Math.round(percent)}% OFF</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  offerBadge: {
    backgroundColor: "#0f7a0f",
    borderRadius: 4,
    position: "absolute",
    top: 0,
    left: 0,
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    zIndex: 2,
  },
  offerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default DiscountBadge;
