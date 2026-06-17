"use client";
import { useEffect, useState } from "react";
import { Inbox } from "@/components/shared/Inbox";
import { useAuth } from "@/components/AuthProvider";
import { fetchCompanyByOwner } from "@/lib/db";

export default function CompanyInboxPage() {
  const { profile, loading: authLoading } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      if (profile?.id) {
        const company = await fetchCompanyByOwner(profile.id);
        if (company) {
          setCompanyId(company.id);
        } else {
          console.warn(`[CompanyInbox] No company found for owner: ${profile.id}`);
        }
      }
      setLoading(false);
    }
    if (!authLoading) loadCompany();
  }, [profile, authLoading]);

  if (authLoading || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  if (!companyId) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h3>No Company Profile</h3>
      <p>Please set up your company profile first.</p>
    </div>
  );

  return <Inbox role="company" currentUserId={companyId} />;
}
