import ImageComp from "@/components/common/ImageComp";
import { router } from "expo-router";
import { FC, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddToCart from "../../ProductDetails/AddToCart";

interface FashionCardProps {
  itemName: string;
  desc: string;
  value: number;
  maxPrice?: number;
  discount: number | string;
  image: string;
  id: string;
  catalogId: string;
  storeId?: string;
  slug?: string;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[]; // ✅ add
}

const FashionCard: FC<FashionCardProps> = ({
  itemName,
  desc,
  value,
  maxPrice,
  discount,
  image,
  id,
  catalogId,
  storeId,
  slug,
  customizable = false, // ✅ default
  directlyLinkedCustomGroupIds = [],
}) => {
  const safeStoreId = storeId && storeId !== "unknown-store" ? storeId : null;

  useEffect(() => {
    if (!safeStoreId) {
      console.warn(
        `⚠️ FashionCard: Missing storeId for product ${id} (${itemName})`
      );
    }
  }, [safeStoreId, id, itemName]);
  const renderAddToCart = () => {
    if (!safeStoreId) {
      return (
        <View style={styles.addToCartContainer}>
          <Text style={styles.errorText}>Store ID missing</Text>
        </View>
      );
    }

    return (
      <View style={styles.addToCartContainer}>
        <AddToCart
          price={value || 0}
          storeId={safeStoreId}
          slug={slug || id}
          catalogId={catalogId}
          productName={itemName} // ✅ Product name
          customizable={customizable} // ✅ Customizable flag
          directlyLinkedCustomGroupIds={directlyLinkedCustomGroupIds} // ✅ Customization groups
        />
      </View>
    );
  };

  return (
    <View style={styles.fashionCard}>
      {/* Card Clickable Content */}
      <TouchableOpacity
        onPress={() =>
          router.push(`/(tabs)/home/result/productDetails/${slug || id}`)
        }
        style={styles.cardContent}
      >
        <ImageComp
          source={image}
          imageStyle={styles.fashionCardImage}
          resizeMode="cover"
          fallbackSource={{
            uri: "https://via.placeholder.com/185?text=Fashion",
          }}
          loaderColor="#666"
          loaderSize="small"
        />
        <View style={styles.fashionCardContent}>
          <Text
            style={styles.fashionCardTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {itemName}
          </Text>
          <Text
            style={styles.fashionCardDescription}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {desc}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 3 }}>
            <Text style={styles.fashionCardPrice}>
              <Text style={{ fontSize: 16 }}>₹{value}</Text>{" "}
              {maxPrice && (
                <Text style={styles.strikedOffText}>₹{maxPrice}</Text>
              )}
            </Text>
            {typeof discount === "number" && discount > 1 && (
              <Text style={styles.fashionCardDiscount}>
                {"  "}
                {discount}% Off
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Add to Cart Button */}
      {renderAddToCart()}
    </View>
  );
};

const styles = StyleSheet.create({
  fashionCard: {
    marginVertical: 5,
    marginBottom: 10,
    width: "48.5%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  fashionCardImage: {
    width: 185,
    height: 185,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  fashionCardContent: {
    padding: 10,
    paddingBottom: 5,
  },
  fashionCardTitle: {
    fontWeight: "900",
    fontSize: 13,
  },
  fashionCardDescription: {
    color: "#838181",
    fontSize: 11,
  },
  fashionCardPrice: {
    fontSize: 12,
    fontWeight: "800",
  },
  strikedOffText: {
    color: "#746F6F",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    fontWeight: "400",
  },
  fashionCardDiscount: {
    color: "#00BC66",
    fontWeight: "900",
  },
  addToCartContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default FashionCard;
