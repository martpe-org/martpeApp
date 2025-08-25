import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { DecrementIcon, IncrementIcon } from "@/constants/icons/carticons";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import ImageComp from "../common/ImageComp";

interface CheckoutItemsProps {
  storeId: string;
  items: any[];
  authToken: string;
}

const CheckoutItems: React.FC<CheckoutItemsProps> = ({ storeId, items, authToken }) => {
  const { removeCart, updateQty, removeCartItems } = useCartStore();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      const success = await updateQty(itemId, newQuantity, authToken);
      if (!success) {
        console.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating the item quantity", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (items.length === 1) {
      Alert.alert("Remove Cart", "Are you sure you want to remove this cart?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: async () => {
            try {
              const success = await removeCart(storeId, authToken);
              if (success) {
                router.back(); // Navigate back if cart is empty
              } else {
                console.error("Failed to remove cart");
              }
            } catch (error) {
              console.error("Error deleting cart:", error);
            }
          },
        },
      ]);
    } else {
      try {
        const success = await removeCartItems([itemId], authToken);
        if (!success) {
          console.error("Failed to remove item");
        }
      } catch (error) {
        console.error("Error deleting cart item:", error);
      }
    }
  };

  const renderItem = ({ item}) => {
    // Handle different possible item structures
    const itemData = {
      itemId: item._id || item.itemId,
      name: item.product?.name || item.details?.descriptor?.name || item.name || "Unknown Product",
      symbol: item.product?.symbol || item.details?.descriptor?.symbol || item.image || "",
      price: item.unit_price || item.details?.price?.value || 0,
      quantity: item.qty || item.quantity || 1,
      maxQuantity: item.max_qty || item.maxQuantity || item.product?.quantity || 999,
      available: item.product?.instock !== false && item.available !== false,
      totalPrice: item.total_price || (item.unit_price || 0) * (item.qty || 1),
      log: item.log || []
    };

    return (
      <View
        style={[styles.itemContainer, !itemData.available && styles.unavailableItem]}
        key={itemData.itemId}
      >
        <View style={styles.itemDescContainer}>
          <View style={styles.itemImgContainer}>
            <ImageComp
              source={{ uri: itemData.symbol }}
              imageStyle={styles.productImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.itemDetails}>
            <Text style={styles.name} numberOfLines={2}>
              {itemData.name}
            </Text>
            
            <View style={styles.itemPriceInfoContainer}>
              <Text style={styles.itemPriceText}>
                ₹{Number(itemData.price).toFixed(2).replace(/\.?0+$/, "")}
              </Text>
              <Text style={styles.itemPriceText}>x {itemData.quantity}</Text>
              <Text style={styles.itemTotalCostText}>
                ₹{Number(itemData.totalPrice).toFixed(2).replace(/\.?0+$/, "")}
              </Text>
            </View>
            
            {itemData.log && itemData.log.length > 0 &&
              itemData.log.map((logItem, index) => (
                <Text style={styles.log} key={index}>
                  {logItem}
                </Text>
              ))
            }
          </View>
        </View>

        {/* Quantity Controls */}
        {itemData.available ? (
          <View style={styles.cartItemQuantityContainer}>
            <TouchableOpacity
              onPress={() => {
                itemData.quantity > 1
                  ? handleQuantityChange(itemData.itemId, itemData.quantity - 1)
                  : handleDeleteItem(itemData.itemId);
              }}
              disabled={!itemData.available}
            >
              <DecrementIcon />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{itemData.quantity}</Text>

            <TouchableOpacity
              onPress={() =>
                itemData.quantity < itemData.maxQuantity &&
                handleQuantityChange(itemData.itemId, itemData.quantity + 1)
              }
              disabled={itemData.quantity >= itemData.maxQuantity}
            >
              {itemData.quantity < itemData.maxQuantity ? (
                <IncrementIcon />
              ) : (
                <IncrementIcon disabled={true} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => handleDeleteItem(itemData.itemId)}
          >
            <FontAwesome
              name="trash-o"
              size={20}
              color="red"
              style={styles.trashIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items in cart</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.itemsContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Items in the cart ({items?.length})</Text>
        </View>
        
        <View style={styles.listContainer}>
          <FlashList
            data={items}
            renderItem={renderItem}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.addMoreContainer}
          onPress={() => {
            router.push(`/(tabs)/home/result/productListing/${storeId}`);
          }}
        >
          <AntDesign name="plus" size={16} color="black" />
          <Text style={styles.addMoreItemsText}>Add more items</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addMoreContainer}>
          <AntDesign name="file-markdown" size={16} color="black" />
          <Text style={styles.addMoreItemsText}>Apply Coupon</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  
  title: { 
    paddingVertical: 10, 
    fontWeight: "500", 
    fontSize: 14 
  },
  
  itemsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
  },
  
  listContainer: {
    minHeight: 2,
    marginBottom: 10,
  },
  
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  
  unavailableItem: {
    opacity: 0.6,
  },
  
  itemDescContainer: {
    flexDirection: "row",
    flex: 3,
    alignItems: "center",
  },
  
  itemImgContainer: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  
  productImage: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  
  itemDetails: {
    justifyContent: "center",
    flex: 1,
    maxWidth: 180,
  },
  
  name: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  
  itemPriceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  itemPriceText: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  
  itemTotalCostText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  
  log: {
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.7,
    marginVertical: 1,
    color: "#FF6B6B",
  },
  
  cartItemQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    minWidth: 80,
  },
  
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00BC66",
    minWidth: 20,
    textAlign: "center",
  },
  
  closeIcon: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  
  trashIcon: {
    padding: 8,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 5,
    textAlign: "center",
  },
  
  buttons: { 
    flexDirection: "row", 
    marginVertical: 10, 
    gap: 10 
  },
  
  addMoreContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  
  addMoreItemsText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "500",
    paddingLeft: 5,
  },
});

export default CheckoutItems;