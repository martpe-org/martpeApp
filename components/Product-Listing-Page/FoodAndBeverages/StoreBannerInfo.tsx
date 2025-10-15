import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";

interface StoreBannerInfoProps {
  store?: FetchStoreDetailsResponseType | null;
}

export const StoreBannerInfo: React.FC<StoreBannerInfoProps> = ({ store }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePhonePress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  // Don't render anything if store is null/undefined
  if (!store) {
    return null;
  }

  return (
    <>
      {/* Info Icon Trigger */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.infoButton}
      >
        <MaterialIcons name="info-outline" size={20} color="#666" />
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
              <Text style={styles.modalTitle}>Store Info</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody}>
              <Text style={styles.storeName}>{store.name}</Text>
              
              {/* Store Description */}
              {(store.long_desc || store.short_desc) && (
                <Text style={styles.description}>
                  {store.long_desc ?? store.short_desc}
                </Text>
              )}

              {/* FSSAI License */}
              {store.fssai_license_no && (
                <View style={styles.infoSection}>
                  <Text style={styles.label}>FSSAI License No:</Text>
                  <Text style={styles.value}>{store.fssai_license_no}</Text>
                </View>
              )}

              {/* Fulfillments Contact */}
              {store.fulfillments?.[0]?.contact && (
                <View style={styles.infoSection}>
                  <Text style={styles.label}>Delivery Contact:</Text>
                  <TouchableOpacity
                    onPress={() => 
                      store.fulfillments?.[0]?.contact?.phone && 
                      handlePhonePress(store.fulfillments[0].contact.phone)
                    }
                  >
                    <Text style={styles.link}>
                      {store.fulfillments[0].contact.phone}
                    </Text>
                  </TouchableOpacity>
                  
                  {store.fulfillments[0].contact.email && (
                    <>
                      <Text style={styles.label}>Delivery Email:</Text>
                      <TouchableOpacity
                        onPress={() => 
                          handleEmailPress(store.fulfillments[0].contact!.email!)
                        }
                      >
                        <Text style={styles.link}>
                          {store.fulfillments[0].contact.email}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* Consumer Care */}
              {store.consumer_care && (
                <View style={styles.infoSection}>
                  <Text style={styles.label}>Consumer Care Name:</Text>
                  <Text style={styles.value}>
                    {store.consumer_care.contact_name}
                  </Text>
                  
                  <Text style={styles.label}>Consumer Care Contact:</Text>
                  <TouchableOpacity
                    onPress={() => 
                      store.consumer_care?.contact_number && 
                      handlePhonePress(store.consumer_care.contact_number)
                    }
                  >
                    <Text style={styles.link}>
                      {store.consumer_care.contact_number}
                    </Text>
                  </TouchableOpacity>
                  
                  {store.consumer_care.contact_email && (
                    <>
                      <Text style={styles.label}>Consumer Care Email:</Text>
                      <TouchableOpacity
                        onPress={() => 
                          handleEmailPress(store.consumer_care!.contact_email!)
                        }
                      >
                        <Text style={styles.link}>
                          {store.consumer_care.contact_email}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  infoButton: {
    padding: 4,
    marginLeft: 6,
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
    width: "85%",
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
  modalBody: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
});

export default StoreBannerInfo;