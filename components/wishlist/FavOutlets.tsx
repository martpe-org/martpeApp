import React, { FC } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { useRouter } from "expo-router";
import ImageComp from "../../components/common/ImageComp";
import { ActivityIndicator } from "react-native-paper";
import LikeButton from "../common/likeButton";

const { width: screenWidth } = Dimensions.get("screen");

interface FavOutletsProps {
  itemsData: any[];
  authToken: string;
}

const FavOutlets: FC<FavOutletsProps> = ({ itemsData = [], authToken }) => {
  const { isLoading } = useFavoriteStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!itemsData.length) {
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
      {[...itemsData].reverse().map((store: any, index: number) => {
        const storeName =
          store?.descriptor?.name || store?.name || "Unnamed Store";
        const storeDescription =
          store?.descriptor?.short_desc ||
          store?.short_desc ||
          store?.description ||
          store?.descriptor?.description ||
          null;
        const imageUrl = store?.symbol;

        return (
          <View
            key={store.id || store.slug || `store-${index}`}
            style={styles.storeCard}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.favoriteIndicator}>
                <FontAwesome name="heart" size={16} color="#E53E3E" />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#E53E3E",
                  }}
                >
                  Favorite
                </Text>
              </View>

              {/* 🔄 LikeButton syncs removal */}
              <LikeButton
                vendorId={store.id}
                storeData={store}
                color="#E11D48"
              />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.imageContainer}>
                <ImageComp
                  source={imageUrl}
                  imageStyle={styles.storeImage}
                  resizeMode="contain"
                />
              </View>
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
    shadowOffset: { width: 0, height: 2 },
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
