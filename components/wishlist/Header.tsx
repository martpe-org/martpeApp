import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";

const wishlistHeading = "Wishlist";

const HeaderWishlist = () => {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        width: widthPercentageToDP(100),
        alignItems: "center",
        paddingVertical: Dimensions.get("window").width * 0.03,
        flexDirection: "row",
        justifyContent: "center",
        marginBottom:10
      }}
    >
      <TouchableOpacity
        style={{
          position: "absolute",
          left: Dimensions.get("window").width * 0.05,
        }}
        onPress={() => {
          router.push("/(tabs)/account");
        }}
      >
        <Ionicons name="arrow-back-outline" size={20} color="black" />
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
        {wishlistHeading.toUpperCase()}
      </Text>
    </View>
  );
};

export default HeaderWishlist;
