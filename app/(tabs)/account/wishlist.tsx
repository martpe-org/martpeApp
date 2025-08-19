import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import useUserDetails from "../../../hook/useUserDetails";
import { useFavoriteStore } from "../../../state/useFavoriteStore";
import HeaderWishlist from "../../../components/wishlist/Header";
import TabBar, { WishlistTab } from "../../../components/wishlist/TabBar"; // Animated TabBar
import FavItems from "../../../components/wishlist/FavItems";
import FavOutlets from "../../../components/wishlist/FavOutlets";

const Wishlist = () => {
  const { authToken } = useUserDetails();
  const { allFavorites, isLoading, error, fetchFavs } = useFavoriteStore();

  const [selectedTab, setSelectedTab] = useState<WishlistTab>("Items");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authToken) {
      fetchFavs(authToken);
    }
  }, [authToken, fetchFavs]);

  const handleRefresh = useCallback(async () => {
    if (!authToken) return;
    try {
      setRefreshing(true);
      await fetchFavs(authToken);
    } finally {
      setRefreshing(false);
    }
  }, [authToken, fetchFavs]);

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.errorSubtext}>
            Pull to refresh or try again later
          </Text>
        </View>
      );
    }

    if (!authToken) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
        </View>
      );
    }

    return selectedTab === "Items" ? (
      <FavItems favorites={allFavorites?.products ?? []} authToken={authToken} />
    ) : (
      <FavOutlets itemsData={allFavorites?.stores ?? []} />
    );
  };

  return (
    <View style={styles.container}>
      <HeaderWishlist />
      <TabBar selectTab={setSelectedTab} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
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
    flex: 1,
    padding: 20,
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
