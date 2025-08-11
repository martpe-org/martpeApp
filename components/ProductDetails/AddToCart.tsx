import React, { FC } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import DynamicButton from "../common/DynamicButton";
import { useCartStore } from "../../state/useCartStore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

interface AddToCartProps {
  price: number;
  storeId: string;
  slug: string; // Changed from itemId to slug to match API
  catalogId: string; // Added catalog ID required by API
  maxLimit: number;
  customizable?: boolean; // Added for API compatibility
  customizations?: { 
    _id?: string; // Added missing _id property
    id?: string; // Alternative id property name
    groupId?: string; 
    group_id?: string; // Alternative property name
    optionId?: string; 
    option_id?: string; // Alternative property name
    name: string; 
  }[]; // Added for customizations with flexible property names
}

const { width, height } = Dimensions.get("window");

const AddToCart: FC<AddToCartProps> = ({
  price,
  storeId,
  slug,
  catalogId,
  maxLimit,
  customizable = false,
  customizations = [],
}) => {
  const allCarts = useCartStore((state) => state.allCarts);
  const cart = allCarts.find((cart) => cart.store.id === storeId);
  
  // Find item by product_slug instead of itemId
  const item = cart?.items?.find((item) => item?.product_slug === slug);
  const itemCount = item?.qty || 0; // Changed from quantity to qty

  // Normalize customizations to match API expected format
  const normalizedCustomizations = customizations.map(custom => ({
    _id: custom._id || custom.id,
    groupId: custom.groupId || custom.group_id || '',
    optionId: custom.optionId || custom.option_id || '',
    name: custom.name
  }));

  console.log("added item count", itemCount);

  return (
    <View style={styles.container}>
      {itemCount === 0 ? (
        <DynamicButton
          isNewItem={true}
          storeId={storeId}
          slug={slug} // Updated prop name
          catalogId={catalogId} // Added catalog ID
          quantity={1}
          customizable={customizable}
          customizations={normalizedCustomizations}
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
            {/* <FontAwesome name="rupee" size={20} color="#fff" />
            <Text style={{ fontWeight: "900", fontSize: 25, color: "#fff" }}>
              {" "}
              {price}
            </Text> */}
          </View>
        </DynamicButton>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {/* decrement button */}
          <DynamicButton
            isUpdated={true}
            isNewItem={false}
            storeId={storeId}
            quantity={itemCount - 1}
            slug={slug} // Updated prop name
            catalogId={catalogId} // Added catalog ID
            cartItemId={item?._id} // Added cart item ID for updates
            customizable={customizable}
            customizations={normalizedCustomizations}
          >
            <View
              style={{
                ...styles.itemCountChangeButton,
              }}
            >
              {/* <Text style={styles.incrementDecrementButtonText}>-</Text> */}
              <MaterialIcons name="remove-circle" size={30} color="red" />
            </View>
          </DynamicButton>

          {/* middle text */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              maxWidth: 100,
              alignContent: "center",
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

          {/* increment button */}
          {itemCount < maxLimit ? (
            <DynamicButton
              isUpdated={true}
              isNewItem={false}
              storeId={storeId}
              quantity={itemCount + 1}
              slug={slug} // Updated prop name
              catalogId={catalogId} // Added catalog ID
              cartItemId={item?._id} // Added cart item ID for updates
              customizable={customizable}
              customizations={normalizedCustomizations}
            >
              <View
                style={{
                  ...styles.itemCountChangeButton,
                }}
              >
                <MaterialIcons name="add-circle" size={30} color="green" />
              </View>
            </DynamicButton>
          ) : (
            <DynamicButton
              isUpdated={true}
              isNewItem={false}
              storeId={storeId}
              quantity={itemCount + 1}
              slug={slug} // Updated prop name
              catalogId={catalogId} // Added catalog ID
              cartItemId={item?._id} // Added cart item ID for updates
              disabled={true}
              customizable={customizable}
              customizations={normalizedCustomizations}
            >
              <View
                style={{
                  ...styles.itemCountChangeButton,
                  // borderLeftWidth: 1,
                  // opacity: 0.5,
                }}
              >
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
    // paddingVertical: width * 0.02,
    // marginHorizontal: width * 0.05,
    elevation: 5,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  incrementDecrementButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#FB3E44",
    color: "white",
    paddingVertical: 5,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonIcon: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  itemCountChangeButton: {
    width: Dimensions.get("window").width * 0.1,
    height: Dimensions.get("window").width * 0.1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#607480",
    marginRight: width * 0.05,
  },
  cartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonIcon: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },
});