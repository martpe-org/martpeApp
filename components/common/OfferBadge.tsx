import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
    // show "0% off" if it's actually 0
    text = `Upto ${maxStoreItemOfferPercent}% off`;
  } else {
    // force default text even if nothing provided
    text = "No Offers";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "green",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
});

export default OfferBadge;
