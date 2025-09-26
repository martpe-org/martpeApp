import React, { useEffect, useState, useMemo, useRef } from "react";
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
  const { updateCartOffer, clearCartOffer, appliedOffers, syncCartFromApi } = useCartStore();
  const [validItems, setValidItems] = useState<CartItemType[]>([]);
  const [appliedOfferId, setAppliedOfferId] = useState<string>("");
  const [offersOpen, setOffersOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [localItems, setLocalItems] = useState<CartItemType[]>([]);

  // Restore previously applied offer (if any) for this cart
  useEffect(() => {
    const existing = appliedOffers[id]?.offerId;
    if (existing) setAppliedOfferId(existing);
  }, [id, appliedOffers]);

  // Filter items with valid IDs and sync local state
  useEffect(() => {
    const filtered = items?.filter((item) => item && item._id) || [];
    setValidItems(filtered);
    setLocalItems(filtered);
  }, [items]);

  // Handle real-time cart updates
  const handleCartChange = async () => {
    onCartChange?.();
    // Small delay to allow for state updates, then sync prices
    setTimeout(async () => {
      const { userDetails } = await import("../../hook/useUserDetails");
      const authToken = userDetails?.()?.userDetails?.accessToken;
      if (authToken) {
        await syncCartFromApi(authToken);
      }
    }, 300);
  };

  // Only available items (instock) will be used for totals/checkout
  const availableItems = useMemo(
    () => localItems.filter((item) => item.product?.instock),
    [localItems]
  );

  // Calculate subtotal using the most up-to-date prices
  const cartSubtotal = useMemo(() => {
    return availableItems.reduce((sum, item) => {
      // Use total_price if available, otherwise calculate from unit_price * qty
      const itemTotal = item.total_price || (item.unit_price * (item.qty || 1));
      return sum + itemTotal;
    }, 0);
  }, [availableItems]);

  // Calculate discount
  const computedDiscount = useMemo(() => {
    if (!appliedOfferId) return 0;
    const offer = store?.offers?.find((o) => o.offer_id === appliedOfferId);
    if (!offer) return 0;

    const qualifierMin = Number(offer?.qualifier?.min_value ?? 0);
    if (cartSubtotal < qualifierMin) return 0;

    const valueType = offer?.benefit?.value_type;
    const rawPercent = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.percent ?? 0
    );
    const rawFlat = Number(
      (offer as any)?.benefit?.value ?? (offer as any)?.benefit?.value_cap ?? 0
    );

    if (valueType === "percentage") {
      const cap = Number((offer as any)?.benefit?.value_cap ?? Infinity);
      return Math.min((cartSubtotal * rawPercent) / 100, cap);
    } else {
      return rawFlat;
    }
  }, [appliedOfferId, cartSubtotal, store?.offers]);

  const discount = Math.min(computedDiscount, cartSubtotal);
  const cartTotal = Math.max(0, cartSubtotal - discount);

  // Sync offer selection to store (only if values actually changed)
  const prevOfferRef = useRef<{ appliedOfferId: string; discount: number; cartTotal: number }>({
    appliedOfferId: "",
    discount: 0,
    cartTotal: 0,
  });

  useEffect(() => {
    const prev = prevOfferRef.current;

    if (
      appliedOfferId !== prev.appliedOfferId ||
      Math.abs(discount - prev.discount) > 0.01 ||
      Math.abs(cartTotal - prev.cartTotal) > 0.01
    ) {
      if (appliedOfferId) {
        updateCartOffer(id, appliedOfferId, discount, cartTotal);
      } else {
        clearCartOffer(id);
      }

      prevOfferRef.current = { appliedOfferId, discount, cartTotal };
    }
  }, [appliedOfferId, discount, cartTotal, id, updateCartOffer, clearCartOffer]);

  // Handle item quantity changes with optimistic updates
  const handleItemChange = (itemId: string, newQty: number) => {
    // Optimistic local update
    setLocalItems(prev => 
      prev.map(item => {
        if (item._id === itemId) {
          const updatedItem = { 
            ...item, 
            qty: newQty,
            total_price: (item.unit_price || 0) * newQty,
            total_max_price: (item.unit_max_price || item.unit_price || 0) * newQty
          };
          return updatedItem;
        }
        return item;
      }).filter(item => item.qty > 0) // Remove items with qty 0
    );
    
    // Trigger the actual cart update
    handleCartChange();
  };

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
      total_price: item.total_price || (item.unit_price * item.qty),
      store_id: item.store_id,
      product: item.product,
    })),
    cart_items: localItems, // keep all items for UI display
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
        validItems={localItems}
        onCartChange={handleCartChange}
        onStoreStatusChange={handleStoreStatusChange}
      />

      {/* Items */}
      {store.slug ? (
        <CartItems
          cartId={id}
          storeId={store._id}
          storeSlug={store.slug}
          items={localItems} // show all items, including unavailable
          isStoreOpen={isStoreOpen}
          onCartChange={handleCartChange}
          onItemChange={handleItemChange}
        />
      ) : (
        <Text style={styles.errorText}>⚠️ Unable to load cart items</Text>
      )}

      {/* Offers */}
      {store.offers && store.offers.length > 0 && (
        <View style={styles.offersContainer}>
          <CartOfferBtn
            appliedOfferId={appliedOfferId}
            applyOffer={(offerId) => {
              setAppliedOfferId(offerId);
              if (offerId) {
                updateCartOffer(id, offerId, discount, cartTotal);
              } else {
                clearCartOffer(id);
              }
            }}
            cart={cartWithOffers}
            offersOpen={offersOpen}
            setOffersOpen={setOffersOpen}
          />
        </View>
      )}

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalAmount}>₹{cartSubtotal.toFixed(2)}</Text>
        </View>
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subtotalLabel: {
    fontSize: 14,
    color: "#4A5568",
  },
  subtotalAmount: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
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
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A202C",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F855A",
  },
});

export default CartCard;