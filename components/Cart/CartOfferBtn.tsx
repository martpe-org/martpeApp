import React, { FC } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import CartOfferSheet from "./CartOfferSheet";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FetchCartType } from "@/app/(tabs)/cart/fetch-carts-type";

interface ApplyCartOffersBtnProps {
  appliedOfferId: string;
  applyOffer: React.Dispatch<React.SetStateAction<string>>;
  cart: FetchCartType;
  offersOpen: boolean;
  setOffersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartOfferBtn: FC<ApplyCartOffersBtnProps> = ({
  appliedOfferId,
  applyOffer,
  cart,
  offersOpen,
  setOffersOpen,
}) => {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.offerBtn,
          appliedOfferId ? styles.offerBtnApplied : styles.offerBtnDefault,
        ]}
        onPress={() => setOffersOpen(true)}
      >
        {appliedOfferId ? (
          <View style={styles.offerAppliedContainer}>
            <View>
              <View style={styles.offerAppliedRow}>
                <MaterialCommunityIcons
                  name="ticket-percent"
                  size={22}
                  color="tomato"
                />
                <Text style={styles.appliedCode}>{appliedOfferId}</Text>
              </View>
              <Text style={styles.appliedText}>
                Offer applied on the bill
              </Text>
            </View>
            <View style={styles.editBtn}>
              <MaterialIcons name="edit" size={18} color="black" />
              <Text style={styles.editText}>Edit</Text>
            </View>
          </View>
        ) : (
          <View style={styles.offerDefaultContainer}>
            <MaterialIcons
              name="percent"
              size={22}
              color="#666"
            />
            <Text style={styles.defaultText}>Apply Coupon</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </View>
        )}
      </TouchableOpacity>

      {/* Sheet / BottomSheet replacement */}
      <Modal
        visible={offersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setOffersOpen(false)}
      >
        <CartOfferSheet
          cart={cart}
          setOpen={setOffersOpen}
          applyOffer={applyOffer}
          isApplied={!!appliedOfferId}
        />
      </Modal>
    </>
  );
};

export default CartOfferBtn;

const styles = StyleSheet.create({
  offerBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  offerBtnDefault: {
    borderColor: "#ccc",
  },
  offerBtnApplied: {
    borderColor: "#ccc",
  },
  offerAppliedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offerAppliedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  appliedCode: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
  appliedText: {
    color: "#666",
    fontSize: 12,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 6,
  },
  editText: {
    fontSize: 12,
  },
  offerDefaultContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  defaultText: {
    color: "#666",
    fontSize: 14,
  },
});
