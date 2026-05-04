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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      {/* Suppress hydration warning to allow client-side extensions (e.g., Grammarly) */}
      <body suppressHydrationWarning={true}>
        {/* AuthProvider wraps the app to provide authentication context to all child routes */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
