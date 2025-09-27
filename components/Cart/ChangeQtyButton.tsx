import { removeCartItems } from "@/components/Cart/api/removeCartItems";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import CustomizationGroup from "../customization/CustomizationGroup";
import EditCustomization from "../customization/EditCustomization";
import { Ionicons } from "@expo/vector-icons";
import Loader from "../common/Loader";

interface Props {
  cartItemId: string;
  qty: number;
  productName?: string;
  catalogId?: string;
  storeId?: string;
  max?: number;
  instock?: boolean;
  customizable?: boolean;
  customGroupIds?: string[];
  productPrice?: number;
  onQtyChange?: (qty: number) => void;
}

const ChangeQtyButton: React.FC<Props> = ({
  cartItemId,
  qty,
  catalogId,
  storeId,
  instock = true,
  customizable = false,
  customGroupIds = [],
  productPrice,
  productName,
}) => {
  const { updateQty, getCartItem, addItem } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [count, setCount] = useState(qty);
  const [loading, setLoading] = useState(false);
  const [repeatDialog, setRepeatDialog] = useState(false);
  const [customizationModal, setCustomizationModal] = useState(false);
  const [editCustomizationModal, setEditCustomizationModal] = useState(false);

  // Get cart item data from store
  const cartItem = getCartItem(cartItemId);

  useEffect(() => {
    setCount(qty);
  }, [qty]);

  const handleUpdate = async (newQty: number) => {
    if (!authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    setLoading(true);
    try {
      if (newQty === 0) {
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          toast.show("Failed to remove item", { type: "danger" });
        }
      } else {
        const success = await updateQty(cartItemId, newQty, authToken);
        if (!success) {
          toast.show("Failed to update quantity", { type: "danger" });
        }
      }
    } catch (err) {
      console.error("Error updating qty:", err);
      toast.show("Error updating cart", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const increment = () => {
    if (customizable && customGroupIds.length > 0) {
      setRepeatDialog(true);
    } else {
      handleUpdate(count + 1);
    }
  };

  const decrement = () => {
    if (count > 1) handleUpdate(count - 1);
    else handleUpdate(0);
  };

  // Repeat previous customization - just increase quantity
  const handleRepeatCustomization = () => {
    setRepeatDialog(false);
    handleUpdate(count + 1);
  };

  // Add new customized item - this will create a new cart item via Zustand
  const handleNewCustomization = () => {
    setRepeatDialog(false);
    setCustomizationModal(true);
  };

  const handleEditCustomization = () => {
    if (customizable && customGroupIds.length > 0) {
      setEditCustomizationModal(true);
    } else {
      toast.show("This item doesn't have customizable options", {
        type: "warning",
      });
    }
  };

  // ✅ New customized item → Add to cart via addItem
  const handleCustomizationSuccess = async (customizations: any[]) => {
    if (!authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    if (!storeId || !cartItem?.slug) {
      console.error("Missing required data:", { storeId, slug: cartItem?.slug, catalogId });
      toast.show("Missing required data to add item", { type: "danger" });
      return;
    }

    // Use catalogId from props, or fallback to a default if needed
    const finalCatalogId = catalogId || "default-catalog";

    try {
      const success = await addItem(
        storeId,
        cartItem.slug,
        finalCatalogId,
        1, // Always add 1 new item
        true, // customizable
        customizations,
        authToken
      );

      if (success) {
        setCustomizationModal(false);
        toast.show("New customized item added to cart", { type: "success" });
      } else {
        toast.show("Failed to add customized item", { type: "danger" });
      }
    } catch (error) {
      console.error("Error adding customized item:", error);
      toast.show("Error adding customized item", { type: "danger" });
    }
  };

  // ✅ Edited customization → Zustand updates item
  const handleEditSuccess = () => {
    setEditCustomizationModal(false);
    toast.show("Item customization updated", { type: "success" });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  return (
    <>
      <View style={styles.mainContainer}>
        {/* Quantity Controls */}
        <View style={styles.container}>
          <TouchableOpacity onPress={decrement} disabled={loading}>
            <Text style={styles.sign}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{count}</Text>
          <TouchableOpacity onPress={increment} disabled={loading || !instock}>
            <Text style={styles.sign}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Customization Button */}
        {customizable && customGroupIds.length > 0 && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditCustomization}
          >
            <Ionicons name="create-outline" size={16} color="#f14343" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Repeat Customization Dialog */}
      <Modal
        visible={repeatDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRepeatDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>
              Add another item with customization?
            </Text>
            <Text style={styles.dialogSubtitle}>
              "Repeat" will use the same customizations. "I will choose" will let
              you create a new customized item.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.outlineButton]}
                onPress={handleNewCustomization}
              >
                <Text style={styles.outlineButtonText}>I will choose</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.primaryButton]}
                onPress={handleRepeatCustomization}
              >
                <Text style={styles.primaryButtonText}>Repeat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Customization Modal */}
      {customizationModal && (
        <CustomizationGroup
          productSlug={cartItem?.slug || ""}
          storeId={storeId || ""}
          catalogId={catalogId || ""}
          productPrice={cartItem?.product?.price || productPrice || 0}
          directlyLinkedCustomGroupIds={customGroupIds}
          visible={customizationModal}
          onClose={() => setCustomizationModal(false)}
          onAddSuccess={handleCustomizationSuccess}
          productName={productName}
        />
      )}

      {/* Edit Customization Modal */}
      {editCustomizationModal && cartItem && (
        <EditCustomization
          cartItemId={cartItemId}
          productSlug={cartItem.slug}
          storeId={storeId || cartItem.store_id}
          catalogId={catalogId || ""}
          productPrice={
            cartItem.product?.price || productPrice || cartItem.unit_price
          }
          currentQty={count}
          directlyLinkedCustomGroupIds={customGroupIds}
          visible={editCustomizationModal}
          onClose={() => setEditCustomizationModal(false)}
          onUpdateSuccess={handleEditSuccess}
          productName={productName || cartItem.product?.name}
          existingCustomizations={cartItem.selected_customizations || []}
        />
      )}
    </>
  );
};

export default ChangeQtyButton;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  sign: {
    fontSize: 18,
    paddingHorizontal: 6,
    color: "#f14343",
    fontWeight: "600",
  },
  qty: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "600",
    color: "#f14343",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f14343",
  },
  editButtonText: {
    color: "#f14343",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 280,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  dialogSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  dialogButtons: {
    gap: 12,
  },
  dialogButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#F8383F",
  },
  primaryButton: {
    backgroundColor: "#F8383F",
  },
  outlineButtonText: {
    color: "#F8383F",
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});