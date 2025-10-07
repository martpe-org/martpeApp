import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import useUserDetails from "../../../hook/useUserDetails";
import { router } from "expo-router";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProfileModal from "./ProfileModal";
import { styles } from "./ProfileStyles";

const Profile = () => {
  const { removeUserDetails, userDetails, getUserDetails } = useUserDetails();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    countryCode: "",
    gender: "",
  });

  useEffect(() => {
    getUserDetails();
  });

  useEffect(() => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
        email: userDetails.email || "",
        password: "", // Keep password empty for security
        countryCode: userDetails.countryCode || "",
        gender: userDetails.gender || "",
      });
    }
  }, [userDetails]); // Only run when userDetails changes

  const handleLogout = async () => {
    await removeUserDetails();
    router.replace("/(auth)");
  };

  const handleSaveChanges = async () => {
    await getUserDetails(); // Refresh user details
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileBox}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Fontisto name="person" style={styles.avatar} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {userDetails?.firstName ?? "User"}
              </Text>
              <Text style={styles.phone}>{userDetails?.phoneNumber}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setModalVisible(true)}
              >
                <Feather name="edit-2" size={14} color="#4A90E2" />
                <Text style={styles.editText}>EDIT PROFILE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Referrals */}
        <TouchableOpacity
          style={styles.referralCard}
          onPress={() => router.push("/(tabs)/account/Referral")}
        >
          <View style={styles.referralLeft}>
            <View style={styles.referralIcon}>
              <MaterialIcons name="card-giftcard" size={24} color="#FFB800" />
            </View>
            <Text style={styles.referralText}>Referrals</Text>
          </View>
          <AntDesign name="right" size={15} color="#999" />
        </TouchableOpacity>

        {/* ACCOUNT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="bag-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>Order History</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="chatbox-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>Complaints</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/(tabs)/account/wishlist")}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="heart-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>Favourites</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>
        </View>

        {/* SETTINGS & HELP Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS & HELP</Text>

          <TouchableOpacity style={styles.listItem}
           onPress={() => router.push("/terms-and-conditions")}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>Terms & Conditions</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/(tabs)/account/ContactUs")}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="headset-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>Contact Us</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/(tabs)/account/Faqs")}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.listItemText}>FAQs</Text>
            </View>
            <AntDesign name="right" size={15} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <ProfileModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        formData={formData}
        setFormData={setFormData}
        handleSaveChanges={handleSaveChanges}
      />
    </SafeAreaView>
  );
};

export default Profile;