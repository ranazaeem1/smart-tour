"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createUserExpense, deleteUserExpense, fetchUserExpenses, updateProfileBudget, updateUserExpense } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { AlertCircle, Box, BrainCircuit, Calendar, Car, Edit2, Hotel, Mountain, PieChart, Plus, ShoppingBag, Trash2, TrendingDown, TrendingUp, Utensils, Wallet, X } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const CATEGORIES = [
  { name: "Transport", color: "#0F172A", icon: <Car size={18} /> },
  { name: "Accommodation", color: "#8B5CF6", icon: <Hotel size={18} /> },
  { name: "Food", color: "#F59E0B", icon: <Utensils size={18} /> },
  { name: "Activities", color: "#10B981", icon: <Mountain size={18} /> },
  { name: "Shopping", color: "#EC4899", icon: <ShoppingBag size={18} /> },
  { name: "Miscellaneous", color: "#64748B", icon: <Box size={18} /> },
];

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : tone.includes("rose") ? "bg-rose-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

export default function BudgetTracker() {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({ category: "Food", amount: "", description: "" });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      setLoading(true);
      try {
        setExpenses((await fetchUserExpenses(profile.id)) as Expense[]);
        if ((profile as any).total_budget) setTotalBudget((profile as any).total_budget);
      } catch (err) {
        console.error("Failed to load expenses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const handleUpdateBudget = async (value: number) => {
    setTotalBudget(value);
    if (profile) await updateProfileBudget(profile.id, value);
  };

  const handleAddOrEditExpense = async (event: FormEvent) => {
    event.preventDefault();
    if (!newExpense.amount || !profile) return;
    const updates = { category: newExpense.category, amount: parseFloat(newExpense.amount), description: newExpense.description };

    if (editingExpenseId) {
      const updated = await updateUserExpense(editingExpenseId, profile.id, updates);
      if (updated) setExpenses(prev => prev.map(expense => (expense.id === editingExpenseId ? { ...expense, ...updates } : expense)));
    } else {
      const created = await createUserExpense({ user_id: profile.id, ...updates });
      if (created) setExpenses([created as Expense, ...expenses]);
    }

    setNewExpense({ category: "Food", amount: "", description: "" });
    setEditingExpenseId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (expense: Expense) => {
    setNewExpense({ category: expense.category, amount: expense.amount.toString(), description: expense.description });
    setEditingExpenseId(expense.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    if (!confirm("Are you sure you want to delete this expense?")) return;
    const ok = await deleteUserExpense(id, profile.id);
    if (ok) setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const categoryStats = useMemo(
    () => CATEGORIES.map(category => ({ ...category, amount: expenses.filter(expense => expense.category === category.name).reduce((sum, expense) => sum + expense.amount, 0) })).filter(category => category.amount > 0),
    [expenses]
  );
  const topCategory = [...categoryStats].sort((a, b) => b.amount - a.amount)[0];

  const insight = spentPercent > 90 ? "Critical: you have used over 90% of your budget." : spentPercent > 70 ? "You are approaching your budget limit." : remaining > 0 ? "You are within budget. Keep logging expenses for better insights." : "Start logging expenses to unlock budget insights.";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading budget...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Wallet size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Financial Analysis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Budget Tracker</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <Wallet size={18} className="text-emerald-500" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Budget</p>
              <input type="number" value={totalBudget} onChange={event => handleUpdateBudget(Number(event.target.value))} className="bg-transparent border-none text-slate-950 font-black text-lg focus:outline-none w-32 p-0 h-auto" />
            </div>
          </div>
          <button className="btn btn-emerald !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2" onClick={() => { setNewExpense({ category: "Food", amount: "", description: "" }); setEditingExpenseId(null); setShowAddForm(true); }}>
            <Plus size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Add Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Spent" value={formatPKR(totalSpent)} icon={TrendingDown} tone="bg-rose-50 text-rose-500" />
        <StatCard label="Remaining" value={formatPKR(remaining)} icon={TrendingUp} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Top Category" value={topCategory?.name || "-"} icon={PieChart} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Transactions" value={expenses.length} icon={Calendar} tone="bg-slate-100 text-slate-900" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">Budget Usage</h2>
            <p className="text-xs font-bold text-slate-500">{spentPercent.toFixed(1)}% of budget utilized</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">
            <BrainCircuit size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{insight}</span>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-md bg-slate-100">
          <div className="h-full rounded-md bg-emerald-500 transition-all duration-700" style={{ width: `${spentPercent}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-emerald-500" />
            <h2 className="text-xl font-black text-slate-950">Transaction Log</h2>
          </div>
          {expenses.length === 0 ? (
            <div className="py-20 text-center">
              <Box size={42} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-950">No expenses yet</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Add your first travel expense.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {expenses.map(expense => {
                const cat = CATEGORIES.find(category => category.name === expense.category);
                return (
                  <div key={expense.id} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100" style={{ backgroundColor: `${cat?.color}12`, color: cat?.color }}>
                        {cat?.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-950 truncate">{expense.description || expense.category}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{expense.category} | {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-950">{formatPKR(expense.amount)}</p>
                        <div className="mt-2 flex justify-end gap-2">
                          <button onClick={() => handleEditClick(expense)} className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-950 hover:text-white transition-all" aria-label="Edit expense"><Edit2 size={15} className="mx-auto" /></button>
                          <button onClick={() => handleDelete(expense.id)} className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white transition-all" aria-label="Delete expense"><Trash2 size={15} className="mx-auto" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-emerald-500" />
            <h2 className="text-xl font-black text-slate-950">Category Breakdown</h2>
          </div>
          {categoryStats.length === 0 ? (
            <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-slate-400">Add expenses to unlock visualization.</div>
          ) : (
            <div className="space-y-6">
              {categoryStats.map(category => (
                <div key={category.name}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{category.name}</span>
                    <span className="text-sm font-black text-slate-950">{formatPKR(category.amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-md bg-slate-100">
                    <div className="h-full rounded-md transition-all duration-700" style={{ width: `${(category.amount / totalSpent) * 100}%`, backgroundColor: category.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade" onClick={() => setShowAddForm(false)}>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-[520px]" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h2 className="text-2xl font-black text-slate-950">{editingExpenseId ? "Edit Expense" : "New Expense"}</h2>
              <button className="h-10 w-10 rounded-2xl hover:bg-slate-100 text-slate-400" onClick={() => setShowAddForm(false)} aria-label="Close expense form"><X size={20} className="mx-auto" /></button>
            </div>
            <form onSubmit={handleAddOrEditExpense} className="space-y-5">
              <select className="input !rounded-2xl !bg-white font-black" value={newExpense.category} onChange={event => setNewExpense({ ...newExpense, category: event.target.value })}>
                {CATEGORIES.map(category => <option key={category.name} value={category.name}>{category.name}</option>)}
              </select>
              <input className="input !rounded-2xl !bg-white font-black" type="number" placeholder="Amount (PKR)" required value={newExpense.amount} onChange={event => setNewExpense({ ...newExpense, amount: event.target.value })} />
              <input className="input !rounded-2xl !bg-white font-black" placeholder="Description" value={newExpense.description} onChange={event => setNewExpense({ ...newExpense, description: event.target.value })} />
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn btn-secondary flex-1 !rounded-2xl !py-4" onClick={() => setShowAddForm(false)}>Dismiss</button>
                <button type="submit" className="btn btn-emerald flex-1 !rounded-2xl !py-4">{editingExpenseId ? "Update" : "Log"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
