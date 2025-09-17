import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FetchOrderDetailType } from "@/components/order/fetch-order-detail-type";
import ImageComp from "@/components/common/ImageComp";
import { CreateIssueForm } from "./CreateIssueForm";
import CancelButton from "../order/Cancel/CancelButton";

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
  onCancel,
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
      <View style={styles.header}>
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
      </View>

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
/>          ) : (
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
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeHelpModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report an Issue</Text>
            <TouchableOpacity
              onPress={closeHelpModal}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {/* <CreateIssueForm
            data={orderDetail} 
            onClose={closeHelpModal} 
          /> */}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  viewStoreText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  helpButton: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  orderInfoSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  refreshButton: {
    backgroundColor: "#ef4444",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
});
