import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import CartItems from "./CartItems";
import { useCartStore } from "../../state/useCartStore";
import useDeliveryStore from "../../state/deliveryAddressStore";
import useUserDetails from "../../hook/useUserDetails";
import { getDistance } from "geolib";
import { FontAwesome } from "@expo/vector-icons";

interface CartCardProps {
  id: string;
  store: {
    id?: string;
    _id?: string;
    descriptor?: {
      name?: string;
      symbol?: string;
    };
    address?: {
      street?: string;
    };
    geoLocation?: {
      lat?: string | number;
      lng?: string | number;
    };
  };
  items: any[];
}

const CartCard: React.FC<CartCardProps> = ({ id, store, items }) => {
  const { removeCart } = useCartStore();
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const { authToken } = useUserDetails();

  const storeId = store?.id || store?._id || "";

  const storeName = store?.descriptor?.name || "Unknown Store";
  const storeSymbol = store?.descriptor?.symbol;
  const storeAddress = store?.address?.street;
  const storeLocation = store?.geoLocation;

  const distance = useMemo(() => {
    if (
      !storeLocation?.lat ||
      !storeLocation?.lng ||
      !selectedDetails?.lat ||
      !selectedDetails?.lng
    ) {
      return null;
    }
    try {
      return Number(
        (
          getDistance(
            {
              latitude: Number(storeLocation.lat),
              longitude: Number(storeLocation.lng),
            },
            {
              latitude: Number(selectedDetails.lat),
              longitude: Number(selectedDetails.lng),
            }
          ) / 1000
        ).toFixed(1)
      );
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  }, [storeLocation, selectedDetails]);

  const calculateDeliveryTime = (distanceKm: number) => {
    const timeInHours = distanceKm / 35;
    const roundedTime =
      timeInHours.toFixed(0) === "0"
        ? (timeInHours * 60).toFixed(0)
        : timeInHours.toFixed(0);
    const unit = timeInHours.toFixed(0) === "0" ? "min" : "hr";
    return `${roundedTime} ${unit}`;
  };

  const handleCloseButton = () => {
    Alert.alert(
      "Remove Cart",
      "Are you sure you want to remove this cart and all its items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (!authToken) {
                Alert.alert("Login Required", "Please login to remove cart.");
                return;
              }
            if (storeId) { // <-- id is your cartId from props
  const success = await removeCart(storeId, authToken);
  if (!success) {
    Alert.alert("Error", "Failed to remove cart. Please try again.");
  }
}
            } catch (error) {
              console.error("Error deleting the cart", error);
              Alert.alert("Error", "Failed to remove cart. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (!store || !items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.sellerInfoContainer}>
        {storeSymbol ? (
          <Image
            source={{ uri: storeSymbol }}
            style={styles.sellerLogo}
            onError={() => console.warn("Failed to load store symbol")}
          />
        ) : (
          <View style={[styles.sellerLogo, styles.placeholderLogo]} />
        )}

        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName} numberOfLines={2}>
            {storeName}
          </Text>

          {storeAddress && (
            <Text style={styles.sellerLocation} numberOfLines={1}>
              {storeAddress}
            </Text>
          )}

          {distance !== null && (
            <View style={styles.distanceContainer}>
              <View style={styles.time}>
                <Text style={styles.distanceText}>{distance} Km</Text>
                <Text style={styles.separator}> • </Text>
                <Text style={styles.timeText}>
                  {calculateDeliveryTime(distance)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.closeIcon}
          onPress={handleCloseButton}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="trash-o"
            size={20}
            color="red"
            style={styles.trashIconStyle}
          />
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <CartItems cartId={id} storeId={storeId} items={items} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    flex: 1,
    position: "relative",
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  sellerInfoContainer: {
    marginBottom: 10,
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e9ecef",
    paddingBottom: 10,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLogo: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderColor: "#e9ecef",
    borderWidth: 1,
    borderRadius: 10,
  },
  placeholderLogo: {
    backgroundColor: "#e9ecef",
  },
  sellerName: {
    fontSize: 18,
    maxWidth: 200,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sellerLocation: {
    color: "#767582",
    fontSize: 14,
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  separator: {
    color: "#848080",
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    color: "green",
  },
  closeIcon: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  trashIconStyle: {
    padding: 5,
    paddingLeft: 7,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 5,
    alignSelf: "center",
  },
});

export default CartCard;
