import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { HomeOfferType } from "../../hook/fetch-home-type";

type HomeOfferCardProps = {
  offerItem: HomeOfferType;
  index: number;
};

const OfferCardDomainNameMap: Record<string, string> = {
  food: "Food",
  grocery: "Grocery",
  fashion: "Fashion",
  electronics: "Electronics",
  personalcare: "Personal Care",
};

export const HomeOfferCard: React.FC<HomeOfferCardProps> = ({
  offerItem,
  index,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/stores/${offerItem.store.slug}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      key={offerItem.store_id}
      style={styles.cardContainer}
      activeOpacity={0.8}
    >
      {/* Overlay Content */}
      <View style={styles.overlay}>
        <Text style={[styles.title, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
          {offerItem.code === "discount" ? (
            offerItem.benefit?.value_type !== "percentage" ? (
              <>
                <Text style={styles.storeName}>{offerItem.store.name}</Text>
                {offerItem.benefit?.value_cap && (
                  <Text style={styles.text}>
                    {"\n"}
                    {offerItem.short_desc} upto ₹
                    {Math.abs(Number(offerItem.benefit.value_cap))}
                  </Text>
                )}
                {offerItem.qualifier?.min_value && (
                  <Text style={styles.text}>
                    {"\n"}
                    {offerItem.short_desc} on orders above ₹
                    {offerItem.qualifier.min_value}
                  </Text>
                )}
              </>
            ) : (
              `Flat ${offerItem.short_desc}`
            )
          ) : offerItem.code === "default" ? (
            <>
              <Text style={styles.storeName}>{offerItem.store.name}</Text>
              <Text style={styles.text}>
                {"\n"}
                {offerItem.short_desc} on{" "}
                {OfferCardDomainNameMap[offerItem.domain]}
              </Text>
            </>
          ) : (
            <>{offerItem.short_desc}</>
          )}
        </Text>
      </View>

      {/* Background Image */}
      <Image
        source={{ uri: offerItem.store.symbol }}
        resizeMode="cover"
        style={styles.backgroundImage}
     //   defaultSource={require("../../assets/placeholder.png")} // fallback placeholder
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 180,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
    elevation: 4,
    backgroundColor: "#f8f8f8",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    padding: 6,
    borderRadius: 6,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  text: {
    fontSize: 14,
    color: "#fff",
    marginTop: 2,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default HomeOfferCard;
