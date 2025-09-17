import React, { createContext, useContext, useState, ReactNode } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";

// Types
interface UserStoreType {
  firstName: string;
  phoneNumber: string;
  email?: string;
  isAuthenticated: boolean;
}

interface UserActions {
  login: (userData: UserStoreType) => void;
  logout: () => void;
}

type UserStore = UserStoreType & UserActions;

// Store factory
const createUserStore = (
  firstName: string,
  phoneNumber: string,
  email?: string,
  isAuthenticated: boolean = false,
) =>
  create<UserStore>((set) => ({
    firstName,
    phoneNumber,
    email,
    isAuthenticated,

    login: (userData) =>
      set({
        ...userData,
        isAuthenticated: true,
      }),

    logout: () =>
      set({
        firstName: "",
        phoneNumber: "",
        email: "",
        isAuthenticated: false,
      }),
  }));

// Context
type UserStoreHook = UseBoundStore<StoreApi<UserStore>>;
const UserContext = createContext<UserStoreHook | null>(null);

// Hook
export const useUser = () => {
  const store = useContext(UserContext);
  if (!store) throw new Error("useUser must be used within a UserProvider");
  return store;
};

// Provider
export default function UserProvider({
  firstName,
  phoneNumber,
  email,
  isAuthenticated = false,
  children,
}: {
  firstName: string;
  phoneNumber: string;
  email?: string;
  isAuthenticated?: boolean;
  children: ReactNode;
}) {
  const [store] = useState(() =>
    createUserStore(firstName, phoneNumber, email, isAuthenticated),
  );

  return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
}
