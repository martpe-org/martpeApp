import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import useUserDetails from "../../hook/useUserDetails";
import ChangeQtyButton from "./ChangeQtyButton";

interface CartItemsProps {
  cartId: string;
  storeSlug: string;
  storeId?: string;
  items: CartItemType[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartId, items }) => {
  const { isLoading: userLoading } = useUserDetails();
  const toast = useToast();

  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;

  // Filter and validate items - similar to how FavOutlets handles stores
  const validItems = useMemo(() => {
    const filtered = items?.filter((item) => {
      if (!item || !item._id) {
        console.warn('CartItems: Invalid item found:', item);
        return false;
      }
      return true;
    }) || [];
    
    console.log('CartItems Debug:', {
      cartId,
      totalItemsPassed: items?.length || 0,
      validItemsCount: filtered.length,
      validItemIds: filtered.map(item => item._id),
      validItemNames: filtered.map(item => item.product?.name || 'Unknown')
    });
    
    return filtered;
  }, [items, cartId]);

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    if (!item || !item._id) return null;

    const productName = item.product?.name || "Unknown Product";
    const productImage = item.product?.symbol;
    const unitPrice = item.unit_price || 0;
    const totalPrice = item.total_price || (unitPrice * (item.qty || 1));

    return (
      <TouchableOpacity
        style={styles.item}
        key={item._id}
        onPress={() => {
          if (item.product?.slug) {
            router.push(
              `/(tabs)/home/result/productDetails/${item.product.slug}`
            );
          } else {
            toast.show("Product details not available", { type: "warning" });
          }
        }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image 
              source={{ uri: productImage }} 
              style={styles.image}
              defaultSource={{ uri: 'https://via.placeholder.com/50?text=IMG' }}
              onError={() => console.warn('Failed to load image:', productImage)}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>IMG</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={styles.price}>
            Unit: {formatCurrency(unitPrice)}
          </Text>
          <Text style={styles.total}>
            Total: {formatCurrency(totalPrice)}
          </Text>
          <Text style={styles.quantity}>
            Qty: {item.qty || 1}
          </Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.qtyContainer}>
          <ChangeQtyButton
            cartItemId={item._id}
            qty={item.qty || 1}
            max={item.product?.quantity}
            instock={item.product?.instock}
            customizable={item.product?.customizable}
            productName={productName}
            storeId={item.store_id}
            customGroupIds={item.product?.directlyLinkedCustomGroupIds ?? []}
            productPrice={unitPrice}
            onQtyChange={(newQty: number) => {
              console.log('Quantity changed:', { itemId: item._id, newQty, unitPrice });
              // The parent will handle the actual state update
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate totals - similar to FavOutlets pattern
  const { totalCost, totalItems } = useMemo(() => {
    if (!validItems?.length) return { totalCost: 0, totalItems: 0 };
    
    const totals = validItems.reduce(
      (acc, item) => {
        if (!item || !item._id) return acc;
        
        const itemTotal = item.total_price || (item.unit_price * (item.qty || 1)) || 0;
        const itemQty = item.qty || 1;
        
        acc.totalCost += itemTotal;
        acc.totalItems += itemQty;
        return acc;
      },
      { totalCost: 0, totalItems: 0 }
    );

    console.log('CartItems Totals:', {
      cartId,
      itemsCount: validItems.length,
      totalCost: totals.totalCost,
      totalItems: totals.totalItems
    });

    return totals;
  }, [validItems, cartId]);

  if (userLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f9740" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!validItems?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubText}>Add items to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - similar to FavOutlets */}
      <Text style={styles.header}>
        Items ({validItems.length}, {totalItems} total)
      </Text>

      {/* Items List */}
      <FlashList
        data={validItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id || `item-${Math.random()}`}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Footer - similar to FavOutlets */}
      <View style={styles.footer}>
        <Text style={styles.subtotal}>
          Subtotal: {formatCurrency(totalCost)}
        </Text>
        <TouchableOpacity
          style={styles.checkout}
          onPress={() => {
            console.log('Checkout pressed for cart:', cartId);
            router.push({
              pathname: "/(tabs)/cart/[checkout]",
              params: { checkout: cartId },
            });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  header: { 
    fontSize: 16, 
    fontWeight: "bold", 
    margin: 16,
    color: "#1A202C"
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  productInfo: {
    flex: 1,
    paddingRight: 8,
  },
  name: { 
    fontWeight: "700",
    fontSize: 14,
    color: "#1A202C",
    marginBottom: 4,
  },
  price: { 
    color: "#4A5568", 
    fontSize: 12,
    marginBottom: 2,
  },
  total: { 
    fontWeight: "600", 
    fontSize: 13,
    color: "#2F855A",
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  qtyContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  subtotal: { 
    fontWeight: "bold", 
    marginBottom: 12,
    fontSize: 16,
    color: "#1A202C",
  },
  checkout: {
    backgroundColor: "#f14343",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#f14343",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
  },
});

export default CartItems;