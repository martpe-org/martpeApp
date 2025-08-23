import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import DynamicButton from "../ProductDetails/DynamicButton";

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
  authToken: string;
}

const ProductList: React.FC<ProductListProps> = ({
  storeId,
  catalogs,
  categoryFiltered,
  authToken,
}) => {
  const { allCarts } = useCartStore();

  // Find the matching cart
  const cart = allCarts.find((c) => c.store._id === storeId);

  if (!catalogs || catalogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  }

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

    // Find cart item by matching catalog_id with product id
    const cartItem = cart?.cart_items?.find((item) => {
      // Check multiple possible field names for catalog ID
      const catalogId = item.catalog_id || item.catalogId || item.product_id;
      return catalogId === id;
    });

    const itemCount = cartItem?.qty || 0;
    const cartItemId = cartItem?._id;

    return (
      <TouchableOpacity
        key={id}
        style={styles.product}
        onPress={() => router.push(`/(tabs)/home/result/productDetails/${id}`)}
      >
        {/* Product Image */}
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

        {/* Product details */}
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

          {/* Cart Controls (using DynamicButton) */}
          <View style={styles.buttonGroup}>
            <DynamicButton
              isNewItem={itemCount === 0}
              isUpdated={itemCount > 0}
              storeId={storeId}
              slug={slug}
              catalogId={id}
              cartItemId={cartItemId}
              qty={itemCount}
              customizable={false}
              customizations={[]}
            >
              {itemCount === 0 ? (
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>ADD</Text>
                </View>
              ) : (
                <View style={styles.quantityControls}>
                  <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{itemCount}</Text>
                  <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </DynamicButton>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  quantityButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  quantityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});

export default ProductList;
