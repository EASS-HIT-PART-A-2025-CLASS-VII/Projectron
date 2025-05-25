"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
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
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
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
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-primary-background shadow-2xl transition-transform duration-300 ease-out md:hidden border-l border-white/10",
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
                <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary-text transition-all duration-200" />
                <div className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-primary-text transition-all duration-200" />
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 flex-1">
          <ul className="space-y-3">
            <li>
              <Link
                href="#features"
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 text-primary-text hover:bg-hover-active hover:text-primary-cta group"
                onClick={onClose}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  Features
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="#how-it-works"
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 text-primary-text hover:bg-hover-active hover:text-primary-cta group"
                onClick={onClose}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  How It Works
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/auth/login"
                className="flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 text-primary-text hover:bg-hover-active hover:text-primary-cta group"
                onClick={onClose}
              >
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  Login
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* CTA Section */}
        <div className="border-t border-white/10 p-6">
          <Link href="/auth/register" onClick={onClose}>
            <Button
              className="w-full bg-white text-primary-background hover:bg-gray-100 transition-all duration-200 shadow-lg"
              variant="outline"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export function LandingHeader() {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track scroll position for header effects
  const [scrollPosition, setScrollPosition] = useState(0);

  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll position
  const opacity =
    scrollPosition <= 70
      ? 0
      : Math.abs(Math.min((scrollPosition - 70) / 70, 1));

  const closeMobileMenu = () => setIsMenuOpen(false);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  return (
    <>
      {/* Fixed header that changes style on scroll */}
      <header
        className="fixed top-0 left-0 right-0 z-30 sm:px-4 md:px-6 py-2 transition-all duration-300"
        style={{
          backgroundColor: `rgba(var(--background-rgb, 255, 255, 255), ${opacity})`,
        }}
      >
        <div className="px-2 sm:px-0 sm:container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-all duration-200 hover:scale-105 rounded-lg p-1"
          >
            <Logo
              className="sm:h-14 h-[3.4rem] w-auto focus:none focus-ring-0"
              aria-label="Projectron"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-foreground hover:text-primary-cta transition-colors duration-200 font-medium"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-foreground hover:text-primary-cta transition-colors duration-200 font-medium"
              >
                How It Works
              </Link>
              <Link
                href="/auth/login"
                className="text-foreground hover:text-primary-cta transition-colors duration-200 font-medium"
              >
                Login
              </Link>

              {/* CTA Button */}
              <Link href="/auth/register">
                <Button
                  className="bg-white text-primary-background hover:bg-hover-active hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  variant="outline"
                >
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <AnimatedHamburger
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenuOverlay isOpen={isMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

// Shared navigation links (keeping for backward compatibility)
function NavLinks() {
  return (
    <>
      <Link
        href="#features"
        className="text-foreground hover:text-primary-cta transition-colors duration-200"
      >
        Features
      </Link>
      <Link
        href="#how-it-works"
        className="text-foreground hover:text-primary-cta transition-colors duration-200"
      >
        How It Works
      </Link>

      <Link
        href="/auth/login"
        className="text-foreground hover:text-primary-cta transition-colors duration-200"
      >
        Login
      </Link>
    </>
  );
}

// Mobile navigation links with close menu functionality (keeping for backward compatibility)
function MobileNavLinks({ closeMenu }: { closeMenu: () => void }) {
  return (
    <>
      <Link
        href="#features"
        className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-200 w-full text-center py-3"
        onClick={closeMenu}
      >
        Features
      </Link>
      <Link
        href="#how-it-works"
        className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-200 w-full text-center py-3"
        onClick={closeMenu}
      >
        How It Works
      </Link>
      <Link
        href="/auth/login"
        className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-200 w-full text-center py-3"
        onClick={closeMenu}
      >
        Login
      </Link>
    </>
  );
}
