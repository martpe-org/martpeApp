import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { FetchTicketDetailType } from "./api/fetch-ticket-detail-type";
import { ActionCard } from "./ActionCard";
import { useRouter } from "expo-router";
import { styles } from "./TicketDetailStyles";
import ImageComp from "../common/ImageComp";
interface TicketDetailProps {
  data: FetchTicketDetailType;
  onBack?: () => void;
}
export const TicketDetail: React.FC<TicketDetailProps> = ({ data, onBack }) => {
  const router = useRouter();

  // Parse ISO8601 durations like PT2H15M30S → seconds
  const parseDuration = (duration?: string): number => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const [, hours, minutes, seconds] = match.map((v) => parseInt(v || "0"));
    return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
  };

  const getExpectedTime = (duration?: string) => {
    if (!duration) return "Not available";
    const seconds = parseDuration(duration);
    const expectedDate = new Date(Date.now() + seconds * 1000);
    return expectedDate.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewOrder = () => {
    if (data.order_id) {
      router.push(`/orders/${data.order_id}`);
    }
  };

  // Get the first order item name if available
  const getItemName = () => {
    // Try to get from order_items first
    if (data.order_items && data.order_items.length > 0) {
      const firstItem = data.order_items[0];
      if (firstItem?.descriptor?.name) {
        return firstItem.descriptor.name;
      }
      if (firstItem?.name) {
        return firstItem.name;
      }
    }

    // Try to get from order breakup
    if (data.order?.breakup && data.order.breakup.length > 0) {
      const firstBreakupItem = data.order.breakup.find(item => item.title || item.custom_title);
      if (firstBreakupItem?.title) {
        return firstBreakupItem.title;
      }
      if (firstBreakupItem?.custom_title) {
        return firstBreakupItem.custom_title;
      }
    }

    // Fallback to generic name
    return "Item";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Title: {data.descriptor?.short_desc || "Issue"}</Text>
            <Text style={styles.description}>
              Description: {data.descriptor?.long_desc || "No description available"}
            </Text>
            <View style={styles.issueIdRow}>
              <Text style={styles.issueIdLabel}>Issue Id: </Text>
              <Text style={styles.issueIdValue} numberOfLines={1} ellipsizeMode="tail">
                {data.issue_id || "N/A"}
              </Text>
            </View>
          </View>

          {/* Order Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>

            <View style={styles.storeInfo}>
              {data.store?.symbol && (
                <ImageComp
                  source={{ uri: data.store.symbol }}
                  imageStyle={styles.storeIcon}
                  resizeMode="contain"
                />
              )}
              <View style={styles.storeTextContainer}>
                <Text style={styles.storeName}>{data.store?.name || "Unknown Store"}</Text>
                <Text style={styles.storeAddress}>
                  {data.store?.address?.street || "No address available"}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[styles.statusBadge, ]}>
                <Text style={styles.statusText}>{data.status}</Text>
              </View>
            </View>
            <View style={styles.issueIdRow}>
              <Text style={styles.itemsLabel}>Items: </Text>
              <Text style={styles.itemText}>
                {getItemName()} x 1
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewOrderButton}
              onPress={handleViewOrder}
            >
              <Text style={styles.viewOrderButtonText}>View order</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline Section */}
          <View style={styles.section}>
            <Text style={styles.timeLabel}>Expected response time:</Text>
            <Text style={styles.timeValue}>
              {getExpectedTime(data.expected_response_time?.duration)}
            </Text>

            <Text style={[styles.timeLabel, { marginTop: 12 }]}>Expected resolution time:</Text>
            <Text style={styles.timeValue}>
              {getExpectedTime(data.expected_resolution_time?.duration)}
            </Text>
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            {Array.isArray(data.actions) && data.actions.length > 0 ? (
              data.actions.map((action, index) => (
                <ActionCard key={action.id || index} action={action} data={data} index={index} />
              ))
            ) : (
              <Text style={styles.noDataText}>No actions available</Text>
            )}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

