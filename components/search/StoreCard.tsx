import { router } from "expo-router";
import React, { FC } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StoreSearchResult } from "./search-stores-type";
import { styles } from "@/app/(tabs)/home/result/searchStyle";
import ImageComp from "../common/ImageComp";
// Store Card Component
const StoreCard: FC<{ item: StoreSearchResult }> = ({ item: store }) => {
  return (
    <View style={styles.storeCardWrapper}>
      <TouchableOpacity
        onPress={() =>
          router.push(`/(tabs)/home/result/productListing/${store.slug}`)
        }
        style={styles.storeCard}
      >
        <ImageComp
          source={{
            uri: store.symbol || "https://via.placeholder.com/60",
          }}
          imageStyle={styles.storeCardImage}
          resizeMode="cover"
        />
        <View style={styles.storeCardInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.storeCardName} numberOfLines={1}>
              {store.name}
            </Text>
          </View>
          <Text style={styles.storeCardDetails}>
            <Text>{store.distance_in_km.toFixed(1)}km</Text>
          </Text>
          <Text style={styles.storeCardAddress} numberOfLines={1}>
            {store.address.city}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default StoreCard;