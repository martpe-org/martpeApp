import { router } from "expo-router";
import {
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DynamicButton from "../common/DynamicButton";
import { useCartStore } from "../../state/useCartStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Descriptor {
  name: string;
  images: string[];
}

interface Price {
  maximum_value: number;
  value: number;
  offer_percent?: number;
}

interface Available {
  count: number;
}

interface Quantity {
  available?: Available;
  maximum?: Available;
  unitized?: {
    measure: {
      unit: string;
      value: string;
    };
  };
}

interface CartItem {
  _id: string;
  qty: number;
  unit_price: number;
  unit_max_price: number;
  total_price: number;
  total_max_price: number;
  catalog_id?: string;
  itemId?: string; // Legacy field
}

interface Cart {
  store: { _id: string; id?: string };
  cart_items: CartItem[];
}

interface Data {
  id: string;
  descriptor?: Descriptor;
  price?: Price;
  quantity?: Quantity;
  storeId?: string;
  slug?: string;
  category_id?: string;
}

interface ProductListProps {
  storeId: string;
  catalogs: Data[];
  categoryFiltered: string[];
  authToken: string; // Add authToken prop
}

const ProductList: React.FC<ProductListProps> = ({
  storeId,
  catalogs,
  categoryFiltered,
  authToken,
}) => {
  const { allCarts, addItem, updateQty, removeCartItems } = useCartStore();

  // Find cart by storeId (check both _id and id fields)
  const cart = allCarts.find(
    (c) => c.store._id === storeId || c.store.id === storeId
  );

  if (!catalogs || catalogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  }

  const handleAddItem = async (catalogId: string, slug: string) => {
    if (!authToken) {
      console.error("No auth token available");
      return;
    }

    try {
      const success = await addItem(
        storeId,
        slug,
        catalogId,
        1,
        false,
        [],
        authToken
      );

      if (!success) {
        console.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    if (!authToken) {
      console.error("No auth token available");
      return;
    }

    try {
      if (newQty === 0) {
        // Remove item if quantity is 0
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          console.error("Failed to remove item from cart");
        }
      } else {
        // Update quantity
        const success = await updateQty(cartItemId, newQty, authToken);
        if (!success) {
          console.error("Failed to update item quantity");
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const renderProduct = (data: Data) => {
    const {
      id,
      descriptor: { name = "Unknown Product", images = [] } = {},
      price: {
        maximum_value: maximum_price = 0,
        value: price = 0,
        offer_percent,
      } = {},
      quantity: {
        available: { count: available_quantity = 0 } = {},
        maximum: { count: maximum_quantity = 10 } = {},
        unitized,
      } = {},
      slug = `product-${id}`,
    } = data;

    // Respect stock + max purchase limits
    const maxLimit = Math.min(maximum_quantity, available_quantity) || 10;

    // Find matching cart item
    const cartItem = cart?.cart_items?.find(
      (item) => item.catalog_id === id || item.itemId === id
    );

    const itemCount = cartItem?.qty || 0;
    const cartItemId = cartItem?._id;

    return (
      <TouchableOpacity
        key={id}
        style={styles.product}
        onPress={() => router.push(`/(tabs)/home/result/productDetails/${id}`)}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images?.[0] || "https://via.placeholder.com/150" }}
            style={styles.image}
          />
        </View>

        {/* Discount badge */}
        {offer_percent && offer_percent > 1 && (
          <View style={styles.discountView}>
            <View style={styles.discount}>
              <Image source={require("../../assets/greenStar.png")} />
              <Text style={styles.discountPercent}>{offer_percent}%</Text>
            </View>
          </View>
        )}

        {/* Details */}
        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.title}>
            {name}
          </Text>

          {unitized && (
            <Text style={styles.quantity}>
              {unitized.measure?.value} {unitized.measure?.unit}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            {offer_percent && offer_percent > 1 && (
              <Text style={styles.strikeThrough}>₹{maximum_price}</Text>
            )}
            <Text style={styles.priceText}>₹{price}</Text>
          </View>

          {/* Add / Update Controls */}
          <View style={styles.buttonGroup}>
            {itemCount === 0 ? (
              <TouchableOpacity
                style={styles.add}
                onPress={() => handleAddItem(id, slug)}
              >
                <Text style={styles.addText}>Add</Text>
                <MaterialCommunityIcons
                  name="plus"
                  size={16}
                  color="#0e8910"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControls}>
                {/* Decrement */}
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleUpdateQuantity(cartItemId!, Math.max(0, itemCount - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={16} color="red" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{itemCount}</Text>

                {/* Increment */}
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    itemCount >= maxLimit && styles.disabledBtn,
                  ]}
                  onPress={() => handleUpdateQuantity(cartItemId!, itemCount + 1)}
                  disabled={itemCount >= maxLimit}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={itemCount >= maxLimit ? "#ccc" : "#0e8910"}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Category filtering
  const filteredCatalogs = catalogs.filter(
    (catalog) =>
      categoryFiltered.length === 0 ||
      categoryFiltered.includes(catalog.category_id || "")
  );

  if (filteredCatalogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No products found for selected categories
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
    >
      {filteredCatalogs.map((d) => renderProduct(d))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  product: {
    width: 130,
    height: 200,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: "column",
    position: "relative",
  },
  details: {
    flex: 1,
    margin: 8,
    position: "relative",
  },
  title: {
    fontSize: 12,
    color: "#333",
    fontWeight: "400",
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: "#87848A",
    marginBottom: 4,
  },
  strikeThrough: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#030303",
  },
  priceContainer: {
    position: "absolute",
    bottom: 35,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  discount: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  discountPercent: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  discountView: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },
  buttonGroup: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0e8910",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0e8910",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 12,
    minWidth: 30,
  },
  imageContainer: {
    height: 100,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  scrollViewContent: {
    flexDirection: "row",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default ProductList;