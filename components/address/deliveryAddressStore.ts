import { create } from "zustand";
import {
  getAsyncStorageItem,
  removeAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";

// Optional: simple deepEqual for objects
const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export interface DeliveryDetails {
  addressId: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  name: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

interface DeliveryStore {
  selectedDetails: DeliveryDetails | null;
  addDeliveryDetail: (details: DeliveryDetails) => Promise<void>;
  removeDeliveryDetail: () => Promise<void>;
  loadDeliveryDetails: () => Promise<void>;
  clearDeliveryDetails: () => Promise<void>;
}

const DELIVERY_STORAGE_KEY = "selectedDeliveryAddress";

const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  selectedDetails: null,

  addDeliveryDetail: async (details: DeliveryDetails) => {
    try {
      const prev = get().selectedDetails;

      // ✅ Prevent unnecessary writes if nothing changed
      if (prev && deepEqual(prev, details)) {
        return;
      }

      await setAsyncStorageItem(DELIVERY_STORAGE_KEY, JSON.stringify(details));
      set({ selectedDetails: details });

      console.log("Delivery details saved to AsyncStorage:", details);
    } catch (error) {
      console.error("Error saving delivery details to AsyncStorage:", error);
    }
  },

  removeDeliveryDetail: async () => {
    try {
      await removeAsyncStorageItem(DELIVERY_STORAGE_KEY);
      set({ selectedDetails: null });
      console.log("Delivery details removed from AsyncStorage");
    } catch (error) {
      console.error("Error removing delivery details from AsyncStorage:", error);
    }
  },

  loadDeliveryDetails: async () => {
    try {
      const storedDetails = await getAsyncStorageItem(DELIVERY_STORAGE_KEY);

      if (storedDetails && typeof storedDetails === "string") {
        const parsedDetails = JSON.parse(storedDetails) as DeliveryDetails;

        const prev = get().selectedDetails;
        if (!deepEqual(prev, parsedDetails)) {
          set({ selectedDetails: parsedDetails });
          console.log("Delivery details loaded from AsyncStorage:", parsedDetails);
        } else {
        }
      } else {
        console.log("No delivery details found in AsyncStorage");
        set({ selectedDetails: null });
      }
    } catch (error) {
      console.error("Error loading delivery details from AsyncStorage:", error);
      set({ selectedDetails: null });
    }
  },

  clearDeliveryDetails: async () => {
    const { removeDeliveryDetail } = get();
    await removeDeliveryDetail();
  },
}));

export default useDeliveryStore;
