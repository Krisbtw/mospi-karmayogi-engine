"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Officer, DEMO_OFFICERS } from "./data-service";

export type UserRole = "OFFICER" | "TRAINING_ADMIN";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  designation: string;
  division: string;
  department: string;
  avatar: string;
  role: "TRAINING_ADMIN";
}

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  id: "admin_nssta_hq",
  name: "Dr. Rajiv Sen",
  email: "r.sen@mospi.gov.in",
  designation: "Director of Training (National Academy)",
  division: "NSSTA (National Statistical Systems Training Academy)",
  department: "Training Division, MoSPI Headquarters",
  avatar: "RS",
  role: "TRAINING_ADMIN",
};

interface RoleContextValue {
  role: UserRole;
  isOfficer: boolean;
  isAdmin: boolean;
  setRole: (role: UserRole) => void;
  switchRole: () => void;
  currentOfficer: Officer;
  setCurrentOfficer: (officer: Officer) => void;
  adminProfile: AdminProfile;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("OFFICER");
  const [currentOfficer, setCurrentOfficer] = useState<Officer>(DEMO_OFFICERS[0]);
  const [adminProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync role with localStorage for persistence across reloads
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("mospi_user_role");
      if (savedRole === "OFFICER" || savedRole === "TRAINING_ADMIN") {
        setRoleState(savedRole);
      }
    } catch {
      // Ignore in SSR
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("mospi_user_role", newRole);
    } catch {
      // Ignore
    }
  };

  const switchRole = () => {
    const next = role === "OFFICER" ? "TRAINING_ADMIN" : "OFFICER";
    setRole(next);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        isOfficer: role === "OFFICER",
        isAdmin: role === "TRAINING_ADMIN",
        setRole,
        switchRole,
        currentOfficer,
        setCurrentOfficer,
        adminProfile,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
