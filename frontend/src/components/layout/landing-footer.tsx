"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { analytics } from "@/lib/google-analytics";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-cta">
                Projectron
              </span>
            </Link>
            <p className="text-muted-foreground">
              AI-powered project planning that transforms your ideas into
              comprehensive development roadmaps.
            </p>
            <div className="flex space-x-4">
              <SocialLink
                href="https://github.com/Eden-Cohen1/Projectron"
                icon={<Github size={18} />}
              />

              <SocialLink
                href="https://www.linkedin.com/in/eden-co/"
                icon={<Linkedin size={18} />}
              />
              <SocialLink href="/contact" icon={<Mail size={18} />} />
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/#how-it-works">How It Works</FooterLink>
              <FooterLink href="/#use-cases">Use Cases</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink
                href="/about"
                onClick={() =>
                  analytics.trackNavLinkClick("footer-about-click")
                }
              >
                About
              </FooterLink>
              <FooterLink
                href="/contact"
                onClick={() =>
                  analytics.trackNavLinkClick("footer-contact-click")
                }
              >
                Contact
              </FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <FooterLink
                href="/terms"
                onClick={() =>
                  analytics.trackNavLinkClick("footer-terms-click")
                }
              >
                Terms of Service
              </FooterLink>
              <FooterLink
                href="/privacy"
                onClick={() =>
                  analytics.trackNavLinkClick("footer-privacy-click")
                }
              >
                Privacy Policy
              </FooterLink>
              <FooterLink
                href="/cookies"
                onClick={() =>
                  analytics.trackNavLinkClick("footer-cookies-click")
                }
              >
                Cookie Policy
              </FooterLink>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Projectron. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Helper component for footer links
function FooterLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
        onClick={onClick}
      >
        {children}
      </Link>
    </li>
  );
}

// Helper component for social links
function SocialLink({
  href,
  icon,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {icon}
    </Link>
  );
}
