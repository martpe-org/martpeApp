import LikeButton from "../../components/common/likeButton";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";

// Define interfaces at the top level
interface Descriptor {
  name: string;
  short_desc: string;
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

interface ProductData {
  id: string;
  descriptor?: Descriptor;
  price?: Price;
  quantity?: Quantity;
  category_id?: string;
}

interface CartItem {
  _id: string;
  qty: number;
  unit_price: number;
  unit_max_price: number;
  total_price: number;
  total_max_price: number;
  catalog_id?: string;
}

interface Cart {
  store: { _id: string; id?: string };
  cart_items: CartItem[];
}

interface ProductListProps {
  storeId: string;
  catalogs: ProductData[];
  categoryFiltered: string[];
}

const ProductList: React.FC<ProductListProps> = ({ 
  storeId, 
  catalogs, 
  categoryFiltered 
}) => {
  const { allCarts } = useCartStore();
  
  // Find cart by storeId - check both _id and id fields to match your cart structure
  const cart = allCarts.find((cart: Cart) => 
    cart.store._id === storeId || cart.store.id === storeId
  );

  if (!catalogs || catalogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  }

  console.log("Catalogs:", catalogs);
  console.log("Cart found:", cart);
  console.log("All carts:", allCarts);

  const renderProduct = (data: ProductData) => {
    const {
      id,
      descriptor: { 
        name = "Unknown Product", 
        short_desc = "", 
        images = [] 
      } = {},
      price: { 
        maximum_value: maximum_price = 0, 
        value: price = 0, 
        offer_percent 
      } = {},
      quantity: {
        available: { count: available_quantity = 0 } = {},
        maximum: { count: maximum_quantity = 10 } = {},
      } = {},
    } = data;

    // Find if this product is in the cart
    const cartItem = cart?.cart_items?.find((item: CartItem) => 
      item.catalog_id === id
    );
    
    const isInCart = !!cartItem;
    const cartQuantity = cartItem?.qty || 0;

    console.log(`Product ${id} - In cart: ${isInCart}, Quantity: ${cartQuantity}`);

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/(tabs)/home/result/productDetails/${id}`);
        }}
        style={styles.product}
        key={id}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: images[0] || 'https://via.placeholder.com/150x150?text=No+Image' 
            }} 
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

        {/* Product name */}
        <Text numberOfLines={1} style={styles.title}>
          {name}
        </Text>

        {/* Product description */}
        <Text numberOfLines={1} style={styles.desc}>
          {short_desc}
        </Text>

        {/* Price container */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>₹{price}</Text>
          {offer_percent && offer_percent > 1 && (
            <Text style={styles.strikethrough}>₹{maximum_price}</Text>
          )}
        </View>

        {/* Cart indicator */}
        {isInCart && (
          <View style={styles.cartIndicator}>
            <Text style={styles.cartIndicatorText}>{cartQuantity}</Text>
          </View>
        )}

        {/* Like button */}
        <View style={styles.add}>
          <LikeButton color="gray" productId={id} />
        </View>
      </TouchableOpacity>
    );
  };

  // Filter catalogs by category
  const filteredCatalogs = catalogs.filter(
    (catalog: ProductData) =>
      categoryFiltered.length === 0 ||
      categoryFiltered.includes(catalog.category_id || "")
  );

  if (filteredCatalogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products found for selected categories</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
    >
      {filteredCatalogs.map((data: ProductData) => renderProduct(data))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  product: {
    width: 168,
    backgroundColor: "white",
    position: "relative",
    marginVertical: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    padding: 5,
    borderRadius: 8,
  },
  imageContainer: {
    height: 150,
    width: 150,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  scrollViewContent: {
    gap: 10,
    padding: 5,
    paddingHorizontal: 25,
  },
  discount: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    maxWidth: 150,
    marginTop: 8,
  },
  discountPercent: {
    position: "absolute",
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  discountView: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  desc: {
    color: "#87848A",
    fontSize: 12,
    maxWidth: 150,
    marginTop: 2,
  },
  footerContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    paddingHorizontal: 10,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    fontSize: 12,
    color: "#736D6D",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    alignItems: "center",
  },
  add: {
    position: "absolute",
    right: 8,
    bottom: 8,
    zIndex: 2,
  },
  cartIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#00BC66",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cartIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default ProductList;