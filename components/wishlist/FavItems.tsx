import React, { FC } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFavoriteStore } from "../../state/useFavoriteStore";
import { useRouter } from "expo-router";
import ImageComp from "../../components/common/ImageComp";
import { Toast } from "react-native-toast-notifications";

interface FavItemsProps {
  favorites: any[];
  authToken: string;
}

const FavItems: FC<FavItemsProps> = ({ favorites = [], authToken }) => {
  const { removeFavorite } = useFavoriteStore();
  const router = useRouter();

  if (!favorites || favorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#888" }}>
          No favorite items yet ❤️
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
    >
      {[...favorites].reverse().map((item: any, index: number) => {
        const productName =
          item?.descriptor?.name || item?.name || "Unnamed Product";
        const providerName =
          item?.provider?.descriptor?.name || item?.brand || "Unknown Brand";
        const imageUrl =
          item?.descriptor?.images?.[0] || item?.images?.[0] || null;

        return (
          <TouchableOpacity
            key={item.id || item.slug || `fav-${index}`}
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
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/result/productDetails/[productDetails]",
                params: { productDetails: item.slug },
              })
            }
          >
            <ImageComp
              source={imageUrl}
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

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {productName.split(" ").slice(0, 7).join(" ")}
              </Text>
              <Text
                style={{ fontSize: 13, color: "#607274", marginVertical: 2 }}
              >
                {providerName}
              </Text>

              {/* Price Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 4,
                }}
              >
                {item.price?.maximum_value > item.price?.value && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#607274",
                      marginRight: 5,
                      textDecorationLine: "line-through",
                    }}
                  >
                    ₹ {item.price?.maximum_value}
                  </Text>
                )}
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#000" }}
                >
                  ₹ {item.price?.value}
                </Text>
                {item.price?.offer_percent && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "green",
                      marginLeft: 6,
                    }}
                  >
                    {Math.ceil(item.price.offer_percent)}% off
                  </Text>
                )}
              </View>

              {/* Action Row */}
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: -19,
                }}
              >
                {/* Heart / Remove */}
                <TouchableOpacity
                  onPress={() => {
                    if (authToken) removeFavorite(item.slug, authToken);
                    Toast.show("Item removed from favorites");
                  }}
                >
                  <MaterialCommunityIcons
                    name="heart"
                    size={24}
                    color="#F13A3A"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default FavItems;
