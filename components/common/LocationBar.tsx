import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";

interface DeliveryDetails {
  addressId: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  name: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

interface LocationBarProps {
  selectedDetails: DeliveryDetails | null;
  onPress: () => void;
}

export default function LocationBar({ selectedDetails, onPress }: LocationBarProps) {
  return (
    <TouchableOpacity style={styles.locationRow} onPress={onPress}>
      <FontAwesome6
        name="location-pin-lock"
        size={18}
        color="white"
        style={{ marginRight: 16 }}
      />
      <Text style={styles.deliveryTxt}>Delivering to</Text>
      <Text style={styles.locationTxt} numberOfLines={1}>
        {selectedDetails?.city || "Select Location"}
        {selectedDetails?.pincode ? `, ${selectedDetails.pincode}` : ""}
      </Text>
      <Entypo name="chevron-down" size={18} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTxt: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 6,
    marginLeft: -12,
  },
  locationTxt: {
    color: "white",
    fontSize: 14,
    marginRight: 4,
  },
});