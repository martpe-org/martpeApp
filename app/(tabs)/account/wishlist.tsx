import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import useUserDetails from "../../../hook/useUserDetails";
import { useFavoriteStore } from "../../../state/useFavoriteStore";

// ✅ Reusable components
import HeaderWishlist from "../../../components/wishlist/Header";
import TabBar, { WishlistTab } from "../../../components/wishlist/TabBar";
import FavItems from "../../../components/wishlist/FavItems";
import FavOutlets from "../../../components/wishlist/FavOutlets";

const Wishlist = () => {
  const { authToken } = useUserDetails();
  const { allFavorites, isLoading, error, fetchFavs } = useFavoriteStore();

  const [selectedTab, setSelectedTab] = useState<WishlistTab>("Items");

  // Fetch favorites when component mounts or authToken changes
  useEffect(() => {
    if (authToken) {
      fetchFavs(authToken);
    }
  }, [authToken, fetchFavs]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Text style={styles.errorSubtext}>Pull to refresh or try again later</Text>
      </View>
    );
  }

  // No auth token
  if (!authToken) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
      </View>
    );
  }

  return (
  <View style={styles.container}>
    <HeaderWishlist />
    <TabBar selectTab={setSelectedTab} />

    {isLoading ? (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    ) : error ? (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Text style={styles.errorSubtext}>
          Pull to refresh or try again later
        </Text>
      </View>
    ) : !authToken ? (
      <View style={styles.centered}>
        <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
      </View>
    ) : selectedTab === "Items" ? (
      <FavItems favorites={allFavorites?.products ?? []} authToken={authToken} />
    ) : (
      <FavOutlets itemsData={allFavorites?.stores ?? []} />
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", 
    paddingTop: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default Wishlist;