import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={{ paddingTop: 5, paddingBottom: 5 }}>
      <TouchableOpacity style={styles.locationRow} onPress={onPress}>
        <Entypo
          name="location"
          size={16}
          color="white"
          style={{ marginLeft: -5,marginRight: 6 }}
        />
        <Text style={styles.locationTxt} numberOfLines={1}>
          {selectedDetails?.city || "Select Location"}
          {selectedDetails?.pincode ? `, ${selectedDetails.pincode}` : ""}
        </Text>
        <Entypo name="chevron-right" size={18} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    justifyContent: "space-between",
    backgroundColor: "#fa5959",
    marginHorizontal:-8,
    borderRadius: 32,
  },
  locationTxt: {
    color: "white",
    fontSize: 16,
    flex: 1,           // text takes remaining space
    marginRight: 6,    // space between text and arrow
  },
});
