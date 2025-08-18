import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import ProductList2 from "./ProductList2";
import { router } from "expo-router";
import LikeButton from "../../components/common/likeButton";

const backgroundColors = {
  red: "#FFF6F6",
  yellow: "#FFFBEF",
} as const;

type AllowedColor = keyof typeof backgroundColors;

interface StoreCard3Props {
  storeData: any;
  color: AllowedColor;
  categoryFiltered: any;
}

const StoreCard3: React.FC<StoreCard3Props> = ({
  storeData,
  color,
  categoryFiltered,
}) => {
  if (!storeData) return null;

  const {
    descriptor = {},
    id,
    catalogs = [],
    address = {},
    geoLocation = {},
    calculated_max_offer = {},
  } = storeData;

  const { name = "", symbol = "" } = descriptor;
  const { street = "Unknown Street" } = address;

  return (
    <View style={{ height: 300, marginTop: 50 }}>
      <View style={styles.containerWrapper}>
        <View
          style={[
            styles.container,
            { backgroundColor: backgroundColors[color] },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${id}`)
            }
            style={styles.header}
          >
            <Image
              source={
                symbol ? { uri: symbol } : require("../../assets/patanjali.png")
              }
              style={styles.logoImage}
            />

            <View style={styles.details}>
              <View style={styles.subDetails}>
                <Text style={styles.brandText}>{name}</Text>
                <View style={styles.subText}>
                  <Text style={styles.locationText}>
                    {street} | <Text style={{ fontSize: 10 }}>4.2</Text>
                    <Image source={require("../../assets/star.png")} /> | 0.5 Km
                  </Text>
                </View>
              </View>
              <View style={styles.subDetails}>
                <View style={styles.logoIcons}>
                  <LikeButton color="gray" productId={id} />
                  <Image source={require("../../assets/more-vertical2.png")} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.productContainer}>
        <ProductList2
          categoryFiltered={categoryFiltered}
          storeId={id}
          catalogs={catalogs}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    zIndex: 1,
  },
  container: {
    marginHorizontal: 16,
    backgroundColor: "#FFF6F6",
    height: 295,
  },
  header: {
    flexDirection: "row",
  },
  details: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 5,
    justifyContent: "space-between",
  },
  subDetails: {
    flexDirection: "column",
    padding: 5,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
  },
  subText: {
    flexDirection: "row",
  },
  locationText: {
    fontSize: 10,
  },
  rating: {
    flexDirection: "row",
    gap: 3,
  },
  logoContainer: {
    width: 110,
    height: 70,
    top: -25,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    backgroundColor: "white",
    zIndex: 2,
    marginLeft: 8,
    overflow: "hidden",
  },
  logoImage: {
    flex: 1,
    resizeMode: "contain",
    width: "100%",
    height: "100%",
  },
  logoIcons: {
    flex: 1,
    flexDirection: "row",
  },
  productContainer: {
    top: -230,
    zIndex: 2,
  },
});

export default StoreCard3;
