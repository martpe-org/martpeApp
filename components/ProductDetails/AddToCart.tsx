import React, { FC } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import DynamicButton from "../common/DynamicButton";
import { useCartStore } from "../../state/useCartStore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

interface AddToCartProps {
  price: number;
  storeId: string;
  slug?: string;
  itemId?: string;
  catalogId?: string;
  maxLimit: number;
  customizable?: boolean;
  customizations?: {
    _id?: string;
    id?: string;
    groupId?: string;
    group_id?: string;
    optionId?: string;
    option_id?: string;
    name: string;
  }[];
  onCartChange?: () => void;
}

const { width } = Dimensions.get("window");

const AddToCart: FC<AddToCartProps> = ({
  price,
  storeId,
  slug,
  catalogId,
  maxLimit,
  customizable = false,
  customizations = [],
  onCartChange, // ✅ properly destructured
}) => {
  const allCarts = useCartStore((state) => state.allCarts);
  const cart = allCarts.find((c) => c.store?.id === storeId);

  const item = cart?.items?.find((it: any) => it?.product_slug === slug);
  const itemCount = item?.qty || 0;

  const normalizedCustomizations = customizations.map((custom) => ({
    _id: custom._id || custom.id,
    groupId: custom.groupId || custom.group_id || "",
    optionId: custom.optionId || custom.option_id || "",
    name: custom.name,
  }));

  return (
    <View style={styles.container}>
      {itemCount === 0 ? (
        <DynamicButton
          isNewItem
          storeId={storeId}
          slug={slug}
          catalogId={catalogId}
          qty={1}
          customizable={customizable}
          customizations={normalizedCustomizations}
          onSuccess={onCartChange} // ✅ trigger refresh after add
        >
          <View
            style={{
              backgroundColor: "#0e8910",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: width * 0.05,
              paddingVertical: width * 0.03,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#fff",
                fontSize: 20,
                fontWeight: "bold",
                marginRight: 10,
              }}
            >
              Add to Cart
            </Text>
          </View>
        </DynamicButton>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
          {/* decrement */}
          <DynamicButton
            isUpdated
            storeId={storeId}
            qty={itemCount - 1}
            cartItemId={item?._id}
            customizable={customizable}
            customizations={normalizedCustomizations}
            onSuccess={onCartChange} // ✅ trigger refresh after update
          >
            <View style={styles.itemCountChangeButton}>
              <MaterialIcons name="remove-circle" size={30} color="red" />
            </View>
          </DynamicButton>

          {/* middle info */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              maxWidth: 100,
              alignItems: "center",
              justifyContent: "center",
              columnGap: 2,
            }}
          >
            <FontAwesome name="rupee" size={8} color="#030303" />
            <Text style={{ fontSize: 20, fontWeight: "900" }}>
              {itemCount * price}
            </Text>
            <Text>
              ({itemCount > 1 ? `${itemCount} items` : `${itemCount} item`})
            </Text>
          </View>

          {/* increment */}
          {itemCount < maxLimit ? (
            <DynamicButton
              isUpdated
              storeId={storeId}
              qty={itemCount + 1}
              cartItemId={item?._id}
              customizable={customizable}
              customizations={normalizedCustomizations}
              onSuccess={onCartChange} // ✅ trigger refresh after update
            >
              <View style={styles.itemCountChangeButton}>
                <MaterialIcons name="add-circle" size={30} color="green" />
              </View>
            </DynamicButton>
          ) : (
            <DynamicButton
              isUpdated
              storeId={storeId}
              qty={itemCount + 1}
              cartItemId={item?._id}
              disabled
              customizable={customizable}
              customizations={normalizedCustomizations}
            >
              <View style={styles.itemCountChangeButton}>
                <MaterialIcons name="add-circle" size={24} color="#0e8910" />
              </View>
            </DynamicButton>
          )}
        </View>
      )}
    </View>
  );
};

export default AddToCart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "space-between",
    elevation: 5,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  itemCountChangeButton: {
    width: Dimensions.get("window").width * 0.1,
    height: Dimensions.get("window").width * 0.1,
    justifyContent: "center",
    alignItems: "center",
  },
});
