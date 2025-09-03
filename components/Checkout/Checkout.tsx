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
import { SafeAreaView } from "react-native-safe-area-context";
import useUserDetails from "@/hook/useUserDetails";

const Loader: React.FC = () => (
  <View style={styles.loaderContainer}>
    <Text style={styles.loaderText}>Loading...</Text>
  </View>
);

interface CheckoutProps {
  storeId: string;
  cartId?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ storeId, cartId }) => {
  const selectedDetails = useDeliveryStore((s) => s.selectedDetails);
  const { allCarts, loadCartFromStorage } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken || "";

  React.useEffect(() => {
    loadCartFromStorage();
  }, [loadCartFromStorage]);

  // find cart data
  const cartData = React.useMemo(() => {
    if (cartId) {
      return allCarts.find((cart) => cart._id === cartId || cart.store._id === cartId);
    }
    return allCarts.find((cart) => cart.store._id === storeId);
  }, [allCarts, cartId, storeId]);

  if (!cartData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cart not found for store: {storeId}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCartFromStorage}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: "#666", marginTop: 10 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { store, cart_items: items } = cartData;

  // ✅ hook usage with correct args
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
  } = useCheckoutFlow(cartData._id, items, authToken);

  const distance = selectedDetails
    ? Number(
        (
          getDistance(
            { latitude: 0, longitude: 0 }, // TODO: real store coords
            { latitude: selectedDetails.lat || 0, longitude: selectedDetails.lng || 0 }
          ) / 1000
        ).toFixed(1)
      )
    : 0;

  const renderIcon = useCallback(
    () => <AntDesign name="right" size={25} color={"#14a16d"} />,
    []
  );

  if (isLoading || isConfirming) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.sellerInfoContainer}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <BackArrow />
          </TouchableOpacity>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>Processing...</Text>
          </View>
        </View>
        <Loader />
      </SafeAreaView>
    );
  }

  if (!onSelectData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.sellerInfoContainer}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <BackArrow />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Cant reach the seller right now :(</Text>
          <Text style={styles.errorSubtitle}>Try again later . .</Text>
        </View>
      </SafeAreaView>
    );
  }

  const storeInfo = {
    _id: store._id,
    name: "Store",
    symbol: "",
    address: "Address not available",
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          authToken={authToken}
          storeId={storeInfo._id}
          updatedItems={updatedItems}
          itemsTotal={itemsTotal}
          breakup={breakup || undefined}
          grandTotal={grandTotal}
          savings={savings}
        />
        <YourDetails />
        <CancellationPolicy isCancellable />
      </ScrollView>

      {/* Pay Button */}
      {enablePayment ? (
        <View style={styles.buttons}>
          <SlideButton
            title={`Slide to Pay | ₹${grandTotal}`}
            titleStyle={styles.paymentButtonText}
            icon={renderIcon()}
            containerStyle={styles.payButton}
            underlayStyle={styles.payButtonUnderlay}
            thumbStyle={styles.payThumb}
            height={52}
            borderRadius={50}
            padding={0}
            onReachedToEnd={handleInit}
            autoReset
            animation
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
    </SafeAreaView>
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
