import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { prettifyTemporalDuration } from "@/utility/CheckoutUtils";
import { BillSummary } from "./BillSummary";
import { CancellationPolicy } from "./CancellationPolicy";
import { styles } from "./CheckoutSectionStyles";

interface CheckoutSectionsProps {
  data: any;
  cart: any;
  store: any;
  items: any[];
  fulfillments: any[];
  selectedFulfillmentId: string;
  selectedBreakup: any;
  hasOutOfStockItems: boolean;
  subTotal: number;
  onFulfillmentSelect: (id: string) => void;
  onBreakupPress: (breakup: any) => void;
  onQuantityChange: (itemId: string, newQty: number) => void; // ✅ Add this prop
}

export const CheckoutSections: React.FC<CheckoutSectionsProps> = ({
  data,
  cart,
  store,
  items,
  fulfillments,
  selectedFulfillmentId,
  selectedBreakup,
  hasOutOfStockItems,
  subTotal,
  onFulfillmentSelect,
  onBreakupPress,
  onQuantityChange, // ✅ Add this prop
}) => {
  const formatCurrency = (amt: number) =>
    `₹${amt.toFixed(2).replace(/\.?0+$/, "")}`;
  const router = useRouter();

  // ✅ Quantity control component
  const QuantityControls = ({ item }: { item: any }) => (
    <View style={styles.quantityControls}>
      <TouchableOpacity
        style={[
          styles.quantityButton,
          item.cart_qty <= 1 && styles.quantityButtonDisabled, // ✅ Disable at quantity 1
        ]}
        onPress={() => onQuantityChange(item.id, item.cart_qty - 1)}
        disabled={item.cart_qty <= 1} // ✅ Disable decrement at 1
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="remove"
          size={18}
          color={item.cart_qty <= 1 ? "#ccc" : "red"}
        />
      </TouchableOpacity>

      <Text style={styles.quantityText}>{item.cart_qty}</Text>

      <TouchableOpacity
        style={styles.quantityButton}
        onPress={() => onQuantityChange(item.id, item.cart_qty + 1)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={18} color="red" />
      </TouchableOpacity>
    </View>
  );

  const renderStoreSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Store Details</Text>
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => {
          const slug = store?.slug || cart?.store?.slug;
          if (slug) {
            router.push(`/(tabs)/home/result/productListing/${slug}`);
          }
        }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: cart.store.symbol }}
          style={styles.storeImage}
          resizeMode="cover"
        />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{cart.store.name}</Text>
          <Text style={styles.storeAddress} numberOfLines={2}>
            {cart.store.address.street}, {cart.store.address.locality},{" "}
            {cart.store.address.city}, {cart.store.address.state} -{" "}
            {cart.store.address.area_code}
          </Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
      </TouchableOpacity>
    </View>
  );

  const renderAddressSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {/* <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/address/savedAddresses")}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#666" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.addressCard}>
        <Text style={styles.addressName}>{data.address.name}</Text>
        <Text style={styles.addressText}>
          {data.address.houseNo}, {data.address.street}, {data.address.city},{" "}
          {data.address.state} - {data.address.pincode}
        </Text>
        <Text style={styles.addressPhone}>📞 {data.address.phone}</Text>
      </View>
    </View>
  );

  const renderItemsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={`${item.id}-${index}`}
            style={styles.itemCard}
            onPress={() =>
              router.push(
                `/(tabs)/home/result/productDetails/${item.product.slug}`
              )
            }
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.product.symbol }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.itemPrice}>
                Unit: {formatCurrency(item.unit_price || 0)}
              </Text>
              <Text style={styles.itemTotalPrice}>
                Total: {formatCurrency(item.total_price || 0)}
              </Text>
              {item.product.variant_info && (
                <Text style={styles.variantText}>
                  {item.product.variant_info}
                </Text>
              )}
              {item.selected_customizations &&
                item.selected_customizations.length > 0 && (
                  <Text style={styles.customizationsText}>
                    Customizations:{" "}
                    {item.selected_customizations.map((c:any) => c.name).join(", ")}
                  </Text>
                )}
            </View>
            <View style={styles.itemPriceContainer}>
              {!item.instock ? (
                <MaterialIcons name="error" size={20} color="#e74c3c" />
              ) : (
                <QuantityControls item={item} /> // ✅ Add quantity controls
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFulfillmentSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Options</Text>
      <View style={styles.fulfillmentContainer}>
        {fulfillments.map((fulfillment: any) => (
          <TouchableOpacity
            key={fulfillment.id}
            style={[
              styles.fulfillmentOption,
              selectedFulfillmentId === fulfillment.id &&
                styles.selectedFulfillment,
            ]}
            onPress={() => onFulfillmentSelect(fulfillment.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.radio,
                selectedFulfillmentId === fulfillment.id &&
                  styles.radioSelected,
              ]}
            >
              {selectedFulfillmentId === fulfillment.id && (
                <View style={styles.radioInner} />
              )}
            </View>
            <View style={styles.fulfillmentDetails}>
              <Text style={styles.fulfillmentText}>{fulfillment.category}</Text>
              <Text style={styles.fulfillmentTime}>
                Est. Delivery:{" "}
                {prettifyTemporalDuration(fulfillment.tat || "P0D")}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOutOfStockSection = () =>
    hasOutOfStockItems && (
      <View style={styles.outOfStockSection}>
        <MaterialIcons name="warning" size={24} color="#f39c12" />
        <View style={styles.outOfStockContent}>
          <Text style={styles.outOfStockTitle}>Items Unavailable</Text>
          <Text style={styles.outOfStockMessage}>
            Some items in your cart are out of stock. Please remove them to
            continue with your order.
          </Text>
        </View>
      </View>
    );

  return (
    <>
      {renderStoreSection()}
      {renderAddressSection()}
      {renderItemsSection()}
      {renderFulfillmentSection()}

      <View style={styles.section}>
        <BillSummary
          subTotal={subTotal}
          breakups={selectedBreakup.breakups}
          totalSavings={selectedBreakup.total_savings}
          grandTotal={selectedBreakup.total}
          onBreakupPress={onBreakupPress}
        />
      </View>

      <View style={styles.section}>
        <CancellationPolicy isCancellable />
      </View>

      {renderOutOfStockSection()}
    </>
  );
};
