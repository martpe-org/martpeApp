import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { format } from '@formkit/tempo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FetchOrderDetailType } from '@/components/order/fetch-order-detail-type';
import { fetchOrderDetail } from '@/components/order/fetch-order-detail';
import ImageComp from '@/components/common/ImageComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from './[orderId]Styles'


export default function OrderDetails() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  
  const [orderDetail, setOrderDetail] = useState<FetchOrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrderDetail = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem('auth-token');
      if (!authToken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }

      const detail = await fetchOrderDetail(authToken, orderId);
      
      if (!detail) {
        throw new Error('Failed to fetch order details');
      }
      
      setOrderDetail(detail);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const handleRefresh = () => {
    loadOrderDetail(true);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => {
          // Implement cancel order logic here
          console.log('Cancel order:', orderId);
        }},
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
      case 'initiated':
      case 'confirmed':
        return { label: 'Confirmed', backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'accepted':
        return { label: 'Confirmed', backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'in-progress':
        return { label: 'In Progress', backgroundColor: '#fed7aa', color: '#ea580c' };
      case 'completed':
        return { label: 'Completed', backgroundColor: '#d1fae5', color: '#059669' };
      case 'cancelled':
        return { label: 'Cancelled', backgroundColor: '#fee2e2', color: '#dc2626' };
      default:
        return { label: 'Pending', backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };

  const getDeliveryStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { label: 'Pending', backgroundColor: '#fef3c7', color: '#d97706' };
      case 'confirmed':
        return { label: 'Confirmed', backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'in-progress':
        return { label: 'In Progress', backgroundColor: '#fed7aa', color: '#ea580c' };
      case 'delivered':
        return { label: 'Delivered', backgroundColor: '#d1fae5', color: '#059669' };
      default:
        return { label: 'Pending', backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          <Text style={styles.errorText}>Failed to load order details</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadOrderDetail()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatusConfig = getStatusConfig(orderDetail.status);
  const deliveryStatusConfig = getDeliveryStatusConfig(orderDetail.fulfillment.status);

  const formattedOrderDate = format({
    date: orderDetail.createdAt,
    format: 'MMMM D, YYYY h:mm a',
    tz: 'Asia/Kolkata',
  });

  const formattedDeliveryDate = format({
    date: orderDetail.createdAt,
    format: 'MMM D, YYYY, h:mm A',
    tz: 'Asia/Kolkata',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView>
        {/* Store Header */}
        <View style={styles.header}>
          <View style={styles.storeInfo}>
            <ImageComp
              source={{ uri: orderDetail.store.symbol || 'https://via.placeholder.com/60' }}
              style={styles.storeLogo}
              resizeMode="cover"
            />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{orderDetail.store.name}</Text>
              <Text style={styles.storeAddress}>
                {orderDetail.store.address.street && `${orderDetail.store.address.street}, `}
                {orderDetail.store.address.locality && `${orderDetail.store.address.locality}, `}
                {orderDetail.store.address.city}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoSection}>
          <Text style={styles.orderNumber}>Order #: {orderDetail.orderno}</Text>
          <Text style={styles.orderDate}>Order Placed On: {formattedOrderDate}</Text>
          <Text style={styles.deliveryDate}>Expected delivery at: {formattedDeliveryDate}</Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Order Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: orderStatusConfig.backgroundColor }]}>
                <Text style={[styles.statusText, { color: orderStatusConfig.color }]}>
                  {orderStatusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Delivery Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: deliveryStatusConfig.backgroundColor }]}>
                <Text style={[styles.statusText, { color: deliveryStatusConfig.color }]}>
                  {deliveryStatusConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.refreshButton]} onPress={handleRefresh}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.refreshButtonText}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>

            {orderDetail.cancellable && (
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelOrder}>
                <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>Delivery details</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.customerName}>{orderDetail.delivery_address.name}</Text>
            <Text style={styles.phoneNumber}>{orderDetail.delivery_address.phone}</Text>
            <Text style={styles.address}>
              {orderDetail.delivery_address.houseNo}, {orderDetail.delivery_address.street}, {orderDetail.delivery_address.city}, {orderDetail.delivery_address.state}, {orderDetail.delivery_address.pincode}
            </Text>
            <Text style={styles.deliveryCategory}>Category: Immediate Delivery</Text>
            <Text style={styles.deliveryProvider}>Delivery provider: {orderDetail.store.name}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>Order summary</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total</Text>
            <Text style={styles.summaryValue}>₹{orderDetail.sub_total.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform fee</Text>
            <Text style={styles.summaryValue}>₹ 0.00</Text>
          </View>

          {orderDetail.breakup.map((item, index) => {
            if (item.title && item.title.toLowerCase().includes('delivery')) {
              return (
                <View key={index} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery charges</Text>
                  <Text style={styles.summaryValue}>₹ {item.price.toFixed(2)}</Text>
                </View>
              );
            }
            return null;
          })}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Restaurant charges</Text>
            <Text style={styles.summaryValue}>₹ 0.00</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{orderDetail.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Ordered Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>Ordered Items</Text>
          </View>

          {orderDetail.order_items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemBrand}>
                  <ImageComp
                    source={{ uri: orderDetail.store.symbol || 'https://via.placeholder.com/40' }}
                    style={styles.itemLogo}
                    resizeMode="cover"
                  />
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemBrandName}>1 unit</Text>
                    <Text style={styles.itemNote}>Thank you for Digital Order</Text>
                  </View>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>x {item.order_qty}</Text>
                  <Text style={styles.itemPrice}>₹{item.total_price}</Text>
                </View>
              </View>

              {item.customizations && item.customizations.length > 0 && (
                <TouchableOpacity style={styles.customizationButton}>
                  <Text style={styles.customizationText}>View Customisation Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


