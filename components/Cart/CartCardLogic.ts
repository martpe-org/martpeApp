import { useEffect, useMemo, useRef, useState } from "react";
import { CartItemType, FetchCartStore, FetchCartType } from "../../app/(tabs)/cart/fetch-carts-type";
import { useCartStore } from "../../state/useCartStore";
import { refreshCartFromApi } from "@/utility/cartUtils";

export function useCartCardLogic(
  id: string,
  store: FetchCartStore,
  items: CartItemType[],
  onCartChange?: () => void
) {
  const { updateCartOffer, clearCartOffer, appliedOffers } = useCartStore();
  const [appliedOfferId, setAppliedOfferId] = useState<string>("");
  const [offersOpen, setOffersOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [localItems, setLocalItems] = useState<CartItemType[]>([]);

  // Restore applied offer if present
  useEffect(() => {
    const existing = appliedOffers[id]?.offerId;
    if (existing) setAppliedOfferId(existing);
  }, [id, appliedOffers]);

  // Keep only valid items
  useEffect(() => {
    const filtered = items?.filter((item) => item && item._id) || [];
    setLocalItems(filtered);
  }, [items]);

  // Trigger cart refresh
  const handleCartChange = async () => {
    onCartChange?.();
    setTimeout(() => {
      refreshCartFromApi();
    }, 300);
  };

  // In-stock items only
  const availableItems = useMemo(
    () => localItems.filter((item) => item.product?.instock),
    [localItems]
  );

  // Subtotal
  const cartSubtotal = useMemo(() => {
    return availableItems.reduce((sum, item) => {
      return sum + (item.total_price ?? item.unit_price * (item.qty || 1));
    }, 0);
  }, [availableItems]);

  // Compute discount
  const computedDiscount = useMemo(() => {
    if (!appliedOfferId) return 0;
    const offer = store?.offers?.find((o) => o.offer_id === appliedOfferId);
    if (!offer) return 0;

    const minQualifier = Number(offer?.qualifier?.min_value ?? 0);
    if (cartSubtotal < minQualifier) return 0;

    const valueType = offer?.benefit?.value_type;
    const percent = Number((offer as any)?.benefit?.percent ?? 0);
    const flat = Number((offer as any)?.benefit?.value ?? 0);
    const cap = Number((offer as any)?.benefit?.value_cap ?? Infinity);

    if (valueType === "percentage") {
      return Math.min((cartSubtotal * percent) / 100, cap);
    } else {
      return Math.min(flat, cartSubtotal); // ensure discount <= subtotal
    }
  }, [appliedOfferId, cartSubtotal, store?.offers]);

  // Ensure discount is positive
  const discount = Math.max(0, Math.min(computedDiscount, cartSubtotal));
  const cartTotal = cartSubtotal - discount;

  // Sync offer selection to store
  const prevOfferRef = useRef({
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

  // Handle item quantity changes
  const handleItemChange = (itemId: string, newQty: number) => {
    setLocalItems((prev) =>
      prev
        .map((item) =>
          item._id === itemId
            ? {
                ...item,
                qty: newQty,
                total_price: (item.unit_price || 0) * newQty,
                total_max_price: (item.unit_max_price || item.unit_price || 0) * newQty,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
    handleCartChange();
  };

  // Cart object for passing down
  const cartWithOffers: FetchCartType = {
    _id: id,
    store_id: store._id,
    store: { ...store, offers: store.offers || [] },
    items: availableItems.map((item) => ({
      _id: item._id,
      qty: item.qty,
      unit_price: item.unit_price,
      total_price: item.total_price || item.unit_price * item.qty,
      store_id: item.store_id,
      product: item.product,
    })),
    cart_items: localItems,
    cartItemsCount: availableItems.length,
    cartTotalPrice: cartTotal,
    updatedAt: new Date().toISOString(),
  };

  return {
    appliedOfferId,
    setAppliedOfferId,
    offersOpen,
    setOffersOpen,
    isStoreOpen,
    setIsStoreOpen,
    localItems,
    handleCartChange,
    handleItemChange,
    cartSubtotal,
    discount,
    cartTotal,
    cartWithOffers,
  };
}
