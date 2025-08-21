import ImageComp from "../../components/common/ImageComp";
import React, { FC } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import useUserDetails from "../../hook/useUserDetails";
import { Toast } from "react-native-toast-notifications";

interface FavOutletsProps {
  itemsData: any[];
  authToken?: string;
}

const FavOutlets: FC<FavOutletsProps> = ({ itemsData = [], authToken }) => {
  const { removeStoreFavorite } = useFavoriteStore();
  const { userDetails } = useUserDetails();

  const handleRemoveFavorite = async (storeId: string) => {
    const token = authToken || userDetails?.accessToken;
    
    if (!token) {
      console.error("No access token available");
      return;
    }
    
    if (!storeId) {
      console.error("Store ID is required");
      return;
    }

    await removeStoreFavorite(storeId, token);
    Toast.show("Store removed from favorites");
  };

  const handleStorePress = (storeId: string) => {
    if (!storeId) {
      console.error("Store ID is required for navigation");
      return;
    }
    router.push(`/(tabs)/home/result/productListing/${storeId}`);
  };

  if (!itemsData || itemsData.length === 0) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: 50,
        marginBottom: Dimensions.get("screen").width * 0.2
      }}>
        <MaterialCommunityIcons 
          name="store-outline" 
          size={64} 
          color="#D0D4CA" 
        />
        <Text style={{ 
          fontSize: 16, 
          color: '#888', 
          marginTop: 16,
          textAlign: 'center'
        }}>
          No favorite outlets yet ❤️
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {[...itemsData].reverse().map((store: any, index: number) => {
        // Ensure we have required data
        if (!store?.id) {
          console.warn(`Store at index ${index} missing ID:`, store);
          return null;
        }

        const storeName = store.descriptor?.name || store?.name || "Unnamed Store";
        const storeImage = store.descriptor?.symbol || store.descriptor?.images?.[0] || "https://via.placeholder.com/150?text=Store";
        const locality = store.address?.locality || "";
        const state = store.address?.state || "";
        const city = store.address?.city || "";
        const maxOfferPercent = store.calculated_max_offer?.percent || 0;

        return (
          <TouchableOpacity
            key={store.id || `store-${index}`}
            style={{
              flexDirection: "row",
              borderRadius: 12,
              backgroundColor: "#fff",
              marginTop: Dimensions.get("screen").width * 0.05,
              padding: Dimensions.get("screen").width * 0.05,
              shadowColor: "#831f1f",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 20,
            }}
            onPress={() => handleStorePress(store.id)}
          >
            {/* Store Image */}
            <ImageComp
              source={{ uri: storeImage }}
              imageStyle={{
                minHeight: Dimensions.get("screen").width * 0.25,
                width: Dimensions.get("screen").width * 0.25,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#eee",
                marginRight: 10,
              }}
              resizeMode="cover"
            />

            {/* Store Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#000",
                }}
                numberOfLines={2}
              >
                {storeName.split(" ").slice(0, 7).join(" ")}
              </Text>

              {/* Heart Icon - Top Right */}
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: -19,
                }}
              >
                <TouchableOpacity>
                  <FontAwesome name="heart" size={18} color="red" />
                </TouchableOpacity>
              </View>

              {/* Location */}
              {(locality || state) && (
                <Text
                  style={{
                    color: "#607274",
                    fontSize: 13,
                    marginVertical: 2,
                  }}
                  numberOfLines={1}
                >
                  <MaterialCommunityIcons name="map-marker" size={12} />{" "}
                  {locality && state ? `${locality}, ${state}` : locality || state}
                </Text>
              )}

              {/* Rating + Offer Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 4,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFD523" />
                  <Text style={{ fontSize: 14, fontWeight: "500", marginLeft: 2 }}>
                    4.2
                  </Text>
                </View>
                
                {Math.ceil(maxOfferPercent) > 0 && (
                  <Text
                    style={{
                      color: "green",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Upto {Math.ceil(maxOfferPercent)}% Off
                  </Text>
                )}
              </View>

              {/* Delivery Info + Remove Button */}
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: -5,
                }}
              >
                {/* Remove Favorite */}
                <TouchableOpacity
                  onPress={() => handleRemoveFavorite(store.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FontAwesome name="trash-o" size={18} color="#000" />
                </TouchableOpacity>

                {/* Delivery Info */}
                <Text
                  style={{
                    color: "#607274",
                    fontSize: 13,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  <MaterialCommunityIcons name="truck" size={12} />{" "}
                  {store?.panIndia 
                    ? "Delivers Across India"
                    : `Delivers within ${city || "local area"}`
                  }
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default FavOutlets;