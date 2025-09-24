// AddNewAddress.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/address/AddressHeader";
import { createAddress } from "../../components/address/createAddress";
import Type from "../../components/address/type";
import useUserDetails from "../../hook/useUserDetails";

interface AddressInput {
  type: "Home" | "Work" | "FriendsAndFamily" | "Other";
  name: string;
  phone: string;
  gps: {
    lat: number;
    lon: number;
  };
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  building?: string;
  landmark: string;
  directions: string;
}

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "phone-pad";
  multiline?: boolean;
}

const AddNewAddress: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { userDetails, getUserDetails } = useUserDetails();
  const [authToken, setAuthToken] = useState<string>("");

  const [addressInput, setAddressInput] = useState<AddressInput>({
    type: "Home",
    name: "",
    phone: "",
    gps: { lat: 0, lon: 0 },
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    building: "",
    landmark: "",
    directions: "",
  });

  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const details = await getUserDetails();
      if (details?.accessToken) {
        setAuthToken(details.accessToken);
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (userDetails) {
      setAddressInput((prev) => ({
        ...prev,
        phone: userDetails.phoneNumber || "",
        name: userDetails.firstName || "",
      }));
    }
  }, [userDetails]);

  const handleInputChange = (field: string, value: any) => {
    setAddressInput((prevInput) => ({ ...prevInput, [field]: value }));
  };

  const validateInputs = (): boolean => {
    const errors: string[] = [];

    if (!addressInput.type) errors.push("Please select an address type");
    if (!addressInput.name.trim()) errors.push("Name is required");
    if (!addressInput.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(addressInput.phone)) {
      errors.push("Phone number must be 10 digits");
    }
    if (!addressInput.street.trim()) errors.push("Street address is required");
    if (!addressInput.city.trim()) errors.push("City is required");
    if (!addressInput.state.trim()) errors.push("State is required");
    if (!addressInput.pincode.trim()) {
      errors.push("Pincode is required");
    } else if (!/^\d{6}$/.test(addressInput.pincode)) {
      errors.push("Pincode must be 6 digits");
    }

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateInputs()) return;

    if (!authToken) {
      Alert.alert("Error", "Authentication token is missing. Please login again.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createAddress(
        authToken,
        addressInput.type,
        addressInput.name,
        addressInput.phone,
        addressInput.gps,
        addressInput.houseNo,
        addressInput.street,
        addressInput.city,
        addressInput.state,
        addressInput.pincode,
        addressInput.building
      );

      if (result) {
        Alert.alert("Success", "Address added successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Failed to add address. Please try again.");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getLocation = async () => {
    setCurrentLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to use current location");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = currentLocation.coords;
      await getCityName(latitude, longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Failed to fetch current location");
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  const getCityName = async (latitude: number, longitude: number) => {
    const apiKey = "t7wBcKS6d2rJ9ZLDFCZt4rGOwBhqP_9QFJE8rfxuVdk";
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${apiKey}`;

    try {
      const response = await axios.get(url);
      const addressData = response?.data?.items?.[0]?.address;

      if (addressData) {
        setAddressInput((prev) => ({
          ...prev,
          houseNo: addressData.houseNumber || "",
          street: addressData.street || "",
          city: addressData.city || "",
          state: addressData.state || "",
          pincode: addressData.postalCode || "",
          landmark: addressData.district || "",
          gps: { lat: latitude, lon: longitude },
        }));
      }
    } catch (error) {
      console.error("Error during geocoding:", error);
      Alert.alert("Error", "Failed to get address from location");
    }
  };

  const handleTypeChange = (value: string) => {
    let apiValue: "Home" | "Work" | "FriendsAndFamily" | "Other";
    switch (value) {
      case "Friends & Family":
        apiValue = "FriendsAndFamily";
        break;
      case "Home":
        apiValue = "Home";
        break;
      case "Work":
        apiValue = "Work";
        break;
      default:
        apiValue = "Other";
        break;
    }

    setAddressInput((prev) => ({ ...prev, type: apiValue }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#01884B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Add New Address" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Address Type <Text style={styles.required}>*</Text></Text>
            <Type saveAs={handleTypeChange} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <InputField placeholder="Full Name" value={addressInput.name} onChangeText={(value) => handleInputChange("name", value)} required />
            <InputField placeholder="Phone Number" value={addressInput.phone} onChangeText={(value) => handleInputChange("phone", value)} keyboardType="phone-pad" required />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            <InputField placeholder="House/Flat No." value={addressInput.houseNo} onChangeText={(value) => handleInputChange("houseNo", value)} />
            <InputField placeholder="Street Address" value={addressInput.street} onChangeText={(value) => handleInputChange("street", value)} required />
            <InputField placeholder="Building/Apartment (Optional)" value={addressInput.building || ""} onChangeText={(value) => handleInputChange("building", value)} />
            <InputField placeholder="Landmark" value={addressInput.landmark} onChangeText={(value) => handleInputChange("landmark", value)} />
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <InputField placeholder="City" value={addressInput.city} onChangeText={(value) => handleInputChange("city", value)} required />
              </View>
              <View style={styles.halfWidth}>
                <InputField placeholder="Pincode" value={addressInput.pincode} onChangeText={(value) => handleInputChange("pincode", value)} keyboardType="numeric" required />
              </View>
            </View>
            <InputField placeholder="State" value={addressInput.state} onChangeText={(value) => handleInputChange("state", value)} required />
            <InputField placeholder="Directions to reach (Optional)" value={addressInput.directions} onChangeText={(value) => handleInputChange("directions", value)} multiline />
            <TouchableOpacity onPress={getLocation} style={styles.currentLocationButton}>
              {currentLocationLoading ? (
                <ActivityIndicator size="small" color="#01884B" />
              ) : (
                <>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#01884B" />
                  <Text style={styles.currentLocationText}>
                    {currentLocationLoading ? "Getting location..." : "Use current location"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleAddAddress} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <MaterialCommunityIcons name="content-save" size={20} color="#fff" />}
            <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save Address"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  required = false,
  keyboardType = "default",
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>
      {placeholder}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TextInput
      placeholder={`Enter ${placeholder.toLowerCase()}`}
      style={[styles.inputField, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      placeholderTextColor="#999"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContainer: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  contentContainer: { padding: 16 },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 16 },
  required: { color: "#E74C3C", fontSize: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 8 },
  inputField: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  multilineInput: { height: 80, textAlignVertical: "top" },
  rowContainer: { flexDirection: "row", gap: 12 },
  halfWidth: { flex: 1 },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8F5",
    borderWidth: 1,
    borderColor: "#01884B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  currentLocationText: { fontSize: 14, fontWeight: "600", color: "#01884B", marginLeft: 8 },
  saveButton: {
    backgroundColor: "#01884B",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#01884B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: { backgroundColor: "#ccc", shadowOpacity: 0, elevation: 0 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});

export default AddNewAddress;
