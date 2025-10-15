// StoreTimings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";

interface StoreTimingsProps {
  store: FetchStoreDetailsResponseType;
}

export const StoreTimings: React.FC<StoreTimingsProps> = ({ store }) => {
  const cd = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate if store is open
  const isStoreOpen =
    store.status === "enable"
      ? store.orderDays?.includes(cd)
        ? store.orderTimings
          ? !!store.orderTimings
              ?.filter((ot) => ot.day === cd)
              .find((ot) => {
                const parseTime = (timeStr: string) => {
                  const time = timeStr.replace("+0530", "");
                  const hours = parseInt(time.substring(0, 2));
                  const minutes = parseInt(time.substring(2, 4));
                  const seconds = parseInt(time.substring(4, 6));
                  const date = new Date();
                  date.setHours(hours, minutes, seconds, 0);
                  return date;
                };

                const parseStartTime = parseTime(ot.time_range.gte);
                const parseEndTime = parseTime(ot.time_range.lte);
                const now = new Date();

                return (
                  ot.day === cd &&
                  parseStartTime < now &&
                  now < parseEndTime
                );
              })
          : true
        : false
      : store.status === "open";

  const days = [
    "",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Format time from "HHmmss" to "hh:mm A"
  const formatTime = (timeStr: string) => {
    const time = timeStr.replace("+0530", "");
    const hours = parseInt(time.substring(0, 2));
    const minutes = parseInt(time.substring(2, 4));
    
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerButton,
          isStoreOpen ? styles.openButton : styles.closedButton,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.triggerText,
          isStoreOpen ? styles.openText : styles.closedText,
        ]}>
          {isStoreOpen ? "Open now" : "Closed"}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={18}
          color={isStoreOpen ? "#16a34a" : "#000"}
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Store Timings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Timings List */}
            <ScrollView style={styles.timingsList}>
              {store.orderTimings
                ?.sort((a, b) => a.day - b.day)
                .map((timing, index) => (
                  <View key={index} style={styles.timingItem}>
                    <Text style={styles.dayText}>{days[timing.day]}</Text>
                    <Text style={styles.timeText}>
                      {formatTime(timing.time_range.gte)} - {formatTime(timing.time_range.lte)}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginRight: 10,
  },
  openButton: {
    backgroundColor: "#f0fdf4",
  },
  closedButton: {
    backgroundColor: "#fafafa",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  openText: {
    color: "#16a34a",
  },
  closedText: {
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "80%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  timingsList: {
    maxHeight: 300,
  },
  timingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
});

export default StoreTimings;