import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import { CartItemType } from "../../app/(tabs)/cart/fetch-carts-type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CheckoutModal from "./CheckoutModal"; // We'll create this component

interface CartCheckoutButtonProps {
  cartId: string;
  storeId: string;
  items: CartItemType[];
  isStoreOpen?: boolean;
}

const CartCheckoutButton: React.FC<CartCheckoutButtonProps> = ({
  cartId,
  storeId,
  items,
  isStoreOpen = true,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const hasItems = items && items.length > 0;

  // FIXED: Only check for unavailable items among items that exist
  const availableItems = items.filter((item) => item.product?.instock === true);
  const unavailableItems = items.filter((item) => item.product?.instock === false);

  const hasUnavailableItems = unavailableItems.length > 0;
  const hasAvailableItems = availableItems.length > 0;

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Early returns with proper messages
  if (!hasItems) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>Items Unavailable</Text>
        </View>
      </View>
    );
  }

  if (!isStoreOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>Store is closed. Checkout unavailable.</Text>
        </View>
      </View>
    );
  }
  
  if (hasUnavailableItems && hasAvailableItems) {
    return (
      <View style={styles.container}>
        <View style={styles.warningButton}>
          <Text style={styles.warningText}>
            {unavailableItems.length} item(s) unavailable. Remove them to checkout.
          </Text>
        </View>
      </View>
    );
  }
  
  if (hasUnavailableItems && !hasAvailableItems) {
    return (
      <View style={styles.container}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>All items unavailable. Cannot checkout.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkout} onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons name={"cart-outline"} size={20} color={"white"} />
          <Text style={styles.checkoutText}>Continue to checkout</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.footerText}>Taxes & shipping calculated at checkout</Text>
      
      {/* Checkout Modal */}
 <Modal
  visible={isModalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  transparent={true}
  onRequestClose={handleCloseModal}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <CheckoutModal
        cartId={cartId}
        storeId={storeId}
        onClose={handleCloseModal}
      />
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // dim background
  justifyContent: 'flex-end',           // push modal to bottom
},
modalContainer: {
  height: '80%',
  backgroundColor: '#fff', // ensure modal content is white
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflow: 'hidden',
},

  buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, },
  footerText: { color: "#777", fontSize: 12, alignSelf: "center", padding: 4, textAlign: "center", },
  checkout: {
    backgroundColor: "#f76161",
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
    fontWeight: "bold",
    fontStyle:"italic",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#e5e5e5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#fff3cd",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});

export default CartCheckoutButton;