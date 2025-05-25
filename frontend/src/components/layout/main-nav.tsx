"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Logo from "../../../public/logo.svg";

// Animated Hamburger Component
const AnimatedHamburger = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="relative h-10 w-10 rounded-lg transition-all duration-200 hover:bg-hover-active focus:outline-none focus:ring-2 focus:ring-primary-cta focus:ring-opacity-50 md:hidden"
      aria-label="Toggle menu"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-6 w-6 flex-col justify-center space-y-1">
          {/* Top line */}
          <div
            className={cn(
              "h-0.5 w-6 bg-primary-text transition-all duration-300 ease-in-out",
              isOpen ? "translate-y-1.5 rotate-45" : ""
            )}
          />
          {/* Middle line */}
          <div
            className={cn(
              "h-0.5 w-6 bg-primary-text transition-all duration-300 ease-in-out",
              isOpen ? "opacity-0" : "opacity-100"
            )}
          />
          {/* Bottom line */}
          <div
            className={cn(
              "h-0.5 w-6 bg-primary-text transition-all duration-300 ease-in-out",
              isOpen ? "-translate-y-1.5 -rotate-45" : ""
            )}
          />
        </div>
      </div>
    </button>
  );
};

// Mobile Menu Overlay Component
const MobileMenuOverlay = ({
  isOpen,
  onClose,
  navItems,
  user,
  logout,
}: {
  isOpen: boolean;
  onClose: () => void;
  navItems: any[];
  user: any;
  logout: () => void;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-secondary-background/95 backdrop-blur-lg shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-text">Menu</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-hover-active"
            >
              <div className="relative h-6 w-6">
                <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary-text" />
                <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-primary-text" />
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                    pathname?.startsWith(item.href)
                      ? "bg-primary-cta/10 text-primary-text border border-primary-text"
                      : "text-secondary-text hover:bg-hover-active hover:text-primary-text"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-transparent text-white gradient-border gradient-border-full">
                  {user.full_name
                    ?.split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-primary-text">
                  {user.full_name}
                </p>
                <p className="text-xs text-secondary-text">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center rounded-lg px-4 py-2 text-sm text-secondary-text transition-colors hover:bg-hover-active hover:text-primary-text"
                onClick={onClose}
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <button
                className="flex w-full items-center rounded-lg px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                onClick={() => {
                  onClose();
                  logout();
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    {
      name: "My Projects",
      href: "/projects",
      icon: LayoutDashboard,
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-secondary-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="flex items-center transition-all duration-200 hover:scale-105 rounded-lg p-1"
            >
              <Logo className="h-12 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex">
              <ul className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex items-center px-3 py-2 text-sm transition-colors text-white"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Menu - Desktop */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-transparent text-white gradient-border gradient-border-full">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-secondary-background/95 backdrop-blur-lg border-white/20 shadow-2xl"
                  sideOffset={8}
                >
                  <div className="flex items-center gap-3 p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-transparent text-white gradient-border gradient-border-full">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-primary-text truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-secondary-text truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors hover:bg-hover-active"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-4 py-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <AnimatedHamburger
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenuOverlay
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        user={user}
        logout={logout}
      />
    </>
  );
}

export default Navbar;
