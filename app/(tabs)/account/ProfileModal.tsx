import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { styles } from "./ProfileStyles";
import { Toast } from "react-native-toast-notifications";

interface ProfileModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    countryCode: string;
    gender: string;
  };
  setFormData: (data: any) => void;
  handleSaveChanges: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  modalVisible,
  setModalVisible,
  formData,
  setFormData,
  handleSaveChanges,
}) => {


  const handleSaveWithToast = () => {
    handleSaveChanges();
    Toast.show(
      "User updated successfully",
      { duration: 2000 }
    );
  };


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Make changes to your profile here. Click save when you are done.
          </Text>

          <ScrollView style={styles.modalForm}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                placeholder="First Name"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                placeholder="Last Name"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Password"
                secureTextEntry
              />
            </View>

            {/* Country Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country Code</Text>
              <TextInput
                style={styles.input}
                value={formData.countryCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, countryCode: text })
                }
                placeholder="+91"
                keyboardType="phone-pad"
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, gender: "Male" })}
                >
                  <View style={styles.radioCircle}>
                    {formData.gender === "Male" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, gender: "Female" })
                  }
                >
                  <View style={styles.radioCircle}>
                    {formData.gender === "Female" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Female</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setFormData({ ...formData, gender: "Others" })
                  }
                >
                  <View style={styles.radioCircle}>
                    {formData.gender === "Others" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Others</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Save Button with Toast */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveWithToast}
          >
            <Text style={styles.saveButtonText}>Save changes</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfileModal;