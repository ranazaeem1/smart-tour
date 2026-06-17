"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createTour, fetchCompanyByOwner, getLocalDateInputValue, isPastTravelDate } from "@/lib/db";
import { DESTINATIONS } from "@/lib/data";
import { getDefaultTourImage } from "@/lib/tourImages";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, ClipboardList, Image as ImageIcon, Mountain, Plus, Rocket, Trash2, Wallet } from "lucide-react";

const INITIAL_HIGHLIGHTS = ["", "", ""];
const INCLUSIONS = ["Transport (AC Vehicle)", "Hotel Accommodation", "All Meals", "Professional Guide", "Permits & Fees", "Travel Insurance"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{children}</label>;
}

export default function AddTourPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState(INITIAL_HIGHLIGHTS);
  const [included, setIncluded] = useState([true, true, true, true, false, false]);
  const [form, setForm] = useState({
    title: "",
    destination: DESTINATIONS[0] || "Hunza Valley",
    category: "Adventure",
    duration: "",
    max_group: "",
    price: "",
    difficulty: "Moderate",
    description: "",
    region: "Northern Pakistan",
    image_url: "",
    active_from: "",
    active_until: "",
  });

  const setField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const minPublishDate = getLocalDateInputValue();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.price || !form.duration || !form.active_from) {
      setError("Please complete title, price, duration, and active from date.");
      return;
    }
    if (isPastTravelDate(form.active_from)) {
      setError("Please select today or a future Active From date. Backdates are locked.");
      return;
    }
    if (form.active_until && isPastTravelDate(form.active_until)) {
      setError("Please select today or a future Active Until date. Backdates are locked.");
      return;
    }
    if (form.active_until && form.active_until < form.active_from) {
      setError("Active Until cannot be before Active From.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (!profile) throw new Error("Authentication required");
      const companyProfile = await fetchCompanyByOwner(profile.id);
      if (!companyProfile) throw new Error("Company profile required");
      if (companyProfile.status !== "approved") {
        throw new Error("Your company must be approved by admin before publishing tours.");
      }

      const tour = await createTour({
        company_id: companyProfile.id,
        title: form.title,
        destination: form.destination,
        region: form.region,
        price: Number(form.price),
        duration: Number(form.duration),
        active_from: form.active_from,
        active_until: form.active_until || null,
        category: form.category,
        max_group: Number(form.max_group) || 12,
        difficulty: form.difficulty,
        highlights: highlights.filter(Boolean),
        included: INCLUSIONS.filter((_, index) => included[index]),
        image_url: form.image_url.trim() || getDefaultTourImage(form.destination, form.title),
      });

      if (tour) {
        setSuccess(true);
        setTimeout(() => router.push("/company/tours"), 2000);
      } else {
        throw new Error("Tour could not be published because this company is not approved.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Tour publishing failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade">
        <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mb-8 border border-emerald-200 shadow-xl">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-950 mb-4 tracking-tight">Tour Published</h2>
        <p className="text-slate-500 font-bold mb-10 max-w-sm">Your package has been added to the company catalog.</p>
        <div className="loading-spinner h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <Link href="/company/tours" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors mb-4">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to My Tours
          </Link>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Mountain size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Package Builder</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Create Tour</h1>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-200 text-slate-500">
          <AlertCircle size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Draft Mode</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600">
              {error}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Core Details</h2>
                <p className="text-xs font-bold text-slate-500">Name, destination, schedule, and capacity</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel>Package Title</FieldLabel>
                <input className="input !rounded-2xl !bg-white !text-lg !font-black" placeholder="e.g. Karakoram Wilderness Expedition" value={form.title} onChange={e => setField("title", e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Destination</FieldLabel>
                  <select className="input !rounded-2xl !bg-white font-bold" value={form.destination} onChange={e => setField("destination", e.target.value)}>
                    {DESTINATIONS.map(destination => <option key={destination}>{destination}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Category</FieldLabel>
                  <select className="input !rounded-2xl !bg-white font-bold" value={form.category} onChange={e => setField("category", e.target.value)}>
                    {["Adventure", "Trekking", "Cultural", "Family", "Sports"].map(category => <option key={category}>{category}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Duration</FieldLabel>
                  <input className="input !rounded-2xl !bg-white font-bold" type="number" placeholder="7" min={1} value={form.duration} onChange={e => setField("duration", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Group Capacity</FieldLabel>
                  <input className="input !rounded-2xl !bg-white font-bold" type="number" placeholder="12" min={1} value={form.max_group} onChange={e => setField("max_group", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Difficulty</FieldLabel>
                  <select className="input !rounded-2xl !bg-white font-bold" value={form.difficulty} onChange={e => setField("difficulty", e.target.value)}>
                    {["Easy", "Moderate", "Challenging", "Expert"].map(difficulty => <option key={difficulty}>{difficulty}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Description</FieldLabel>
                <textarea className="input !rounded-2xl !bg-white font-bold min-h-[120px]" rows={4} placeholder="Tour details, traveler expectations, and safety notes..." value={form.description} onChange={e => setField("description", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Mountain size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">Highlights</h2>
                  <p className="text-xs font-bold text-slate-500">Key places and experiences</p>
                </div>
              </div>
              <button type="button" className="btn btn-secondary !py-3 !px-4 !rounded-2xl flex items-center gap-2" onClick={() => setHighlights(prev => [...prev, ""])}>
                <Plus size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-3">
                  <input className="input !rounded-2xl !bg-slate-50 font-bold" placeholder={`Highlight #${index + 1}`} value={highlight} onChange={e => setHighlights(prev => prev.map((value, itemIndex) => (itemIndex === index ? e.target.value : value)))} />
                  {index > 0 && (
                    <button type="button" className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all" onClick={() => setHighlights(prev => prev.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove highlight">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                <ImageIcon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Image</h2>
                <p className="text-xs font-bold text-slate-500">Optional custom tour photo</p>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Custom Image URL</FieldLabel>
              <input className="input !rounded-2xl !bg-white font-bold" placeholder={`Default: ${getDefaultTourImage(form.destination, form.title)}`} value={form.image_url} onChange={e => setField("image_url", e.target.value)} />
              <p className="text-xs font-bold text-slate-500 mt-3">Leave empty to use the destination image automatically.</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Pricing</h2>
                <p className="text-xs font-bold text-slate-500">Per traveler package price</p>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Price PKR</FieldLabel>
              <input className="input !rounded-2xl !bg-white !text-xl !font-black text-emerald-600" type="number" placeholder="45000" min={0} value={form.price} onChange={e => setField("price", e.target.value)} required />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950 mb-5">Included Services</h2>
            <div className="space-y-2">
              {INCLUSIONS.map((item, index) => (
                <label key={item} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                  <input type="checkbox" checked={included[index]} onChange={e => setIncluded(prev => prev.map((value, itemIndex) => (itemIndex === index ? e.target.checked : value)))} className="h-5 w-5 accent-emerald-500" />
                  <span className="text-sm font-black text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Calendar size={16} className="text-emerald-500" />
              <h2 className="text-xl font-black text-slate-950">Availability</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <FieldLabel>Active From</FieldLabel>
                <input className="input !rounded-2xl !bg-white font-bold" type="date" min={minPublishDate} value={form.active_from} onChange={e => setField("active_from", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <FieldLabel>Active Until</FieldLabel>
                <input className="input !rounded-2xl !bg-white font-bold" type="date" min={form.active_from || minPublishDate} value={form.active_until} onChange={e => setField("active_until", e.target.value)} />
              </div>
            </div>
          </section>

          <button type="submit" className="btn btn-emerald w-full !py-5 !rounded-3xl flex items-center justify-center gap-3 disabled:opacity-50" disabled={submitting}>
            {submitting ? <div className="loading-spinner w-5 h-5 border-current" /> : <Rocket size={20} />}
            <span className="text-sm font-black uppercase tracking-widest">{submitting ? "Publishing..." : "Publish Tour"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
