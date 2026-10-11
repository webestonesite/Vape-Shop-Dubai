"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  emirate: string; // Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain
  city?: string;
  area?: string;
  addressLine1: string;
  villaOrApt?: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
  createdAt?: string;
}

interface CustomerAuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  addresses: CustomerAddress[];
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    phone?: string,
    address?: {
      emirate: string;
      city?: string;
      area?: string;
      addressLine1: string;
      villaOrApt?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileDetails: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  saveAddress: (address: Omit<CustomerAddress, "id"> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or sync profile from backend
  const fetchProfile = async (firebaseUser: User) => {
    try {
      const token = await getIdToken(firebaseUser, true);
      const res = await fetch("/api/customer/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          return;
        }
      }

      // Fallback: create base profile in state
      setProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        addresses: [],
      });
    } catch (err) {
      console.error("[CustomerAuth] Profile fetch error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      await fetchProfile(cred.user);
      return { success: true };
    } catch (err: any) {
      console.error("[CustomerAuth] Google sign in error:", err);
      return { success: false, error: err.message || "Failed to sign in with Google" };
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchProfile(cred.user);
      return { success: true };
    } catch (err: any) {
      let msg = "Invalid email or password.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later or reset password.";
      }
      return { success: false, error: msg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone?: string,
    address?: {
      emirate: string;
      city?: string;
      area?: string;
      addressLine1: string;
      villaOrApt?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      // Sync initial profile to backend
      const token = await getIdToken(cred.user);
      await fetch("/api/customer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone?.trim() || "",
        }),
      });

      // Save initial address if provided
      if (address && address.addressLine1?.trim()) {
        await fetch("/api/customer/profile/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: name.trim(),
            phone: phone?.trim() || "",
            emirate: address.emirate || "Dubai",
            city: address.city || address.emirate || "Dubai",
            area: address.area?.trim() || "",
            addressLine1: address.addressLine1.trim(),
            villaOrApt: address.villaOrApt?.trim() || "",
            isDefault: true,
          }),
        });
      }

      await fetchProfile(cred.user);
      return { success: true };
    } catch (err: any) {
      let msg = err.message || "Registration failed.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to send password reset email." };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateProfileDetails = async (data: { name?: string; phone?: string }) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      if (data.name && data.name.trim()) {
        await updateProfile(user, { displayName: data.name.trim() });
      }
      const token = await getIdToken(user);
      const res = await fetch("/api/customer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile" };
    }
  };

  const saveAddress = async (
    addressInput: Omit<CustomerAddress, "id"> & { id?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const token = await getIdToken(user);
      const res = await fetch("/api/customer/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressInput),
      });

      if (!res.ok) throw new Error("Failed to save address");
      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to save address" };
    }
  };

  const deleteAddress = async (addressId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const token = await getIdToken(user);
      const res = await fetch(`/api/customer/profile/addresses?id=${encodeURIComponent(addressId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete address");
      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete address" };
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const token = await getIdToken(user);
      const res = await fetch("/api/customer/profile/addresses/default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addressId }),
      });

      if (!res.ok) throw new Error("Failed to set default address");
      await fetchProfile(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to set default address" };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        profile,
        addresses: profile?.addresses || [],
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        updateProfileDetails,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
