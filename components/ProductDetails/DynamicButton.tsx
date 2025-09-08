import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import useUserDetails from "../../hook/useUserDetails";
import { useToast } from "react-native-toast-notifications";

interface DynamicButtonProps {
  storeId: string;
  slug: string;
  catalogId: string;
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
  onAddSuccess: () => void;
  onShowCustomization?: () => void;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  storeId,
  slug,
  catalogId,
  customizable = false,
  directlyLinkedCustomGroupIds = [],
  onAddSuccess,
  onShowCustomization,
}) => {
  const { addItem } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    // If product is customizable and has customization groups, show customization modal
    if (customizable && directlyLinkedCustomGroupIds.length > 0) {
      onShowCustomization && onShowCustomization();
      return;
    }

    // For non-customizable products or customizable products without groups
    setLoading(true);
    try {
      const success = await addItem(
        storeId,
        slug,
        catalogId,
        1,
        customizable,
        [], // empty customizations for non-customizable items
        authToken
      );

      if (success) {
        toast.show("Item added to cart successfully!", { type: "success" });
        onAddSuccess();
      } else {
        toast.show("Failed to add to cart", { type: "danger" });
      }
    } catch (err) {
      console.error("Add item error:", err);
      toast.show("Error adding to cart", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

 const getButtonContent = () => {
    if (loading) {
      return <ActivityIndicator color="#fff" size="small" />;
    }
    
    if (customizable && directlyLinkedCustomGroupIds.length > 0) {
      return (
        <View style={styles.buttonContent}>
          <Text style={styles.text}>Add</Text>
          <Text style={styles.plusIcon}>+</Text>
        </View>
      );
    }
    
    return <Text style={styles.text}>Add</Text>;
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleAdd}
      disabled={loading}
    >
      {getButtonContent()}
    </TouchableOpacity>
  );
};


export default DynamicButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f14343",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
    buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
    plusIcon: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});