import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import useUserDetails from "../../hook/useUserDetails";
import { useToast } from "react-native-toast-notifications";
import CustomizationGroup from "./CustomizationGroup";

interface DynamicButtonProps {
  storeId: string;
  slug: string;
  onAddSuccess: () => void;
  catalogId: string;
  customizable?: boolean;
  customizations?: {
    groupId?: string;
    optionId?: string;
    name: string;
  }[];
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  storeId,
  slug,
  catalogId,
  customizable = false,
  customizations = [],
  onAddSuccess, // ✅ Make sure this is properly destructured
}) => {
  const { addItem } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  const normalizedCustomizations = customizations.map((c) => ({
    groupId: c.groupId || "",
    optionId: c.optionId || "",
    name: c.name,
  }));

  const handleAdd = async () => {
    if (!authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    if (customizable && normalizedCustomizations.length > 0) {
      setShowCustomization(true);
      return;
    }

    setLoading(true);
    try {
      const success = await addItem(
        storeId,
        slug,
        catalogId,
        1,
        customizable,
        normalizedCustomizations,
        authToken
      );

      if (success) {
        toast.show("🎉 Congrats! Item added to cart", { type: "success" });
        // ✅ Call onAddSuccess after successful addition
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

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={handleAdd}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.text}>Add</Text>
        )}
      </TouchableOpacity>

      {/* Customization modal */}
      <Modal
        visible={showCustomization}
        animationType="slide"
        onRequestClose={() => setShowCustomization(false)}
      >
        <CustomizationGroup
          customizable
          customGroup={normalizedCustomizations.map((c) => c.groupId)}
          vendorId={storeId}
          price={0}
          itemId={catalogId}
          maxLimit={5}
          closeFilter={() => setShowCustomization(false)}
        />
      </Modal>
    </>
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
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});