import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";
import Loader from "../common/Loader";
import CustomizationGroup from "../customization/CustomizationGroup";
import EditCustomization from "../customization/EditCustomization";
import RepeatCustomizationDialog from "../customization/RepeatCustomizationDialog";

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
  const { updateQty, getCartItem, addItem, removeCartItems } = useCartStore(); // Add removeCartItems
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [count, setCount] = useState(qty);
  const [loading, setLoading] = useState(false);
  const [repeatDialog, setRepeatDialog] = useState(false);
  const [customizationModal, setCustomizationModal] = useState(false);
  const [editCustomizationModal, setEditCustomizationModal] = useState(false);

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
        // Use the store's removeCartItems method instead of direct API call
        const success = await removeCartItems([cartItemId], authToken);
        if (!success) {
          toast.show("Failed to remove item", { type: "danger" });
        }
        // The store method already handles optimistic update and state removal
      } else {
        const success = await updateQty(cartItemId, newQty, authToken);
        if (!success) toast.show("Failed to update quantity", { type: "danger" });
      }
    } catch (err) {
      console.error("Error updating qty:", err);
      toast.show("Error updating cart", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };



  const increment = () => {
    if (customizable && customGroupIds.length > 0) setRepeatDialog(true);
    else handleUpdate(count + 1);
  };

  const decrement = () => {
    if (count > 1) handleUpdate(count - 1);
    else handleUpdate(0);
  };

  const handleRepeatCustomization = () => {
    setRepeatDialog(false);
    handleUpdate(count + 1);
  };

  const handleNewCustomization = () => {
    setRepeatDialog(false);
    setCustomizationModal(true);
  };

  const handleEditCustomization = () => {
    if (customizable && customGroupIds.length > 0) {
      setEditCustomizationModal(true);
    } else {
      toast.show("This item doesn't have customizable options", { type: "warning" });
    }
  };

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

    const finalCatalogId = catalogId || "default-catalog";

    try {
      const success = await addItem(
        storeId,
        cartItem.slug,
        finalCatalogId,
        1,
        true,
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

  const handleEditSuccess = () => {
    setEditCustomizationModal(false);
    toast.show("Item customization updated", { type: "success" });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader size="small" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.mainContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={decrement} 
            disabled={loading}
          >
            <Text style={styles.quantitySign}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{count}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={increment} 
            disabled={loading || !instock}
          >
            <Text style={styles.quantitySign}>+</Text>
          </TouchableOpacity>
        </View>

        {customizable && customGroupIds.length > 0 && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditCustomization}>
            <Ionicons name="create-outline" size={14} color="#f14343" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <RepeatCustomizationDialog
        visible={repeatDialog}
        onClose={() => setRepeatDialog(false)}
        onRepeat={handleRepeatCustomization}
        onChooseNew={handleNewCustomization}
      />

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

      {editCustomizationModal && cartItem && (
        <EditCustomization
          cartItemId={cartItemId}
          productSlug={cartItem.slug}
          storeId={storeId || cartItem.store_id}
          catalogId={catalogId || ""}
          productPrice={cartItem.product?.price || productPrice || cartItem.unit_price}
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
    gap: 6,
  },
  loaderContainer: {
    width: 80,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "#fff",
    height: 32,
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
  },
  quantitySign: {
    fontSize: 16,
    color: "red",
    fontWeight: "500",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "red",
    minWidth: 24,
    textAlign: "center",
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
    height: 24,
  },
  editButtonText: {
    color: "#f14343",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
});