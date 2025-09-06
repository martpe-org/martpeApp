import { create } from "zustand";

// Types based on your select-cart-type.ts
export interface SelectData {
  context: {
    domain: string;
    action: string;
    country: string;
    city: string;
    core_version: string;
    bap_id: string;
    bap_uri: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
    bpp_uri: string;
    bpp_id: string;
  };
  addressId: string;
  address: {
    name: string;
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  sub_total: number;
  items: Array<{
    id: string;
    catalog_id: string;
    product: {
      slug: string;
      name: string;
      symbol: string;
      variant_info?: string;
    };
    cart_qty: number;
    instock: boolean;
    unit_price: number;
    total_price: number;
    selected_customizations?: Array<{
      groupId: string;
      name: string;
      optionId: string;
    }>;
  }>;
  fulfillments: Array<{
    id: string;
    type: string;
    category: string;
    tat: string;
  }>;
  breakups: {
    [key: string]: {
      breakups: Array<{
        title?: string;
        custom_title?: string;
        price: number;
        children?: Array<{
          custom_title: string;
          title?: string;
          price: number;
        }>;
      }>;
      total_savings: number;
      total: number;
    };
  };
}

interface CheckoutState {
  // Modal state
  isOpen: boolean;
  loading: boolean;
  paymentLoading: boolean;
  
  // Data
  checkoutData: SelectData | null;
  selectedFulfillment: string;
  appliedOfferId: string;
  
  // Actions
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPaymentLoading: (loading: boolean) => void;
  setCheckoutData: (data: SelectData | null) => void;
  setSelectedFulfillment: (fulfillmentId: string) => void;
  setAppliedOfferId: (offerId: string) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  loading: false,
  paymentLoading: false,
  checkoutData: null,
  selectedFulfillment: "",
  appliedOfferId: "",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,
  
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (loading) => set({ loading }),
  setPaymentLoading: (paymentLoading) => set({ paymentLoading }),
  setCheckoutData: (checkoutData) => set({ checkoutData }),
  setSelectedFulfillment: (selectedFulfillment) => set({ selectedFulfillment }),
  setAppliedOfferId: (appliedOfferId) => set({ appliedOfferId }),
  
  reset: () => set(initialState),
}));