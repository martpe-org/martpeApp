import React, { FC } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddToCart from "../common/AddToCart";
import { FetchProductDetail } from "../product/fetch-product-type";

interface ServicesProps {
  product: FetchProductDetail;
}

const Services: FC<ServicesProps> = ({ product }) => {
  const returnWindow = product?.meta?.return_window || "";
  const returnable = product?.meta?.returnable;
  const cancellable = product?.meta?.cancellable;

  // Helper to prettify return window like "Within 10 days"
  const prettifyReturnWindow = (str: string) => {
    const num = str.replace(/\D/g, "");
    return num ? `Within ${num} days` : "Returnable";
  };

  return (
    <View style={styles.container}>
      {/* Add to Cart Button */}
      <AddToCart
        storeId={product.store_id}
        slug={product.slug}
        catalogId={product.catalog_id}
        price={product.price?.value || 0}
        productName={product.name}
        customizable={product.customizable}
        directlyLinkedCustomGroupIds={
          product.directlyLinkedCustomGroupIds || []
        }
        
      />

      {/* Info Section */}
      <View style={styles.infoContainer}>
        {/* Secured Payment */}
        <View style={styles.row}>
          <Ionicons name="card-outline" size={20} color="#6c757d" />
          <Text style={styles.text}>100% Secured Payment</Text>
        </View>

        {/* Cancellable */}
        <View style={styles.row}>
          <Ionicons name="close-circle-outline" size={20} color="#6c757d" />
          <Text style={styles.text}>
            {cancellable === false ? "Not cancellable" : "Cancellable"}
          </Text>
        </View>

        {/* Returnable */}
        <View style={styles.row}>
          <Ionicons name="time-outline" size={20} color="#6c757d" />
          <Text style={styles.text}>
            {returnable === false
              ? "Not returnable"
              : `Returnable - ${prettifyReturnWindow(returnWindow)}`}
          </Text>
        </View>

        {/* Razorpay badge */}
        <View style={styles.razorpayContainer}>
          <Image
            source={{
              uri: "https://badges.razorpay.com/badge-light.png",
            }}
            style={styles.razorpayBadge}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default Services;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: "#f1f1f1",
  },
  infoContainer: {
    marginTop: 10,
    flexDirection: "column",
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#495057",
  },
  razorpayContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  razorpayBadge: {
    height: 40,
    width: 110,
  },
});
