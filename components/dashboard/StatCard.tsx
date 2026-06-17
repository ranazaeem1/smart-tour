"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  ariaLabel: string;
}

export function StatCard({ label, value, icon: Icon, color, ariaLabel }: StatCardProps) {
  return (
    <div 
      className="stat-card group hover:scale-[1.02] transition-all relative overflow-hidden"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-[14px] ${color.replace('bg-', 'bg-')}/10 flex items-center justify-center ${color.replace('bg-', 'text-')} border border-current/10 shadow-sm transition-transform group-hover:scale-110`}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="stat-label mb-0.5">{label}</p>
          <h3 className="stat-number m-0 !text-[28px] md:!text-[32px]">{value}</h3>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" aria-hidden="true">
        <Icon size={48} />
      </div>
    </div>
  );
}
