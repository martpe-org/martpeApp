import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useFavoriteStore } from "../../../state/useFavoriteStore";

const FavouritesScreen = () => {
  const { allFavorites } = useFavoriteStore();
  const router = useRouter();

  const products = allFavorites?.products || [];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/account/favorite/${item.id}`)}
    >
      <Image
        source={{
          uri: item.image || "https://via.placeholder.com/150?text=Product",
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>
          {item.category || "Uncategorized"}
        </Text>
        <Text style={styles.store}>{item.store?.name || "Unknown Store"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>💔 No favourites yet!</Text>
        <Text style={styles.emptySubText}>
          Start adding products to your favourites ❤️
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  info: {
    marginLeft: 12,
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: "#666",
  },
  store: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
  },
});

export default FavouritesScreen;
