import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import ImageComp from "@/components/common/ImageComp";
import AddToCart from "@/components/ProductDetails/AddToCart";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.46;

interface PersonalCareCardProps {
  title: string;
  description: string;
  price: number;
  discount: number;
  image?: string;
  symbol?: string;
  maxValue: number;
  id: string;
  providerId?: string;
  catalogId?: string;
  slug?: string;
  item?: {
    id: string;
    catalog_id: string;
    provider?: { store_id: string };
    provider_id?: string;
    store_id?: string;
    store?: { _id: string };
  };
}

const PersonalCareCard: React.FC<PersonalCareCardProps> = ({
  title,
  description,
  price,
  discount,
  image,
  symbol,
  maxValue,
  id,
  providerId,
  catalogId,
  slug,
  item,
}) => {
  const handlePress = () => {
    router.push(`/(tabs)/home/result/productDetails/${slug || id}`);
  };
const isMongoId = (id?: string): boolean =>
  !!id && /^[0-9a-fA-F]{24}$/.test(id);

const resolveStoreId = (): string | undefined => {
  if (isMongoId(item?.store?._id)) return item!.store!._id;
  if (isMongoId(item?.provider?.store_id)) return item!.provider!.store_id;
  if (isMongoId(item?.store_id)) return item!.store_id;
  if (isMongoId(item?.provider_id)) return item!.provider_id;
  if (isMongoId(typeof providerId === "string" ? providerId : undefined))
    return providerId as string;
  return undefined;
};



  const storeId = resolveStoreId();

  useEffect(() => {
    if (!storeId) {
      console.warn(
        `⚠️ PersonalCareCard: Missing storeId for product ${id} (${title})`
      );
    }
  }, [storeId, id, title]);

  const getImageSource = () => {
    if (symbol && symbol.trim() !== "") {
      return { uri: symbol };
    }
    if (image && image.trim() !== "") {
      return { uri: image };
    }
    return { uri: "https://via.placeholder.com/150?text=Personal+Care" };
  };

  const renderAddToCart = () => {
    if (!storeId) {
      return (
        <View style={styles.cartWrapper}>
          <Text style={styles.errorText}>Store ID missing</Text>
        </View>
      );
    }

    return (
      <View style={styles.cartWrapper}>
        <AddToCart
          storeId={storeId}
          slug={slug || id} // ✅ no item?.slug needed
          catalogId={catalogId || item?.catalog_id || ""}
          price={price}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <ImageComp
          source={getImageSource()}
          imageStyle={styles.image}
          resizeMode="cover"
          fallbackSource={{
            uri: "https://via.placeholder.com/150?text=Personal+Care",
          }}
          loaderColor="#530633"
          loaderSize="small"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description || "No description available"}
        </Text>

        {discount > 1 && <Text style={styles.strikedOff}>₹{maxValue}</Text>}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {discount > 1 && (
            <Text style={styles.discount}>{discount}% Off</Text>
          )}
        </View>
      </View>

      {renderAddToCart()}
    </TouchableOpacity>
  );
};

export default PersonalCareCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    elevation: 4,
    backgroundColor: "#fff",
    paddingBottom: 10,
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    backgroundColor: "#f7f7f7",
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 8,
    flexGrow: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  description: {
    color: "#777",
    fontSize: 12,
    marginBottom: 6,
  },
  strikedOff: {
    color: "#999",
    fontSize: 11,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#530633",
  },
  discount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#28a745",
  },
  cartWrapper: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
});
