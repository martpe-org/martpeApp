import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItemType, FetchCartStore } from "../../app/(tabs)/cart/fetch-carts-type";
import CartItems from "./CartItems";
import CartOfferBtn from "./CartOfferBtn";
import CartStoreHeader from "./CartStoreHeader";
import { useCartCardLogic } from "./CartCardLogic";
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
          cartSubtotal={cartSubtotal}
          discount={discount}
          cartTotal={cartTotal}
          appliedOfferId={appliedOfferId}
        />

      ) : (
        <Text style={styles.errorText}>âš ï¸ Unable to load cart items</Text>
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorText: {
    color: "#d73a49",
    textAlign: "center",
    marginTop: 8,
  },
  offersContainer: {
    marginTop: 5,
  },
});

export default CartCard;