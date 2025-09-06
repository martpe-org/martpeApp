import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";

export type CartOffersSheetProps = {
  setOpen: (open: boolean) => void;
  cart: FetchCartType;
  applyOffer: (offer_id: string) => void;
  isApplied: boolean;
};

const CartOfferSheet: FC<CartOffersSheetProps> = ({
  cart,
  setOpen,
  applyOffer,
  isApplied,
}) => {
  return (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Store Offers</Text>
        <TouchableOpacity onPress={() => setOpen(false)}>
          <Text style={styles.closeBtn}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {cart?.store?.offers?.map((offerItem) => (
          <View style={styles.offerCard} key={offerItem._id}>
            <View style={styles.offerHeader}>
              <View style={styles.offerCode}>
                <MaterialCommunityIcons
                  name="ticket-percent"
                  size={18}
                  color="tomato"
                />
                <Text>{offerItem.offer_id}</Text>
              </View>
              {isApplied && (
                <View style={styles.appliedTag}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color="green"
                  />
                  <Text style={styles.appliedText}>Applied</Text>
                </View>
              )}
            </View>

            <Text style={styles.offerDesc}>
              {offerItem.benefit?.value_type !== "percentage"
                ? offerItem.benefit?.value_cap
                  ? `${offerItem.short_desc} upto ₹${Math.abs(
                      Number(offerItem.benefit.value_cap)
                    )}`
                  : offerItem.qualifier?.min_value
                  ? `Get ${offerItem.short_desc} on orders above ₹${offerItem.qualifier.min_value}`
                  : ""
                : `Flat ${offerItem.short_desc}`}
            </Text>

            {!isApplied && (
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  applyOffer(offerItem.offer_id);
                  setOpen(false);
                }}
              >
                <Text style={styles.applyBtnText}>Apply Coupon</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CartOfferSheet;

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    marginTop: height * 0.25, // bottom sheet style
    flex: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    fontSize: 14,
    color: "tomato",
  },
  offerCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  offerCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  appliedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appliedText: {
    fontSize: 12,
    color: "green",
  },
  offerDesc: {
    fontSize: 13,
    marginBottom: 8,
    color: "#444",
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: "tomato",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  applyBtnText: {
    color: "tomato",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 12,
  },
});
