/**
 * @file layout.tsx
 * @description Root layout component for the Smart Tour application. Provides the HTML structure,
 * metadata, viewport configuration, and global context providers like AuthProvider.
 * @author Smart Tour Team
 * @dependencies next, @/components/AuthProvider, globals.css
 */

// ==========================================
// Imports
// ==========================================
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";

// ==========================================
// Constants & Configurations
// ==========================================

/**
 * Global metadata configuration for the application (SEO, OpenGraph, etc.)
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "Smart Tour — Discover Northern Pakistan",
  description: "AI-powered tour booking platform for northern Pakistan. Find, plan and book amazing tours in Hunza, Skardu, Swat, Naran and more.",
  keywords: "Pakistan tours, Hunza Valley, Skardu, northern Pakistan travel, tour booking, AI itinerary",
  authors: [{ name: "Smart Tour" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Smart Tour — Discover Northern Pakistan",
    description: "Your AI-powered travel companion for northern Pakistan",
    type: "website",
  },
};

/**
 * Viewport configuration for responsive design and PWA theme color.
 * @type {Viewport}
 */
export const viewport: Viewport = {
  themeColor: "#14D2BE",
  width: "device-width",
  initialScale: 1,
};

// ==========================================
// Component: RootLayout
// ==========================================

/**
 * Props for the RootLayout component
 * @typedef {Object} RootLayoutProps
 * @property {React.ReactNode} children - The child components to render within the layout
 */

/**
 * Root Layout Component
 * Wraps all application pages with global providers and standard HTML structure.
 * 
 * @param {RootLayoutProps} props - Component props
 * @returns {JSX.Element} The rendered root layout
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO: Add global error boundary component to catch unhandled errors
  
  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <Script id="remove-extension-hydration-attrs" strategy="beforeInteractive">
          {`
            (() => {
              const extensionAttributes = ["bis_skin_checked"];
              const clean = (root) => {
                if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
                for (const attr of extensionAttributes) {
                  if (root.hasAttribute(attr)) root.removeAttribute(attr);
                }
                root.querySelectorAll(extensionAttributes.map((attr) => "[" + attr + "]").join(",")).forEach((element) => {
                  for (const attr of extensionAttributes) element.removeAttribute(attr);
                });
              };

              clean(document.documentElement);
              const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  if (mutation.type === "attributes") {
                    clean(mutation.target);
                    continue;
                  }

                  mutation.addedNodes.forEach(clean);
                }
              });

              observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: extensionAttributes,
              });

              window.addEventListener("load", () => {
                clean(document.documentElement);
                window.setTimeout(() => observer.disconnect(), 1000);
              });
            })();
          `}
        </Script>
      </head>
      {/* Suppress hydration warning to allow client-side extensions (e.g., Grammarly) */}
      <body suppressHydrationWarning={true} className="antialiased min-h-screen">
        {/* AuthProvider wraps the app to provide authentication context to all child routes */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
