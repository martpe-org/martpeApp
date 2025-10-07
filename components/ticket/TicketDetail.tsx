import React from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { FetchTicketDetailType } from "./api/fetch-ticket-detail-type";
import { ActionCard } from "./ActionCard";
import { ResolutionCard } from "./ResolutionCard";
import { SendMoreInfoButton } from "./SendMoreInfoButton";
import { CloseBtn } from "./CloseBtn";

interface TicketDetailProps {
  data: FetchTicketDetailType;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ data }) => {
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

  const lastInfoRequest = data.actions
    ?.slice()
    ?.reverse()
    ?.find((action) => action.descriptor?.code === "INFO_REQUESTED");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ticket Details</Text>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {data.descriptor?.long_desc || "No description available"}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Issue Id:</Text>
          <Text style={styles.infoValue}>{data.issue_id || "N/A"}</Text>
        </View>

        {/* Images */}
        {Array.isArray(data.descriptor?.images) && data.descriptor.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {data.descriptor.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.url }}
                style={styles.descriptionImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>

      {/* Store Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Information</Text>
        <Text style={styles.storeName}>{data.store?.name || "Unknown"}</Text>
        <Text style={styles.storeAddress}>
          {data.store?.address?.street || "No address available"}
        </Text>

        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Expected response time:</Text>
          <Text style={styles.timeValue}>
            {getExpectedTime(data.expected_response_time?.duration)}
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Expected resolution time:</Text>
          <Text style={styles.timeValue}>
            {getExpectedTime(data.expected_resolution_time?.duration)}
          </Text>
        </View>
      </View>

      {/* Actions Section */}
      {Array.isArray(data.actions) && data.actions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {data.actions.map((action, index) => (
            <ActionCard key={action.id || index} action={action} data={data} index={index} />
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Text style={styles.noDataText}>No actions available</Text>
        </View>
      )}

      {/* Resolutions Section */}
      {Array.isArray(data.parsed_resolutions) && data.parsed_resolutions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed Resolutions</Text>
          {data.parsed_resolutions.map((resolution, index) => (
            <ResolutionCard
              key={resolution.id || index}
              resolution={resolution}
              data={data}
              index={index}
            />
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed Resolutions</Text>
          <Text style={styles.noDataText}>No resolutions available</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {lastInfoRequest && (
          <SendMoreInfoButton data={data} info_type="INFO001" ref_id={lastInfoRequest.id} />
        )}
        {data.status !== "CLOSED" && <CloseBtn data={data} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  descriptionImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  timeInfo: {
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  actionButtons: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});
