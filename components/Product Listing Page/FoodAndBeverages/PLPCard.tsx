import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useCartStore } from "../../../state/useCartStore";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import useUserDetails from "../../../hook/useUserDetails";
interface PLPCardProps {
  veg: boolean;
  itemName: string;
  offerPrice: number;
  originalPrice: number;
  rating: number;
  itemImg: string;
  id: string; // catalog_id
  providerId: string; // store_id
  maxLimit: number;
  slug: string;
  customizable: boolean;
  handleOpenPress: () => void;
  foodDetails: (data: any) => void;
  shortDesc: string;
  longDesc: string;
}

const PLPCard: React.FC<PLPCardProps> = ({
  veg,
  itemName,
  offerPrice,
  shortDesc,
  longDesc,
  originalPrice,
  rating,
  itemImg,
  id,
  providerId,
  maxLimit,
  slug,
  customizable,
  handleOpenPress,
  foodDetails,
}) => {
  const { allCarts, addItem, updateQty } = useCartStore();
 const cart = allCarts.find((c) => c.store._id === providerId);
const item = cart?.cart_items.find((i) => i._id === id); // ✅ corrected
const itemCount = item?.qty ?? 0;
const { authToken } = useUserDetails();


  const discountPercentage = Math.floor(
    ((originalPrice - offerPrice) / originalPrice) * 100
  );

const handleAdd = () => {
  if (!authToken) return; // prevent calling with null
  addItem(providerId, slug, id, 1, customizable, [], authToken);
};

const handleIncrease = () => {
  if (!authToken || !item) return;
  updateQty(item._id, item.qty + 1, authToken);
};

const handleDecrease = () => {
  if (!authToken || !item) return;
  updateQty(item._id, item.qty - 1, authToken);
};


  return (
    <View style={styles.plpCard_container}>
      <View style={styles.plpCard_content}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="circle-box-outline"
            size={20}
            color={veg ? "green" : "red"}
          />
          <Text style={styles.itemName}>
            {itemName.length > 20 ? itemName.slice(0, 20) + "..." : itemName}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", width: 120 }}>
          <FontAwesome
            name="star"
            size={14}
            color="#fbbf24"
            style={{ marginRight: 3 }}
          />
          <Text style={{ fontSize: 12, fontWeight: "500" }}>{rating}</Text>
          <Text style={{ color: "#848080", fontSize: 8, marginHorizontal: 2 }}>
            {" \u25CF"}
          </Text>
          <Text style={styles.price}>
            <FontAwesome name="rupee" size={10} color="#030303" /> {offerPrice}
            {discountPercentage >= 1 && (
              <>
                <Text style={styles.strikedOffText}>₹ {originalPrice}</Text>
                <Text style={{ color: "#1DA578" }}>
                  {discountPercentage}% off
                </Text>
              </>
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            handleOpenPress();
            foodDetails({
              images: itemImg,
              name: itemName,
              discount: discountPercentage,
              price: offerPrice,
              short_desc: shortDesc,
              storeId: providerId,
              itemId: id,
              maxQuantity: maxLimit,
              maxPrice: originalPrice,
              visible: true,
              long_desc: longDesc,
            });
          }}
          style={styles.moreDetailsButton}
        >
          <Text style={{ color: "#030303", fontSize: 10 }}>More details</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={14}
            color="#030303"
          />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", width: "35%" }}>
        <Image source={{ uri: itemImg }} style={styles.cardImg} />
        {itemCount === 0 ? (
          <TouchableOpacity style={styles.buttonGroup} onPress={handleAdd}>
            <Text style={{ color: "#0e8910", fontWeight: "bold" }}>Add</Text>
            <MaterialCommunityIcons name="plus" size={20} color="#0e8910" />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity onPress={handleDecrease}>
              <MaterialCommunityIcons name="minus" size={20} color="red" />
            </TouchableOpacity>
            <Text>{itemCount}</Text>
            <TouchableOpacity
              onPress={handleIncrease}
              disabled={itemCount >= maxLimit}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={itemCount >= maxLimit ? "#ccc" : "green"}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default PLPCard;

const styles = StyleSheet.create({
  plpCard_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: "#9B9B9B",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  plpCard_content: {
    flex: 1,
  },
  itemName: {
    marginLeft: 5,
    fontWeight: "900",
    fontSize: 14,
  },
  price: {
    fontWeight: "900",
    marginLeft: 5,
    color: "#030303",
    fontSize: 14,
  },
  strikedOffText: {
    textDecorationLine: "line-through",
    marginLeft: 20,
    color: "#808080",
    fontWeight: "normal",
  },
  moreDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ABA9A9",
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 10,
    width: 90,
    marginTop: 30,
  },
  cardImg: {
    width: "100%",
    height: 100,
    borderRadius: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "white",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    elevation: 5,
  },
});
