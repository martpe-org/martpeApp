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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import useUserDetails from "../../hook/useUserDetails";

interface FavOutletsProps {
  itemsData: any[];
}

const FavOutlets: FC<FavOutletsProps> = ({ itemsData }) => {
  const { removeStoreFavorite } = useFavoriteStore(); // Use store-specific method
  const { userDetails } = useUserDetails();

  const handleRemoveFavorite = async (storeId: string) => {
    if (!userDetails?.accessToken) {
      console.error("No access token available");
      return;
    }
    
    if (!storeId) {
      console.error("Store ID is required");
      return;
    }

    await removeStoreFavorite(storeId, userDetails.accessToken); // Use correct method
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
          fontSize: 18, 
          color: '#607274', 
          marginTop: 16,
          textAlign: 'center'
        }}>
          No favorite outlets yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ marginBottom: Dimensions.get("screen").width * 0.2 }}
      showsVerticalScrollIndicator={false}
    >
      {[...itemsData].reverse().map((store: any, index: number) => {
        // Ensure we have required data
        if (!store?.id) {
          console.warn(`Store at index ${index} missing ID:`, store);
          return null;
        }

        const storeName = store.descriptor?.name || "Unnamed Store";
        const storeImage = store.descriptor?.symbol || "https://via.placeholder.com/150?text=Store";
        const locality = store.address?.locality || "";
        const state = store.address?.state || "";
        const city = store.address?.city || "";
        const maxOfferPercent = store.calculated_max_offer?.percent || 0;

        return (
          <TouchableOpacity
            onPress={() => handleStorePress(store.id)}
            key={`${store.id}-${index}`} // More unique key
            style={{
              flexDirection: "row",
              marginTop: Dimensions.get("screen").width * 0.05,
              justifyContent: "flex-start",
              paddingHorizontal: Dimensions.get("screen").width * 0.03,
              paddingVertical: Dimensions.get("screen").width * 0.03,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: "#F5F7F8",
            }}
          >
            {/* Store Image */}
            <View>
              <ImageComp
                source={{ uri: storeImage }}
                imageStyle={{
                  aspectRatio: 1,
                  height: 60,
                  borderRadius: 100,
                }}
                resizeMode="cover"
              />
            </View>

            {/* Store Info */}
            <View style={{ 
              marginHorizontal: Dimensions.get("screen").width * 0.03,
              flex: 1 
            }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#3D3B40",
                }}
                numberOfLines={2}
              >
                {storeName}
              </Text>

              {/* Rating + Offer */}
              <View style={{ flexDirection: "row", marginVertical: 4, alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
                  <MaterialCommunityIcons name="star" size={18} color="#FFD523" />
                  <Text style={{ fontSize: 14, fontWeight: "400", marginLeft: 2 }}>
                    4.2
                  </Text>
                </View>
                
                {Math.ceil(maxOfferPercent) > 0 && (
                  <Text
                    style={{
                      color: "#00BC66",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Upto {Math.ceil(maxOfferPercent)}% Off
                  </Text>
                )}
              </View>

              {/* Address + Delivery + Favorite */}
              <View style={{ flexDirection: "column" }}>
                {(locality || state) && (
                  <Text
                    style={{
                      color: "#3D3B40",
                      fontWeight: "500",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    <MaterialCommunityIcons name="map-marker" />{" "}
                    {locality && state ? `${locality}, ${state}` : locality || state}
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Delivery Info */}
                  <Text
                    style={{
                      color: "#73777B",
                      fontSize: 13,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    <MaterialCommunityIcons name="truck" />{" "}
                    {store?.panIndia 
                      ? "Delivers Across India"
                      : `Delivers within ${city || "local area"}`
                    }
                  </Text>

                  {/* Remove Favorite */}
                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(store.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ marginLeft: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="heart"
                      size={24}
                      color="#F13A3A"
                    />
                  </TouchableOpacity>
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