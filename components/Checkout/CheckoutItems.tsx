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
}

const CheckoutItems: React.FC<CheckoutItemsProps> = ({ storeId, items }) => {
  const { removeCart, updateQty } = useCartStore();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQty(storeId, itemId, newQuantity);
    } catch (error) {
      console.error("Error updating the item quantity", error.message);
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
              await removeCart(storeId, itemId);
              router.back(); // Navigate back if cart is empty
            } catch (error) {
              console.error("Error deleting cart item:", error.message);
            }
          },
        },
      ]);
    } else {
      try {
        await removeItem(storeId, itemId);
      } catch (error) {
        console.error("Error deleting cart item:", error.message);
      }
    }
  };

  const renderItem = ({ item }) => {
    const { itemId, details, quantity, available, log, maxQuantity } = item;
    const {
      descriptor: { name, symbol },
      price: { value },
    } = details;

    return (
      <View
        style={[styles.itemContainer, !available && styles.unavailableItem]}
        key={itemId}
      >
        <View style={styles.itemDescContainer}>
          <View style={styles.itemImgContainer}>
            <ImageComp
              source={{ uri: symbol }}
              imageStyle={styles.productImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.itemDetails}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>
            
            <View style={styles.itemPriceInfoContainer}>
              <Text style={styles.itemPriceText}>
                ₹{Number(value).toFixed(2).replace(/\.?0+$/, "")}
              </Text>
              <Text style={styles.itemPriceText}>x {quantity}</Text>
              <Text style={styles.itemTotalCostText}>
                ₹{Number(value * quantity).toFixed(2).replace(/\.?0+$/, "")}
              </Text>
            </View>
            
            {log && log.length > 0 &&
              log.map((logItem, index) => (
                <Text style={styles.log} key={index}>
                  {logItem}
                </Text>
              ))
            }
          </View>
        </View>

        {/* Quantity Controls */}
        {available ? (
          <View style={styles.cartItemQuantityContainer}>
            <TouchableOpacity
              onPress={() => {
                quantity > 1
                  ? handleQuantityChange(itemId, quantity - 1)
                  : handleDeleteItem(itemId);
              }}
              disabled={!available}
            >
              <DecrementIcon />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity
              onPress={() =>
                quantity < maxQuantity &&
                handleQuantityChange(itemId, quantity + 1)
              }
              disabled={quantity >= maxQuantity}
            >
              {quantity < maxQuantity ? (
                <IncrementIcon />
              ) : (
                <IncrementIcon disabled={true} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => handleDeleteItem(itemId)}
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