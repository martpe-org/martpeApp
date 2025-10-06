import { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import useUserDetails from "../../../hook/useUserDetails";
import { router } from "expo-router";
import Fontisto from "@expo/vector-icons/Fontisto";

const Profile = () => {
  const { removeUserDetails, userDetails, getUserDetails } = useUserDetails();

  useEffect(() => {
    getUserDetails();
  }, []);

  const handleLogout = async () => {
    await removeUserDetails();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileBox}>
          <View style={styles.avatarAndGreeting}>
            <Fontisto name="person" style={styles.avatar} />
            <Text style={styles.greeting}>
              Hey{"\n"}
              <Text style={styles.name}>
                {userDetails?.firstName ?? "User"}
              </Text>
              !
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                color: "red",
                marginTop: 6,
              }}
            >
              What are you shopping for today?
            </Text>
          </View>

          {/* Profile Details Always Visible */}
          <View style={styles.profileDetails}>
            <Text style={styles.profileLabel}>Profile Details</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>Full Name:</Text>
              <Text>
                {userDetails?.firstName} {userDetails?.lastName}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>Phone:</Text>
              <Text>{userDetails?.phoneNumber}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailTitle}>Email:</Text>
              <Text>{userDetails?.email}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Text style={styles.gridText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push("/(tabs)/account/wishlist")}
          >
            <Text style={styles.gridText}>My Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton}>
            <Text style={styles.gridText}>My Complaints</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push("/(tabs)/account/Faqs")}
          >
            <Text style={styles.gridText}>FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push("/(tabs)/account/ContactUs")}
          >
            <Text style={styles.gridText}>Contact us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push("/(tabs)/account/Referral")}
          >
            <Text style={styles.gridText}>Referral</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { padding: 16 },
  profileBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
  },
  avatarAndGreeting: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#f0f0f0",
    fontSize: 50,
    borderRadius: 50,
    padding: 20,
    color: "#555",
    marginBottom: 8,
  },
  greeting: { textAlign: "center", fontSize: 18, color: "#666" },
  name: { fontWeight: "bold", fontSize: 20, color: "#000" },
  profileDetails: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  profileLabel: { fontWeight: "bold", fontSize: 16, marginBottom: 12 },
  detailItem: {
    marginBottom: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailTitle: { fontWeight: "600", fontSize: 13, color: "#333" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridButton: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  gridText: { fontWeight: "600", fontSize: 14 },
  logoutButton: { backgroundColor: "#000" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
