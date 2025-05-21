"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import Logo from "../../../public/logo.svg";

export function LandingHeader() {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track scroll position for header effects
  const { scrollY } = useScroll();
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

  // Calculate blur based on scroll position
  const blur =
    scrollPosition <= 70
      ? 0
      : Math.abs(Math.min(((scrollPosition - 70) / 70) * 8, 8));

  // Close mobile menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      {/* Fixed header that changes style on scroll */}
      <header
        className="fixed top-0 left-0 right-0 z-50 sm:px-4 md:px-6 py-2 transition-all duration-300"
        style={{
          backgroundColor: `rgba(var(--background-rgb, 255, 255, 255), ${opacity})`,
          backdropFilter: `blur(${blur}px)`,
        }}
      >
        <div className="px-2 sm:px-0 sm:container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo
              className="sm:h-14 h-[3.4rem] w-auto"
              aria-label="Projectron"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />

            {/* CTA Button */}
            <Link href="/auth/register">
              <Button
                className="bg-white text-primary-background"
                variant="outline"
              >
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-background pt-20 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col items-center space-y-6 mt-8">
            <MobileNavLinks closeMenu={() => setIsMenuOpen(false)} />

            <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </Link>
          </nav>
        </motion.div>
      )}
    </>
  );
}

// Shared navigation links
function NavLinks() {
  return (
    <>
      <Link
        href="#features"
        className="text-foreground hover:text-primary transition-colors duration-200"
      >
        Features
      </Link>
      <Link
        href="#how-it-works"
        className="text-foreground hover:text-primary transition-colors duration-200"
      >
        How It Works
      </Link>
      <Link
        href="#pricing"
        className="text-foreground hover:text-primary transition-colors duration-200"
      >
        Pricing
      </Link>
      <Link
        href="/auth/login"
        className="text-foreground hover:text-primary transition-colors duration-200"
      >
        Login
      </Link>
    </>
  );
}

// Mobile navigation links with close menu functionality
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
        href="#pricing"
        className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-200 w-full text-center py-3"
        onClick={closeMenu}
      >
        Pricing
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
