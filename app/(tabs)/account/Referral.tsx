import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import useUserDetails from "@/hook/useUserDetails";
import { fetchReferrals } from "@/components/referral/fetch-refs";
import ImageComp from "@/components/common/ImageComp";
import Loader from "@/components/common/Loader";
import { normalizeStoreData } from "@/components/Landing-Page/render";

type ReferralPayment = {
  id: string;
  store: any;
  referrals: number;
  inProcessCount: number;
  pendingPayout: number;
  totalearned: number;
};

export default function ReferralsScreen() {
  const { authToken, isAuthenticated, isLoading: userLoading } =
    useUserDetails();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralPayment[]>([]);
  const [canWithdraw, setCanWithdraw] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (userLoading) return;

      if (!isAuthenticated || !authToken) {
        router.replace("/");
        return;
      }

      try {
        const data = await fetchReferrals(authToken);

        if (data) {
          const transformed = data.map((ref: any) => {
            return {
              id: ref._id,
              store: ref.store,
              referrals: ref.referrals.length,
              inProcessCount: ref.referrals.filter(
                (p: any) =>
                  p.status === "in-process" &&
                  p.order.settlement_status === "settled"
              ).length,
              pendingPayout: ref.referrals
                .filter(
                  (p: any) =>
                    p.status === "in-process" &&
                    p.order.settlement_status === "settled"
                )
                .reduce((a: number, b: any) => a + b.amount, 0),
              totalearned: ref.referrals.reduce(
                (a: number, b: any) => a + b.amount,
                0
              ),
            };
          });

          setReferrals(transformed);
          setCanWithdraw(
            transformed.reduce((a, b) => a + b.pendingPayout, 0)
          );
        }
      } catch (err) {
        console.error("Error loading referrals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userLoading, isAuthenticated, authToken]);

  if (loading || userLoading) {
    return (
      <View style={styles.center}>
        <Loader />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My referrals</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                canWithdraw < 100 && styles.disabledButton,
              ]}
              disabled={canWithdraw < 100}
            >
              <Text style={styles.withdrawText}>Withdraw earnings</Text>
            </TouchableOpacity>

            {canWithdraw < 100 && (
              <View>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="gray"
                  style={{ marginLeft: 8 }}
                  onPress={() => setShowTooltip(!showTooltip)}
                />
                {showTooltip && (
                  <View style={styles.tooltipBox}>
                    <Text style={styles.tooltipText}>
                      You can withdraw your earnings once the total pending
                      payout is ₹100 or more.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {referrals.map((ref) => {
          const normalized = normalizeStoreData(ref.store);

          return (
            <View key={ref.id} style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/home/result/productListing/[id]",
                    params: { id: normalized?.slug },
                  })
                }
                style={styles.cardHeader}
              >
                <ImageComp
                  source={normalized.symbol}
                  imageStyle={styles.image}
                  fallbackSource={{
                    uri: "https://via.placeholder.com/150?text=Store",
                  }}
                />
                <View>
                  <Text style={styles.storeName}>{normalized.name}</Text>
                  <Text style={styles.storeAddress}>
                    {normalized.address?.street}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Referrals</Text>
                  <Text style={styles.statValue}>{ref.inProcessCount}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Pending payout</Text>
                  <Text style={styles.statValue}>₹{ref.pendingPayout}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total earned</Text>
                  <Text style={styles.statValue}>₹{ref.totalearned}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flexGrow: 1, padding: 16 },
  center: { flexGrow: 1, justifyContent: "center", alignItems: "center" },

  // top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#353535",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },

  withdrawButton: {
    backgroundColor: "#65A30D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  withdrawText: { color: "white", fontSize: 14 },
  disabledButton: { opacity: 0.5 },

  // Tooltip box
  tooltipBox: {
    position: "absolute",
    top: 30, // just below the icon
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    width: 220,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  tooltipText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  image: { height: 48, width: 48, borderRadius: 6, marginRight: 8 },
  storeName: { fontSize: 16, fontWeight: "500" },
  storeAddress: { fontSize: 12, color: "gray" },
  cardStats: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 12, color: "gray" },
  statValue: { fontSize: 16, fontWeight: "600" },
});
