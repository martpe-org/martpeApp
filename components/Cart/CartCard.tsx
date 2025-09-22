import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CartItemType,
  FetchCartStore,
  FetchCartType,
} from "../../app/(tabs)/cart/fetch-carts-type";
import { useCartStore } from "../../state/useCartStore";
import CartItems from "./CartItems";
import CartOfferBtn from "./CartOfferBtn";
import CartStoreHeader from "./CartStoreHeader";

interface CartCardProps {
  id: string;
  store: FetchCartStore;
  items: CartItemType[];
  onCartChange?: () => void;
}

const CartCard: React.FC<CartCardProps> = ({
  id,
  store,
  items,
  onCartChange,
}) => {
  const { updateCartOffer, clearCartOffer, appliedOffers } = useCartStore();

  const [validItems, setValidItems] = useState<CartItemType[]>([]);
  const [appliedOfferId, setAppliedOfferId] = useState<string>("");
  const [offersOpen, setOffersOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Restore previously applied offer (if any) for this cart
  useEffect(() => {
    const existing = appliedOffers[id]?.offerId;
    if (existing) setAppliedOfferId(existing);
  }, [id, appliedOffers]);

  // Filter items with valid IDs
  useEffect(() => {
    const filtered = items?.filter((item) => item && item._id) || [];
    setValidItems(filtered);
  }, [items]);

  // ✅ Only available items (instock) will be used for totals/checkout
  const availableItems = validItems.filter((item) => item.product?.instock);

  // Calculate prices & discount using only available items
  const cartSubtotal = availableItems.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  const offer = store?.offers?.find((o) => o.offer_id === appliedOfferId);

  const qualifierMin = Number(offer?.qualifier?.min_value ?? 0);
  const meetsMin = cartSubtotal >= qualifierMin;

  let computedDiscount = 0;
  if (offer && meetsMin) {
    const valueType = offer?.benefit?.value_type;
    const rawPercent = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.percent ?? 0
    );
    const rawFlat = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.value_cap ?? 0
    );
    if (valueType === "percentage") {
      const cap = Number(
        (offer as any)?.benefit?.value_cap ?? Number.POSITIVE_INFINITY
      );
      const pctDiscount = (cartSubtotal * rawPercent) / 100;
      computedDiscount = Math.min(
        pctDiscount,
        Number.isFinite(cap) ? cap : pctDiscount
      );
    } else {
      computedDiscount = rawFlat;
    }
  }

  const discount = Math.max(0, Math.min(computedDiscount, cartSubtotal));
  const cartTotal = Math.max(0, cartSubtotal - discount);

  // Sync offer selection to store
  useEffect(() => {
    if (appliedOfferId) {
      updateCartOffer(id, appliedOfferId, discount, cartTotal);
    } else {
      clearCartOffer(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedOfferId, cartSubtotal, discount, cartTotal, id]);

  // Early return if invalid data
  if (!id || !store?._id) return null;

  // Shape cart for offer sheet
  const cartWithOffers: FetchCartType = {
    _id: id,
    store_id: store._id,
    store: { ...store, offers: store.offers || [] },
    items: availableItems.map((item) => ({
      _id: item._id,
      qty: item.qty,
      unit_price: item.unit_price,
      total_price: item.total_price,
      store_id: item.store_id,
      product: item.product,
    })),
    cart_items: validItems, // keep all items for UI display
    cartItemsCount: availableItems.length,
    cartTotalPrice: cartTotal,
    updatedAt: new Date().toISOString(),
  };

  const handleStoreStatusChange = (isOpen: boolean) => {
    setIsStoreOpen(isOpen);
  };

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <CartStoreHeader
        store={store}
        validItems={validItems}
        onCartChange={onCartChange}
        onStoreStatusChange={handleStoreStatusChange}
      />

      {/* Items */}
      {store.slug ? (
        <CartItems
          cartId={id}
          storeId={store._id}
          storeSlug={store.slug}
          items={validItems} // show all items, including unavailable
          isStoreOpen={isStoreOpen}
          onCartChange={onCartChange}
        />
      ) : (
        <Text style={styles.errorText}>⚠️ Unable to load cart items</Text>
      )}

      {/* Offers */}
      {store.offers && store.offers.length > 0 && (
        <View style={styles.offersContainer}>
          <CartOfferBtn
            appliedOfferId={appliedOfferId}
            applyOffer={setAppliedOfferId}
            cart={cartWithOffers}
            offersOpen={offersOpen}
            setOffersOpen={setOffersOpen}
          />
        </View>
      )}

      {/* Totals */}
      <View style={styles.totalsContainer}>
        {!!discount && (
          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>
              Discount {appliedOfferId ? `(${appliedOfferId})` : ""}
            </Text>
            <Text style={styles.discountAmount}>−₹{discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{cartTotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: "#d73a49",
    textAlign: "center",
    marginTop: 8,
  },
  offersContainer: {
    marginTop: 12,
  },
  totalsContainer: {
    marginTop: 8,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: "#28a745",
  },
  discountAmount: {
    fontSize: 14,
    color: "#28a745",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CartCard;
