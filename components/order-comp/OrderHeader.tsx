import ImageComp from "@/components/common/ImageComp";
import { FetchOrderDetailType } from "@/components/order/fetch-order-detail-type";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import CancelButton from "../order/Cancel/CancelButton";
import CreateIssueForm from "../issue/CreateIssueForm";
import { ScrollView } from "react-native-gesture-handler";
import { styles } from './OrderHeaderStyles'
import { SafeAreaView } from "react-native-safe-area-context";

interface OrderHeaderProps {
  orderDetail: FetchOrderDetailType;
  onRefresh: () => void;
  onCancel: () => void;
  refreshing: boolean;
  formattedOrderDate: string;
  formattedDeliveryDate: string;
}

export default function OrderHeader({
  orderDetail,
  onRefresh,
  refreshing,
  formattedOrderDate,
  formattedDeliveryDate,
}: OrderHeaderProps) {
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
      case "initiated":
      case "confirmed":
        return {
          label: "Confirmed",
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
        };
      case "accepted":
        return {
          label: "Confirmed",
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "in-progress":
        return {
          label: "In Progress",
          backgroundColor: "#fed7aa",
          color: "#ea580c",
        };
      case "completed":
        return {
          label: "Completed",
          backgroundColor: "#d1fae5",
          color: "#059669",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          backgroundColor: "#fee2e2",
          color: "#dc2626",
        };
      default:
        return {
          label: "Pending",
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
    }
  };

  const getDeliveryStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          label: "Pending",
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          backgroundColor: "#dcfce7",
          color: "#16a34a",
        };
      case "in-progress":
        return {
          label: "In Progress",
          backgroundColor: "#fed7aa",
          color: "#ea580c",
        };
      case "delivered":
        return {
          label: "Delivered",
          backgroundColor: "#d1fae5",
          color: "#059669",
        };
      default:
        return {
          label: "Pending",
          backgroundColor: "#fef3c7",
          color: "#d97706",
        };
    }
  };

  const handleStorePress = () => {
    // Navigate to store PLP screen using store slug
    router.push({
      pathname: "/(tabs)/home/result/productListing/[id]",
      params: { id: orderDetail.store.slug },
    });
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
  };

  const orderStatusConfig = getStatusConfig(orderDetail.status);
  const deliveryStatusConfig = getDeliveryStatusConfig(
    orderDetail.fulfillment.status
  );

  return (
    <>
      {/* Store Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={handleStorePress}
          activeOpacity={0.7}
        >
          <ImageComp
            source={{ uri: orderDetail.store.symbol }}
            // style={styles.storeLogo}
            resizeMode="cover"
          />
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{orderDetail.store.name}</Text>
            <Text style={styles.storeAddress}>
              {orderDetail.store.address.street &&
                `${orderDetail.store.address.street}, `}
              {orderDetail.store.address.locality &&
                `${orderDetail.store.address.locality}, `}
              {orderDetail.store.address.city}
            </Text>
            <Text style={styles.viewStoreText}>Tap to view store</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
          <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Order Info */}
      <View style={styles.orderInfoSection}>
        <Text style={styles.orderNumber}>Order #: {orderDetail.orderno}</Text>
        <Text style={styles.orderDate}>
          Order Placed On: {formattedOrderDate}
        </Text>
        <Text style={styles.deliveryDate}>
          Expected delivery at: {formattedDeliveryDate}
        </Text>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Order Status:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: orderStatusConfig.backgroundColor },
              ]}
            >
              <Text
                style={[styles.statusText, { color: orderStatusConfig.color }]}
              >
                {orderStatusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Delivery Status:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: deliveryStatusConfig.backgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: deliveryStatusConfig.color },
                ]}
              >
                {deliveryStatusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.refreshButton]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>

          {orderDetail.cancellable ? (
            <CancelButton
              orderId={orderDetail._id}
              onCancelled={onRefresh}
              isCancelled={orderDetail.status.toLowerCase() === "cancelled"}
              cancellable={orderDetail.cancellable}
            />) : (
            <View style={{ flex: 1, alignItems: "center", marginTop: 8 }}>
              <Text
                style={{ color: "#050404", fontSize: 13, textAlign: "center" }}
              >
                This item is not cancellable. Check{" "}
                <Text
                  style={{ color: "red", fontWeight: "600" }}
                  onPress={() =>
                    router.push("/(tabs)/orders/CancellationPolicy")
                  }
                >
                  Cancellation Policy
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Help Modal */}
<Modal
  visible={showHelpModal}
  animationType="fade"
  transparent
  onRequestClose={closeHelpModal}
>
  <View style={styles.modalOverlay}>
    <TouchableOpacity
      style={styles.modalBackdrop}
      activeOpacity={1}
      onPress={closeHelpModal}
    />

    <View style={styles.modernModalContainer}>
      {/* Header */}
      <View style={styles.modernModalHeader}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#070708" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.modernModalTitle}>Report an Issue</Text>
          <Text style={styles.modernModalSubtitle}>
            We are here to help resolve any problems
          </Text>
        </View>
        <TouchableOpacity
          onPress={closeHelpModal}
          style={styles.modernCloseButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.modalDivider} />

      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.modernModalContent}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CreateIssueForm data={orderDetail} onClose={closeHelpModal} />
      </ScrollView>
    </View>
  </View>
</Modal>

    </>
  );
}


