import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItemType, FetchCartStore } from "../../app/(tabs)/cart/fetch-carts-type";
import CartItems from "./CartItems";
import CartOfferBtn from "./CartOfferBtn";
import CartStoreHeader from "./CartStoreHeader";
import { useCartCardLogic } from "./CartCardLogic";
import CartTotals from "./CartTotals";

interface CartCardProps {
  id: string;
  store: FetchCartStore;
  items: CartItemType[];
  onCartChange?: () => void;
}

const CartCard: React.FC<CartCardProps> = ({ id, store, items, onCartChange }) => {
  const {
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
  } = useCartCardLogic(id, store, items, onCartChange);

  if (!id || !store?._id) return null;

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <CartStoreHeader
        store={store}
        validItems={localItems}
        onCartChange={handleCartChange}
        onStoreStatusChange={setIsStoreOpen}
      />

      {/* Items */}
      {store.slug ? (
        <CartItems
          cartId={id}
          storeId={store._id}
          storeSlug={store.slug}
          items={localItems}
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
            applyOffer={(offerId) => setAppliedOfferId(offerId)}
            cart={cartWithOffers}
            offersOpen={offersOpen}
            setOffersOpen={setOffersOpen}
          />
        </View>
      )}

      {/* Totals */}
      <CartTotals
        subtotal={cartSubtotal}
        discount={discount}
        total={cartTotal}
        appliedOfferId={appliedOfferId}
      />
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
});

export default CartCard;
