import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

interface CartBottomBarProps {
  sellerLogo?: string;
  sellerName: string;
  numItems: number;
  totalCost: number;
  onCheckout: () => void;
  onDeleteCart: () => void;
}

const CartBottomBar: React.FC<CartBottomBarProps> = ({
  sellerLogo,
  sellerName,
  numItems,
  totalCost,
  onCheckout,
  onDeleteCart,
}) => {
  const formatCurrency = (amount: number) => {
    return `₹${Number(amount).toFixed(2).replace(/\.?0+$/, "")}`;
  };

  const formatItemText = (count: number) => {
    return count === 1 ? "1 item" : `${count} items`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        {sellerLogo ? (
          <Image 
            source={{ uri: sellerLogo }} 
            style={styles.sellerLogo}
            onError={() => console.warn('Failed to load seller logo')}
          />
        ) : (
          <View style={[styles.sellerLogo, styles.placeholderLogo]} />
        )}
        
        <View style={styles.sellerInfoContainer}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {sellerName}
          </Text>
          <TouchableOpacity onPress={onCheckout} activeOpacity={0.7}>
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.info}>
        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={onCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutItemText}>
            {formatItemText(numItems)} | {formatCurrency(totalCost)}
          </Text>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={onDeleteCart}
            activeOpacity={0.7}
          >
            <Image 
              source={require("../../assets/trash.png")} 
              style={styles.trashIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerInfoContainer: {
    flexDirection: "column",
    flex: 1,
  },
  sellerLogo: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 8,
  },
  placeholderLogo: {
    backgroundColor: "#e9ecef",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  viewCartText: { 
    textDecorationLine: "underline", 
    fontSize: 16,
    color: "#007AFF",
    marginTop: 2,
  },
  cartInfoContainer: {
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  checkoutButton: {
    backgroundColor: "#1CA672",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: "center",
    gap: 2,
    minWidth: 120,
  },
  checkoutItemText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  checkoutText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 0, 0, 0.15)",
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trashIcon: {
    width: 20,
    height: 20,
  },
});

export default CartBottomBar;