import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useCartStore } from "../../state/useCartStore";
import { BillSummary } from "./BillSummary";
import { YourDetails } from "./YourDetails";
import { CancellationPolicy } from "./CancellationPolicy";
import { BackArrow } from "@/constants/icons/commonIcons";
import SlideButton from "rn-slide-button";
import { AntDesign } from "@expo/vector-icons";
import { getDistance } from "geolib";
import useDeliveryStore from "@/state/deliveryAddressStore";
import ImageComp from "../common/ImageComp";
import { useCheckoutFlow } from "@/state/useCheckoutFlow";

// Add a simple Loader component if not imported from elsewhere
const Loader: React.FC = () => (
  <View style={styles.loaderContainer}>
    <Text style={styles.loaderText}>Loading...</Text>
  </View>
);

interface CheckoutProps {
  storeId: string;
  cartItem?: string;
  cartId?: string; // Add cartId as optional prop
}

const Checkout: React.FC<CheckoutProps> = ({ storeId, cartId }) => {
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);
  const { allCarts, loadCartFromStorage } = useCartStore();

  // Load cart from storage on component mount
  React.useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  // Find cart data using either cartId or storeId
  const cartData = React.useMemo(() => {
    console.log("Looking for cart with storeId:", storeId);
    console.log(
      "Available carts:",
      allCarts.map((cart) => ({
        storeId: cart.store._id,
        itemCount: cart.cart_items?.length || 0,
      }))
    );

    if (cartId) {
      // If cartId is provided, try to find by cartId
      const foundCart = allCarts.find(
        (cart, index) =>
          index.toString() === cartId || cart.store._id === cartId
      );
      console.log("Found cart by cartId:", foundCart ? "Yes" : "No");
      return foundCart;
    }

    // Otherwise, find by storeId
    const foundCart = allCarts.find((cart) => cart.store._id === storeId);
    console.log("Found cart by storeId:", foundCart ? "Yes" : "No");
    return foundCart;
  }, [allCarts, cartId, storeId]);

  if (!cartData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Cart not found for store: {storeId}
        </Text>
        <Text style={styles.errorSubtext}>
          Available carts: {allCarts.length}
        </Text>
        {allCarts.length > 0 && (
          <Text style={styles.errorSubtext}>
            Store IDs: {allCarts.map((cart) => cart.store._id).join(", ")}
          </Text>
        )}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadCartFromStorage()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: "#666", marginTop: 10 },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { store, cart_items: items } = cartData;

  // Use checkout flow hook with the correct cartId
  const checkoutCartId = cartId || storeId; // Use cartId if provided, otherwise use storeId
  const {
    isLoading,
    isConfirming,
    onSelectData,
    itemsTotal,
    grandTotal,
    breakup,
    updatedItems,
    savings,
    enablePayment,
    handleInit,
  } = useCheckoutFlow(checkoutCartId, items);

  // Calculate distance and delivery time
  const distance = selectedDetails
    ? Number(
        (
          getDistance(
            {
              // Since store only has _id, you'll need to get coordinates from elsewhere
              latitude: 0, // You'll need to fetch store coordinates
              longitude: 0, // You'll need to fetch store coordinates
            },
            {
              latitude: selectedDetails.lat || 0,
              longitude: selectedDetails.lng || 0,
            }
          ) / 1000
        ).toFixed(1)
      )
    : 0;

  // Check if all items are cancellable - based on the CartItem interface from BillSummary
  // Since there's no cancellable property in the CartItem interface, we'll assume all items are cancellable by default
  // You can adjust this logic based on your actual business requirements
  const cancellable = true; // or items.every((item) => item.available !== false);

  // Render icon for slide button
  const renderIcon = useCallback(() => {
    return <AntDesign name="right" size={25} color={"#14a16d"} />;
  }, []);

  // Loading state
  if (isLoading || isConfirming) {
    return (
      <View style={styles.container}>
        <View style={styles.sellerInfoContainer}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <BackArrow />
          </TouchableOpacity>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>Processing...</Text>
          </View>
        </View>
        <Loader />
      </View>
    );
  }

  // No data state
  if (!onSelectData) {
    return (
      <View style={styles.container}>
        <View style={styles.sellerInfoContainer}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <BackArrow />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Cant reach the seller right now :(
          </Text>
          <Text style={styles.errorSubtitle}>Try again later . .</Text>
        </View>
      </View>
    );
  }

  // Since store is just { _id: string } based on the cart structure,
  // we need to handle the store info differently
  // You'll need to fetch store details separately or modify your cart structure
  const storeInfo = {
    _id: store._id,
    name: "Store", // You'll need to fetch this from elsewhere
    symbol: "", // You'll need to fetch this from elsewhere
    address: "Address not available", // You'll need to fetch this from elsewhere
  };

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.sellerInfoContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <BackArrow />
        </TouchableOpacity>

        <View style={styles.imgContainer}>
          <ImageComp
            source={{ uri: storeInfo.symbol || "" }}
            imageStyle={styles.sellerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{storeInfo.name}</Text>
          <Text style={styles.sellerAddress}>{storeInfo.address}</Text>

          <View style={styles.line}>
            <Text style={styles.distanceText}>{distance} Km</Text>
            <View style={styles.dot} />
            <Text style={styles.timeText}>
              {((distance / 35).toFixed(0) === "0"
                ? (distance / 35) * 60
                : distance / 35
              ).toFixed(0)}{" "}
              {(distance / 35).toFixed(0) === "0" ? "min" : "hr"}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer}>
        <BillSummary
          authToken=""
          storeId={storeInfo._id}
          updatedItems={updatedItems}
          itemsTotal={itemsTotal}
          breakup={breakup || undefined}
          grandTotal={grandTotal}
          savings={savings}
        />
        <YourDetails />
        <CancellationPolicy isCancellable={cancellable} />
      </ScrollView>

      {/* Payment Button */}
      {enablePayment ? (
        <View style={styles.buttons}>
          <SlideButton
            title={`Slide  to  Pay  |  ₹${grandTotal}`}
            titleStyle={styles.paymentButtonText}
            icon={renderIcon()}
            containerStyle={styles.payButton}
            underlayStyle={styles.payButtonUnderlay}
            thumbStyle={styles.payThumb}
            height={52}
            borderRadius={50}
            padding={0}
            onReachedToEnd={handleInit}
            autoReset={true}
            animation={true}
            animationDuration={300}
          />
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomContainerText}>
            Remove all unavailable items from the cart to proceed!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  sellerInfoContainer: {
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.2,
    borderBottomColor: "#e9ecef",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  backIcon: {
    paddingHorizontal: 15,
  },

  imgContainer: {
    backgroundColor: "white",
    borderRadius: 10,
  },

  sellerLogo: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderColor: "#e9ecef",
    borderWidth: 1,
    borderRadius: 10,
  },

  sellerInfo: {
    flex: 1,
  },

  sellerName: {
    fontSize: 16,
    marginBottom: 1,
    fontWeight: "bold",
  },

  sellerAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },

  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  distanceText: {
    fontSize: 12,
    color: "#666",
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
  },

  timeText: {
    fontSize: 12,
    color: "green",
    fontWeight: "500",
  },

  scrollContainer: {
    backgroundColor: "#e9ecef",
  },

  buttons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },

  paymentButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  payButton: {
    backgroundColor: "#14a16d",
  },

  payButtonUnderlay: {
    backgroundColor: "transparent",
  },

  payThumb: {
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 50,
  },

  bottomContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 0.2,
    borderTopColor: "#e9ecef",
  },

  bottomContainerText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#666",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },

  errorTitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },

  errorSubtitle: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#666",
  },

  // Added loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loaderText: {
    fontSize: 16,
    color: "#666",
  },

  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: "#14a16d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },

  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Checkout;
