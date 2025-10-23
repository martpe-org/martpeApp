import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const wishlistHeading = "Your Favorites";

const HeaderWishlist = () => {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/account")}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back-outline" size={26} color="black" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{wishlistHeading}</Text>
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
    height: 56,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
});

export default HeaderWishlist;
