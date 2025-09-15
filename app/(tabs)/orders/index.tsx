// import React, { useRef, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { FlashList } from "@shopify/flash-list";
// import { BackArrow } from "../../../constants/icons/commonIcons";
// import { useRouter } from "expo-router";
// import { widthPercentageToDP } from "react-native-responsive-screen";
// import LottieView from "lottie-react-native";
// import { useOrderStore } from "../../../state/useOrderStore";
// import OrderCard from "../../../components/OrderStatus/OrderCard";

// type OrderStatus = "live" | "delivered" | "cancelled";

// const Orders = () => {
//   const router = useRouter();
//   const animation = useRef(null);
//   const [filter, setFilter] = useState<OrderStatus>("live");
//   const [isLoading, setIsLoading] = useState(true);
//   const allOrders = useOrderStore((state) => state.allOrders);

//   // Filter orders safely
//   const filteredOrders = React.useMemo(() => {
//     try {
//       if (!Array.isArray(allOrders)) return [];
      
//       return allOrders.filter((order) => {
//         if (!order?.order_status) return false;
        
//         const status = order.order_status.toLowerCase();
        
//         switch (filter) {
//           case "delivered":
//             return status === "completed";
//           case "cancelled":
//             return status === "cancelled";
//           default: // "live"
//             return status !== "completed" && status !== "cancelled";
//         }
//       }).reverse(); // Newest first
//     } catch (error) {
//       console.error("Error filtering orders:", error);
//       return [];
//     } finally {
//       setIsLoading(false);
//     }
//   }, [allOrders, filter]);

//   // Loading state
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#FF5151" />
//       </View>
//     );
//   }

//   // Empty state
//   if (!allOrders || allOrders.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <View style={styles.emptyHeader}>
//         </View>

//         <View style={styles.animationContainer}>
//           <LottieView
//             autoPlay
//             ref={animation}
//             style={styles.lottie}
//             source={require("../../../assets/lottiefiles/empty_orders.json")}
//           />
//         </View>

//         <View style={styles.emptyTextContainer}>
//           <Text style={styles.emptyText}>No Orders found!</Text>
//         </View>

//         <TouchableOpacity
//           onPress={() => router.push("../(tabs)/home")}
//           style={styles.shoppingButton}
//         >
//           <Text style={styles.shoppingButtonText}>Start Shopping</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Filter empty state
//   const getEmptyFilterMessage = () => {
//     switch (filter) {
//       case "cancelled":
//         return "You haven't cancelled any orders yet :)";
//       case "delivered":
//         return "Looking forward to your first delivery!";
//       default:
//         return "No live orders?\nBrowse our products and fill your cart today!";
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.title}>
//           <BackArrow onPress={router.back} />
//           <Text style={styles.titleText}>Your Order(s)</Text>
//         </View>
        
//         <View style={styles.filters}>
//           {(["live", "delivered", "cancelled"] as OrderStatus[]).map((f) => (
//             <TouchableOpacity
//               key={f}
//               style={[
//                 styles.filter,
//                 filter === f && styles.activeFilter,
//               ]}
//               onPress={() => setFilter(f)}
//             >
//               <Text style={[styles.text, filter === f && styles.activeText]}>
//                 {f.toUpperCase()}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {filteredOrders.length === 0 ? (
//         <View style={styles.noOrdersContainer}>
//           <Text style={styles.noOrdersText}>{getEmptyFilterMessage()}</Text>
//         </View>
//       ) : (
//         <FlashList
//           data={filteredOrders}
//           renderItem={({ item }) => <OrderCard order={item} />}
//           estimatedItemSize={83}
//           keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#e9ecef",
//     paddingTop: 120,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingBottom: 30,
//   },
//   emptyHeader: {
//     backgroundColor: "#fff",
//     width: widthPercentageToDP(100),
//     alignItems: "center",
//     paddingVertical: 20,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
//   emptyHeaderText: {
//     fontSize: 30,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   animationContainer: {
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },
//   lottie: {
//     width: widthPercentageToDP("90"),
//     backgroundColor: "#fff",
//   },
//   emptyTextContainer: {
//     height: 50,
//     alignItems: "center",
//   },
//   emptyText: {
//     color: "#909095",
//     fontWeight: "600",
//     fontSize: 20,
//   },
//   shoppingButton: {
//     backgroundColor: "#e73434",
//     width: widthPercentageToDP("90"),
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 50,
//     alignItems: "center",
//   },
//   shoppingButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 20,
//   },
//   title: {
//     backgroundColor: "white",
//     paddingHorizontal: 20,
//     paddingTop: 15,
//     paddingBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 20,
//   },
//   titleText: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   header: {
//     position: "absolute",
//     top: 0,
//     width: "100%",
//     zIndex: 100,
//     backgroundColor: "white",
//   },
//   filters: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 81, 81, 0.15)",
//     margin: 12,
//     borderRadius: 10,
//   },
//   filter: {
//     flex: 1,
//     padding: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeFilter: {
//     backgroundColor: "#FF5151",
//     borderRadius: 10,
//   },
//   activeText: {
//     color: "white",
//   },
//   text: {
//     fontSize: 12,
//     letterSpacing: 1,
//     fontWeight: "500",
//     color: "black",
//   },
//   noOrdersContainer: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 40,
//   },
//   noOrdersText: {
//     fontSize: 18,
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
// });

// export default Orders;


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BackArrow } from '@/constants/icons/tabIcons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  return (
<SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
  {/* Back Arrow at top-left */}
  <BackArrow
    onPress={() => router.back()}
    style={{ position: "absolute", top: 30, left: 15 }}
  />

  {/* Centered Text */}
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 22, color: "red", fontWeight: "bold" }}>
      No orders yet
    </Text>
  </View>
</SafeAreaView>


  )
}

export default index;