import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useCartStore } from "../../state/useCartStore";
import useUserDetails from "../../hook/useUserDetails";
import { useToast } from "react-native-toast-notifications";
import CustomizationGroup from "../ProductDetails/CustomizationGroup";
import { removeCartItems } from "@/state/removeCartItems";

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
  max,
  instock = true,
  customizable = false,
  customGroupIds = [],
  productPrice,
  onQtyChange,
}) => {
  const { updateQty } = useCartStore();
  const { userDetails } = useUserDetails();
  const authToken = userDetails?.accessToken;
  const toast = useToast();

  const [count, setCount] = useState(qty);
  const [loading, setLoading] = useState(false);
  const [repeatDialog, setRepeatDialog] = useState(false);
  const [customizationModal, setCustomizationModal] = useState(false);

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
        if (success) {
          setCount(0);
          onQtyChange?.(0);
        } else {
          toast.show("Failed to remove item", { type: "danger" });
        }
      } else {
        const success = await updateQty(cartItemId, newQty, authToken);
        if (success) {
          setCount(newQty);
          onQtyChange?.(newQty);
        } else {
          toast.show("Failed to update quantity", { type: "danger" });
          setCount(qty);
        }
      }
    } catch (err) {
      console.error("Error updating qty:", err);
      toast.show("Error updating cart", { type: "danger" });
      setCount(qty);
    } finally {
      setLoading(false);
    }
  };

  const increment = () => {
    if (max && count >= max) {
      toast.show("Max quantity reached", { type: "warning" });
      return;
    }
    if (customizable) {
      setRepeatDialog(true);
    } else {
      handleUpdate(count + 1);
    }
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#f14343" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={decrement} disabled={loading}>
          <Text style={styles.sign}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{count}</Text>
        <TouchableOpacity onPress={increment} disabled={loading || !instock}>
          <Text style={styles.sign}>+</Text>
        </TouchableOpacity>
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
            <Text style={styles.dialogTitle}>Repeat previous customization?</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.outlineButton]}
                onPress={handleNewCustomization}
              >
                <Text style={styles.outlineButtonText}>Ill choose</Text>
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

      {/* Customization Modal */}
      <Modal
        visible={customizationModal}
        animationType="slide"
        onRequestClose={() => setCustomizationModal(false)}
      >
        <CustomizationGroup
          customizable={true}
          customGroup={customGroupIds}
          vendorId={storeId || ""}
          price={productPrice || 0}
          itemId={catalogId || ""}
          maxLimit={max || 5}
          closeFilter={() => setCustomizationModal(false)}
        />
      </Modal>
    </>
  );
};

export default ChangeQtyButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
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
    marginBottom: 20,
    textAlign: "center",
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