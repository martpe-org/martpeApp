import React, { FC, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { useRouter } from "expo-router";
import ImageComp from "../../components/common/ImageComp";
import Loader from "../common/Loader";
import { useToast } from "react-native-toast-notifications";
import OfferBadge from "../common/OfferBadge";
import { styles } from "./FavOutletsStyles";

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
export default FavOutlets;
