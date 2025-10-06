import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";

import useUserDetails from "../../../hook/useUserDetails";
import { useFavoriteStore } from "../../../state/useFavoriteStore";

import HeaderWishlist from "../../../components/wishlist/Header";
import TabBar, { WishlistTab } from "../../../components/wishlist/TabBar";
import FavItems from "../../../components/wishlist/FavItems";
import FavOutlets from "../../../components/wishlist/FavOutlets";
import Loader from "../../../components/common/Loader";

const Wishlist = () => {
  const { authToken } = useUserDetails();
  const { allFavorites, isLoading, error, fetchFavs } = useFavoriteStore();

  const [selectedTab, setSelectedTab] = useState<WishlistTab>("Items");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authToken) fetchFavs(authToken);
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

  const itemsCount = allFavorites?.products?.length ?? 0;
  const outletsCount = allFavorites?.stores?.length ?? 0;

  const renderContent = () => {
    if (isLoading && !refreshing) return <Loader />;

    if (!authToken) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.errorSubtext}>Pull to refresh or try again later</Text>
        </View>
      );
    }

    if (selectedTab === "Items") {
      return <FavItems favorites={allFavorites?.products ?? []} authToken={authToken} />;
    }

    return <FavOutlets itemsData={allFavorites?.stores ?? []} authToken={authToken} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderWishlist />

      {/* Tabs */}
      <TabBar
        selectedTab={selectedTab}
        selectTab={setSelectedTab}
        itemsCount={itemsCount}
        outletsCount={outletsCount}
      />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0066CC"]}
            tintColor="#0066CC"
          />
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default Wishlist;
