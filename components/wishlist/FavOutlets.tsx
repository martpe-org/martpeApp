import React, { FC } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { useRouter } from "expo-router";
import ImageComp from "../../components/common/ImageComp";
import { Toast } from "react-native-toast-notifications";
import { ActivityIndicator } from "react-native-paper";

const { width: screenWidth } = Dimensions.get("screen");

interface FavOutletsProps {
  authToken: string;
}

const FavOutlets: FC<FavOutletsProps> = ({ authToken }) => {
  const { allFavorites, isLoading, removeStoreFavorite } = useFavoriteStore();
  const router = useRouter();
  const stores = allFavorites?.stores || [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!stores.length) {
    return (
      <View style={styles.center}>
        <FontAwesome name="heart-o" size={48} color="#CBD5E0" />
        <Text style={styles.emptyText}>No favorite outlets yet</Text>
        <Text style={styles.emptySubText}>
          Start exploring and add your favorites!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {[...stores].reverse().map((store: any, index: number) => {
        const storeName =
          store?.descriptor?.name || store?.name || "Unnamed Store";
        const storeDescription =
          store?.descriptor?.short_desc ||
          store?.short_desc ||
          store?.description ||
          store?.descriptor?.description ||
          null;
        const imageUrl = store?.symbol || store?.images?.[0] || null;

        return (
          <View
            key={store.id || store.slug || `store-${index}`}
            style={styles.storeCard}
          >
            {/* Header with Heart and Delete */}
            <View style={styles.cardHeader}>
              <View style={styles.favoriteIndicator}>
                <FontAwesome name="heart" size={16} color="#E53E3E" />
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  console.log("🗑️ Attempting to remove store:");
                  if (authToken) {
                    removeStoreFavorite(store.id || store.slug, authToken);
                  } else {
                    Toast.show("Authentication required", { type: "error" });
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome name="trash-o" size={18} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.cardContent}>
              {/* Store Image */}
              <View style={styles.imageContainer}>
                <ImageComp
                  source={imageUrl}
                  imageStyle={styles.storeImage}
                  resizeMode="contain"
                />
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName} numberOfLines={2}>
                  {storeName}
                </Text>
                {storeDescription ? (
                  <Text style={styles.storeDescription} numberOfLines={3}>
                    {storeDescription}
                  </Text>
                ) : (
                  <Text style={styles.noDescriptionText}>
                    No description available
                  </Text>
                )}

                {/* Store Badge */}
                <View style={styles.storeBadge}>
                  <MaterialIcons name="store" size={12} color="#4A5568" />
                  <Text style={styles.badgeText}>Favorite Store</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <TouchableOpacity
              style={styles.cardFooter}
              onPress={() =>
                router.push(`/(tabs)/home/result/productListing/${store.slug}`)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.viewStoreText}>Tap to view store</Text>
              <FontAwesome name="chevron-right" size={12} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  favoriteIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FED7D7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e8ecf0",
  },
  cardContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageContainer: {
    marginRight: 12,
  },
  storeImage: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  storeInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    lineHeight: 24,
    marginBottom: 6,
  },
  storeDescription: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: 12,
    flex: 1,
  },
  noDescriptionText: {
    fontSize: 14,
    color: "#A0AEC0",
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: "italic",
    flex: 1,
  },
  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "500",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FAFAFA",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  viewStoreText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
});

export default FavOutlets;
