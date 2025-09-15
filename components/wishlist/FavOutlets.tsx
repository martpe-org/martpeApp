import React, { FC, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { useRouter } from "expo-router";
import ImageComp from "../../components/common/ImageComp";
import Loader from "../common/Loader";
import { useToast } from "react-native-toast-notifications";

const { width: screenWidth } = Dimensions.get("screen");

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
        const storeDescription =
          store?.descriptor?.short_desc ||
          store?.short_desc ||
          store?.description ||
          store?.descriptor?.description ||
          null;
        const imageUrl = store?.symbol;
        const isDeleting = deletingStoreId === storeId;

        return (
          <View
            key={store.id || store.slug || `store-${index}`}
            style={[styles.storeCard, isDeleting && styles.deletingCard]}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.favoriteIndicator}>
                <FontAwesome name="heart" size={16} color="#E53E3E" />
                <Text style={styles.favoriteText}>Favorite</Text>
              </View>
              {/* Delete Button */}
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  isDeleting && styles.deleteButtonDisabled,
                ]}
                onPress={() => handleDeleteStore(store)}
                disabled={isDeleting || isUpdating}
              >
                {isDeleting ? (
                  <MaterialIcons
                    name="hourglass-empty"
                    size={20}
                    color="#0d5bc0"
                  />
                ) : (
                <MaterialCommunityIcons name="close" size={18} color="#050505" />
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            <TouchableOpacity
              style={[styles.cardContent, isDeleting && styles.disabledContent]}
              onPress={() =>
                !isDeleting &&
                router.push(`/(tabs)/home/result/productListing/${store.slug}`)
              }
              disabled={isDeleting}
            >
              <View style={styles.imageContainer}>
                <ImageComp
                  source={imageUrl}
                  imageStyle={styles.storeImage}
                  resizeMode="contain"
                />
                {isDeleting && <View style={styles.imageOverlay} />}
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
  deletingCard: {
    opacity: 0.6,
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
  favoriteText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#E53E3E",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#F7FAFC",
  },
  cardContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  disabledContent: {
    opacity: 0.7,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  storeImage: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
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
});
export default FavOutlets;
