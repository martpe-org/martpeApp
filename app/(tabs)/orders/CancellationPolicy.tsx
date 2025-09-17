import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar } from "react-native";

export default function CancellationPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancellation policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            MartPe will endeavor to assist Buyers who have bonafide disputes on the
            Products provided to them by the Sellers. The return policy and return
            policy period depends on the product category, the Seller's refund
            policy and the Seller.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Replacement:</Text>
          <Text style={styles.paragraph}>
            If at the time of delivery and/or within the applicable return policy
            period, if any defect is found, then the buyer of the product/s or
            service/s can ask for replacement of the product/s or service/s from
            the Seller subject to the following terms and conditions;
          </Text>
          <Text style={styles.paragraph}>
            Notify Seller of any defects in the product/s or service/s at the time
            of delivery of the product/s and/or within the applicable return
            policy period and the same product/s will be replaced in return of the
            defective product/s.
          </Text>
          <Text style={styles.paragraph}>
            Replacement can be for the entire product/s or part/s of the product
            subject to availability of the same with the Seller.
          </Text>
          <Text style={styles.paragraph}>You may also return the Product in an order if:</Text>
          <Text style={styles.listItem}>1. Wrong item being delivered other than what You had ordered in an order.</Text>
          <Text style={styles.listItem}>2. Items substantially damaged or deteriorated in quality at the time of delivery. You agree that You shall give Us all the requisite proofs including but not limited to images of Products having issues.</Text>

          <Text style={styles.paragraph}>Following products shall not be eligible for return or replacement:</Text>
          <Text style={styles.listItem}>a. Damages due to misuse of product;</Text>
          <Text style={styles.listItem}>b. Any consumable item which has been used/installed;</Text>
          <Text style={styles.listItem}>c. Products with tampered or missing serial/UPC numbers;</Text>
          <Text style={styles.listItem}>d. Any damage/defect which are not covered under the manufacturer's warranty.</Text>
          <Text style={styles.listItem}>e. Any product that is returned without all original packaging and accessories, including the box, manufacturer's packaging if any, and all other items originally included with the product/s delivered;</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Cancellations:</Text>
          <Text style={styles.paragraph}>
            With regard to food and perishable items, You may cancel an order
            without charge at any time before the Seller accepts the order. You
            cannot cancel the order post acceptance of order by the Seller except
            if:
          </Text>
          <Text style={styles.listItem}>a. The Order could not be delivered within the estimated time while placing the order; or</Text>
          <Text style={styles.listItem}>b. If the Seller doesn't accept or cancels the Order due to reasons not attributable to Buyer, including but not limited to the store being closed, non-availability of items, store/restaurant being unable to service online Orders at that moment etc.</Text>

          <Text style={styles.paragraph}>
            In all other cases, You may cancel an order without charge at any time
            before the status of the order changes to "In-Progress" on MartPe.
            MartPe reserves the right to look into the cancellation request of the
            Buyer and determine if such cancellation request falls under the
            conditions mentioned above...
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Refunds:</Text>
          <Text style={styles.paragraph}>
            You may at MartPe sole discretion be entitled to a refund up to 100%
            of the Order value if the Order is not delivered due to a cause
            attributable to either the Seller App, MartPe or the Logistic Partner...
          </Text>
          <Text style={styles.listItem}>• Wrong address provided by You;</Text>
          <Text style={styles.listItem}>• Unavailability of the Buyer at the time of Order delivery;</Text>
          <Text style={styles.listItem}>• Any other failure to deliver Order due to lack of information, direction or authorization from Buyer at the time of delivery.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  paragraph: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
    color: "#374151",
  },
  listItem: {
    fontSize: 15,
    marginBottom: 8,
    paddingLeft: 16,
    lineHeight: 22,
    color: "#4b5563",
  },
});