import React, { FC, useState } from "react";
import {
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
import Loader from "../common/Loader";
import { useToast } from "react-native-toast-notifications";
import OfferBadge from "../common/OfferBadge";

interface FavOutletsProps {
  itemsData: any[];
  authToken: string;
}

const FavOutlets: FC<FavOutletsProps> = ({ itemsData = [], authToken }) => {
  const { isLoading, isUpdating, removeStoreFavorite } = useFavoriteStore();
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const handleDeleteStore = async (store: any) => {
    const storeId = store.id || store.slug;

    if (!authToken) {
      toast.show("Authentication required", { type: "danger" });
      return;
    }

    setDeletingStoreId(storeId);
    try {
      await removeStoreFavorite(storeId, authToken);
    } catch (err) {
    } finally {
      setDeletingStoreId(null);
    }
  };

  // ✅ Normalize offers from store or descriptor
  const extractOffers = (store: any): any[] => {
    if (Array.isArray(store?.offers)) return store.offers;
    if (Array.isArray(store?.descriptor?.offers)) return store.descriptor.offers;

    // Convert offer-like objects to array if needed
    if (store?.benefit) {
      return [
        {
          offer_id: store.offer_id || "",
          short_desc: store.short_desc,
          type: "discount",
          benefit: store.benefit,
          qualifier: store.qualifier,
        },
      ];
    }

    return [];
  };

  // ✅ Unified max offer extraction (based on normalization logic)
  const getMaxOfferPercent = (store: any): number => {
    const offers = extractOffers(store);
    if (!offers.length) return store.maxStoreItemOfferPercent || 0;

    const percentages = offers
      .map((offer) => {
        // Try different fields from possible offer shapes
        return (
          parseInt(offer?.offer_percentage) ||
          parseInt(offer?.discount_percentage) ||
          parseInt(offer?.benefit?.value) ||
          0
        );
      })
      .filter((p) => !isNaN(p) && p > 0);

    return percentages.length > 0
      ? Math.max(...percentages)
      : store.maxStoreItemOfferPercent || 0;
  };

  // Format address nicely
  const formatAddress = (address: any): string => {
    if (typeof address === "string") return address;
    if (typeof address === "object" && address !== null) {
      const parts = [];

      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.area_code) parts.push(address.area_code);
      return parts.length > 0 ? parts.join(", ") : "Address not available";
    }
    return "Address not available";
  };

  // Format category names
  const formatCategories = (categories: any[]): string => {
    if (!categories || !Array.isArray(categories)) return "Various categories";
    const categoryNames = categories
      .map((cat) => {
        if (typeof cat === "string") return cat;
        if (cat?.name) return cat.name;
        if (cat?.descriptor?.name) return cat.descriptor.name;
        if (cat?.id) return cat.id;
        return null;
      })
      .filter(Boolean);
    return categoryNames.length > 0
      ? categoryNames.join(", ")
      : "Various categories";
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Loader />
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
        const storeId = store.id || store.slug;
        const storeName =
          store?.descriptor?.name || store?.name || "Unnamed Store";

        const categories =
          store?.categories || store?.tags || store?.store_sub_categories || [];
        const categoryText = formatCategories(categories);

        const address = formatAddress(
          store?.address ||
            store?.location?.address ||
            store?.descriptor?.address ||
            store?.location
        );

        const imageUrl = store?.symbol || store?.descriptor?.symbol;
        const isDeleting = deletingStoreId === storeId;
        const maxOfferPercent = getMaxOfferPercent(store);

        return (
          <TouchableOpacity
            key={store.id || store.slug || `store-${index}`}
            style={[styles.storeCard, isDeleting && styles.deletingCard]}
            onPress={() =>
              !isDeleting &&
              router.push(`/(tabs)/home/result/productListing/${store.slug}`)
            }
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <ImageComp
                source={imageUrl}
                imageStyle={styles.storeImage}
                resizeMode="cover"
              />

              <TouchableOpacity
                style={styles.heartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteStore(store);
                }}
                disabled={isDeleting || isUpdating}
              >
                {isDeleting ? (
                  <MaterialIcons
                    name="hourglass-empty"
                    size={16}
                    color="#0d5bc0"
                  />
                ) : (
                  <FontAwesome name="heart" size={18} color="#E53E3E" />
                )}
              </TouchableOpacity>

              {maxOfferPercent > 0 && (
                <View style={styles.offerBadgeContainer}>
                  <OfferBadge
                    offers={extractOffers(store)}
                    maxStoreItemOfferPercent={maxOfferPercent}
                  />
                </View>
              )}
            </View>

            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {storeName}
              </Text>
              <Text style={styles.categories} numberOfLines={1}>
                {categoryText}
              </Text>
              <Text style={styles.address} numberOfLines={1}>
                {address}
              </Text>

              <View style={styles.statusContainer}>
                <View style={styles.openStatus}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>Open</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
    backgroundColor: "#fbfcfd",
    paddingHorizontal: 10,
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
    paddingHorizontal: 11,
    paddingVertical: 12,
  },
  storeCard: {
    backgroundColor: "#fcf3f3",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  deletingCard: {
    opacity: 0.6,
  },
  imageContainer: {
    position: "relative",
  },
  storeImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#F7FAFC",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 77,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  offerBadgeContainer: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  storeInfo: {
    padding: 6,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 6,
  },
  categories: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 6,
    lineHeight: 18,
  },
  address: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 12,
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  openStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  openDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27b45b",
    marginRight: 6,
  },
  openText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#27b45b",
  },
  discountBadge: {
    backgroundColor: "#FFE4E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E53E3E",
  },
});

export default FavOutlets;
