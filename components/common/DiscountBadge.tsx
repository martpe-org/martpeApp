// components/common/DiscountBadge.tsx
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
    position: "absolute",
    top:10,
    left: 10,
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offerBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default DiscountBadge;
