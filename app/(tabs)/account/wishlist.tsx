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
import TabBar, { WishlistTab } from "../../../components/wishlist/TabBar";
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

  // Get counts for tab display
  const itemsCount = allFavorites?.products?.length ?? 0;
  const outletsCount = allFavorites?.stores?.length ?? 0;

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

    // Render based on selected tab
    if (selectedTab === "Items") {
      return (
        <FavItems 
          favorites={allFavorites?.products ?? []} 
          authToken={authToken} 
        />
      );
    } else {
      return (
        <FavOutlets 
          itemsData={allFavorites?.stores ?? []}
          authToken={authToken} // Pass authToken to FavOutlets too
        />
      );
    }
  };

  const renderTabContent = () => {
    // Show loading state in tab content area
    if (isLoading && !refreshing && !allFavorites) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      );
    }

    return renderContent();
  };

  return (
    <View style={styles.container}>
      <HeaderWishlist />
      
      {/* Pass counts to TabBar for better UX */}
      <TabBar 
        selectTab={setSelectedTab} 
        selectedTab={selectedTab}
        itemsCount={itemsCount}
        outletsCount={outletsCount}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={["#0066CC"]} // Android
            tintColor="#0066CC" // iOS
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some bottom padding
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: 20,
    minHeight: 300, // Ensure minimum height for better UX
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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