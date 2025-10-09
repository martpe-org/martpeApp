import React from "react";
import {  Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface OfferBadgeProps {
  offers?: {
    short_desc: string;
    benefit?: { value_type: string };
    qualifier?: { min_value?: string };
  }[];
  maxStoreItemOfferPercent?: number;
}

const OfferBadge: React.FC<OfferBadgeProps> = ({
  offers,
  maxStoreItemOfferPercent,
}) => {
  let text = "";

  if (offers && offers.length > 0) {
    const offer = offers[0];
    text = offer.short_desc;
    if (
      offer.benefit?.value_type === "percentage" &&
      offer.qualifier?.min_value
    ) {
      text += ` above ${offer.qualifier.min_value}`;
    }
  } else if (maxStoreItemOfferPercent !== undefined) {
    text = `UPTO ${maxStoreItemOfferPercent}% OFF`;
  } else {
    text = "NO OFFERS";
  }

  return (
    <LinearGradient
      colors={["#ff9966","#ff5e62"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.text}>{text}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 5,
    left: 0,
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export default OfferBadge;
