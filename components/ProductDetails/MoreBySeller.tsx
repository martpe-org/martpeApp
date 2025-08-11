import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ImageComp from "../common/ImageComp";
import { Discount } from "./SVG";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const snapInterval = width * 0.72;

interface PriceType {
  value: number;
  maximum_value?: number;
  offer_percent?: number;
}

interface DescriptorType {
  name: string;
  images?: string[];
}

interface ProductType {
  id: string;
  descriptor: DescriptorType;
  price: PriceType;
}

interface SellerDetailsProps {
  sellerName: string;
  sellerDetails: string;
  sellerSymbol: string;
  sellerContact: string;
  products: ProductType[];
  originalId: string;
}

const MoreBySeller: FC<SellerDetailsProps> = ({ products, originalId }) => {
  const filteredProducts = products.filter((p) => p.id !== originalId);

  if (filteredProducts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More By Seller</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
      >
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            onPress={() => {
              router.push(`./(tabs)/home/productDetails/${product.id}`);
            }}
            style={styles.card}
          >
            {product?.price?.offer_percent && product.price.offer_percent > 0 && (
              <View style={styles.discountTag}>
                <Discount />
                <Text style={styles.discountText}>
                  {Math.ceil(product.price.offer_percent)}% OFF
                </Text>
              </View>
            )}

            <View style={styles.imageContainer}>
              <ImageComp
                source={{
                  uri: product?.descriptor?.images?.[0] || "",
                }}
                imageStyle={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.productName}>
                {product.descriptor.name.length > 15
                  ? product.descriptor.name.slice(0, 15) + "..."
                  : product.descriptor.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{Math.ceil(product?.price?.value)}</Text>

                {product.price?.offer_percent && (
                  <>
                    <Text style={styles.strikePrice}>
                      ₹{Math.ceil(product?.price?.maximum_value || 0)}
                    </Text>
                    <Text style={styles.offerPercent}>
                      {Math.ceil(product.price?.offer_percent)}% off
                    </Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MoreBySeller;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f7f3",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.07,
    marginVertical: width * 0.05,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#333",
    marginBottom: width * 0.02,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: width * 0.35,
    elevation: 2,
    marginHorizontal: width * 0.02,
    paddingBottom: 10,
    overflow: "hidden",
  },
  discountTag: {
    backgroundColor: "#F13A3A",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginTop: 10,
    borderBottomEndRadius: 50,
    borderTopRightRadius: 50,
  },
  discountText: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: width * 0.03,
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 10,
  },
  detailsContainer: {
    marginHorizontal: 10,
  },
  productName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  price: {
    color: "black",
    fontSize: 12,
  },
  strikePrice: {
    textDecorationLine: "line-through",
    fontSize: 12,
    color: "#B8B4B4",
    marginHorizontal: 8,
  },
  offerPercent: {
    color: "#00BC66",
    fontSize: 12,
  },
});
