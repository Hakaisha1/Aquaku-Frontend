"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  getStoredTokens,
  setStoredTokens,
  subscribeAuth,
} from "@/lib/api";
import type { Quota, UserProfile } from "@/types/api";

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  quota: Quota | null;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  isPhoneModalOpen: boolean;
  devOtp: string | null;
  isSellModalOpen: boolean;
  isAccountModalOpen: boolean;
  isMembershipModalOpen: boolean;
  isTransactionsModalOpen: boolean;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  openPhoneVerifyModal: (devOtp?: string) => void;
  closePhoneVerifyModal: () => void;
  openSellModal: () => void;
  closeSellModal: () => void;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  openMembershipModal: () => void;
  closeMembershipModal: () => void;
  openTransactionsModal: () => void;
  closeTransactionsModal: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    phone_number: string;
  }) => Promise<string | undefined>;
  verifyPhone: (code: string) => Promise<void>;
  resendOtp: () => Promise<string | undefined>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshQuota: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quota, setQuota] = useState<Quota | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      // not authenticated or network error
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    if (!user) return;
    try {
      const q = await api.getQuota();
      setQuota(q);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    const unsub = subscribeAuth((newUser) => {
      setUser(newUser);
      if (!newUser) setQuota(null);
    });

    const init = async () => {
      const tokens = getStoredTokens();
      if (tokens) {
        setUser(tokens.user);
        await refreshUser();
      }
      setIsLoading(false);
    };

    init();
    return unsub;
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      refreshQuota();
    }
  }, [user, refreshQuota]);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    if (typeof window !== "undefined") {
      window.location.href = `/login?tab=${tab}`;
    }
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openPhoneVerifyModal = (code?: string) => {
    if (code) setDevOtp(code);
    setIsPhoneModalOpen(true);
  };
  const closePhoneVerifyModal = () => {
    setIsPhoneModalOpen(false);
    setDevOtp(null);
  };

  const openSellModal = () => {
    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?redirect=sell";
      }
      return;
    }
    if (!user.phone_verified) {
      openPhoneVerifyModal();
      return;
    }
    setIsSellModalOpen(true);
  };
  const closeSellModal = () => setIsSellModalOpen(false);

  const openAccountModal = () => {
    if (!user) {
      openAuthModal("login");
    } else {
      setIsAccountModalOpen(true);
    }
  };
  const closeAccountModal = () => setIsAccountModalOpen(false);

  const openMembershipModal = () => setIsMembershipModalOpen(true);
  const closeMembershipModal = () => setIsMembershipModalOpen(false);

  const openTransactionsModal = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setIsTransactionsModalOpen(true);
  };
  const closeTransactionsModal = () => setIsTransactionsModalOpen(false);

  const login = async (credentials: { email: string; password: string }) => {
    const pair = await api.login(credentials);
    setUser(pair.user);
    closeAuthModal();
  };

  const register = async (data: {
    email: string;
    password: string;
    display_name: string;
    phone_number: string;
  }) => {
    const res = await api.register(data);
    // Sesuai alur fleksibel: Login otomatis di latar belakang untuk mendapatkan sesi,
    // tanpa memaksakan popup OTP. User bebas menjelajah, dan OTP baru ditanyakan saat
    // mencoba pasang listing atau berpartisipasi di forum.
    try {
      const pair = await api.login({
        email: data.email,
        password: data.password,
      });
      setUser(pair.user);
    } catch {
      // fallback
    }
    closeAuthModal();
    return res.development_otp;
  };

  const verifyPhone = async (code: string) => {
    const updated = await api.verifyPhone(code);
    setUser(updated);
    closePhoneVerifyModal();
  };

  const resendOtp = async () => {
    const res = await api.resendOtp();
    if (res?.development_otp) {
      setDevOtp(res.development_otp);
    }
    return res?.development_otp;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setQuota(null);
    closeAccountModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        quota,
        isAuthModalOpen,
        authModalTab,
        isPhoneModalOpen,
        devOtp,
        isSellModalOpen,
        isAccountModalOpen,
        isMembershipModalOpen,
        isTransactionsModalOpen,
        openAuthModal,
        closeAuthModal,
        openPhoneVerifyModal,
        closePhoneVerifyModal,
        openSellModal,
        closeSellModal,
        openAccountModal,
        closeAccountModal,
        openMembershipModal,
        closeMembershipModal,
        openTransactionsModal,
        closeTransactionsModal,
        login,
        register,
        verifyPhone,
        resendOtp,
        logout,
        refreshUser,
        refreshQuota,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
