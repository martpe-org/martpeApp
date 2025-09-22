import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const wishlistHeading = "Wishlist";

const HeaderWishlist = () => {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/account")}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{wishlistHeading.toUpperCase()}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56, // fixed compact height
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom:5,
    marginTop:-21
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});

export default HeaderWishlist;
