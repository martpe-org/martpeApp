import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onRepeat: () => void;
  onChooseNew: () => void;
}

const RepeatCustomizationDialog: React.FC<Props> = ({ visible, onClose, onRepeat, onChooseNew }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>Add another item with customization?</Text>
          <Text style={styles.dialogSubtitle}>
            Repeat will use the same customizations. I will choose will let you create a new customized item.
          </Text>
          <View style={styles.dialogButtons}>
            <TouchableOpacity style={[styles.dialogButton, styles.outlineButton]} onPress={onChooseNew}>
              <Text style={styles.outlineButtonText}>I will choose</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogButton, styles.primaryButton]} onPress={onRepeat}>
              <Text style={styles.primaryButtonText}>Repeat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RepeatCustomizationDialog;

const styles = StyleSheet.create({
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
