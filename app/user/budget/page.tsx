"use client";

import { useState, useEffect } from "react";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { 
  fetchUserExpenses, 
  createUserExpense, 
  deleteUserExpense, 
  updateUserExpense, 
  updateProfileBudget 
} from "@/lib/db";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Plus, 
  Calendar, 
  Car, 
  Hotel, 
  Utensils, 
  Mountain, 
  ShoppingBag, 
  Box,
  BrainCircuit,
  Trash2,
  Edit2,
  AlertCircle,
  X
} from "lucide-react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const CATEGORIES = [
  { name: "Transport", color: "#1F2937", icon: <Car size={18} /> },
  { name: "Accommodation", color: "#A855F7", icon: <Hotel size={18} /> },
  { name: "Food", color: "#F97316", icon: <Utensils size={18} /> },
  { name: "Activities", color: "#10B981", icon: <Mountain size={18} /> },
  { name: "Shopping", color: "#EC4899", icon: <ShoppingBag size={18} /> },
  { name: "Miscellaneous", color: "#6B7280", icon: <Box size={18} /> },
];

export default function BudgetTracker() {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: "Food",
    amount: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      setLoading(true);
      try {
        const data = await fetchUserExpenses(profile.id);
        setExpenses(data as Expense[]);
        
        if ((profile as any).total_budget) {
          setTotalBudget((profile as any).total_budget);
        }
      } catch (err) {
        console.error("Failed to load expenses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const handleUpdateBudget = async (val: number) => {
    setTotalBudget(val);
    if (profile) {
      await updateProfileBudget(profile.id, val);
    }
  };

  const handleAddOrEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !profile) return;

    if (editingExpenseId) {
      const updates = {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
      };
      const updated = await updateUserExpense(editingExpenseId, profile.id, updates);
      if (updated) {
        setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? { ...exp, ...updates } : exp));
      }
    } else {
      const expense = {
        user_id: profile.id,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
      };
      const created = await createUserExpense(expense);
      if (created) {
        setExpenses([created as Expense, ...expenses]);
      }
    }

    setNewExpense({ category: "Food", amount: "", description: "" });
    setEditingExpenseId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (exp: Expense) => {
    setNewExpense({
      category: exp.category,
      amount: exp.amount.toString(),
      description: exp.description,
    });
    setEditingExpenseId(exp.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    if (confirm("Are you sure you want to delete this expense?")) {
      const ok = await deleteUserExpense(id, profile.id);
      if (ok) {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
      }
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const getCategoryStats = () => {
    return CATEGORIES.map(cat => {
      const amount = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, amount };
    }).filter(c => c.amount > 0);
  };

  const getAIInsights = () => {
    const insights = [];
    if (spentPercent > 90) {
      insights.push({ type: "danger", text: "Critical: You have used over 90% of your budget. Immediate spending reduction recommended." });
    } else if (spentPercent > 70) {
      insights.push({ type: "warning", text: "Warning: You're approaching your budget limit. Review upcoming activities." });
    }

    const foodExpense = expenses.filter(e => e.category === "Food").reduce((sum, e) => sum + e.amount, 0);
    if (foodExpense > totalBudget * 0.4) {
      insights.push({ type: "info", text: "Insight: Food accounts for over 40% of your budget. Consider local eateries to save." });
    }

    if (remaining > 0 && spentPercent < 50) {
      insights.push({ type: "success", text: "Great job! You're well within your budget. You might have extra for premium activities." });
    }

    if (insights.length === 0) {
      insights.push({ type: "info", text: "Analyzing your spending patterns... Start logging more expenses for deeper insights." });
    }
    return insights;
  };

  if (loading) return (
    <div className="space-y-10 animate-fade">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded-md" />
          <div className="skeleton h-12 w-64 rounded-2xl" />
        </div>
        <div className="skeleton h-14 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="card h-40 skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-[500px] skeleton" />
        <div className="card h-[500px] skeleton" />
      </div>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">Financial Analysis</p>
          <h1 className="m-0">Budget Tracker</h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-3 shadow-sm">
            <Wallet size={20} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Budget</span>
              <input 
                type="number" 
                value={totalBudget} 
                onChange={e => handleUpdateBudget(Number(e.target.value))}
                className="bg-transparent border-none text-slate-900 font-black text-lg focus:outline-none w-28 mt-1 p-0 h-auto leading-none"
              />
            </div>
          </div>
          <button 
            className="btn btn-emerald py-4 px-6 flex-1 md:flex-none"
            onClick={() => {
              setNewExpense({ category: "Food", amount: "", description: "" });
              setEditingExpenseId(null);
              setShowAddForm(true);
            }}
          >
            <Plus size={18} className="mr-2" /> Add Expense
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Investment So Far</p>
          <p className="stat-number text-rose-500">{formatPKR(totalSpent)}</p>
          <div className="mt-6">
            <div className="w-full h-2 bg-slate-100 rounded-md overflow-hidden">
              <div 
                className="h-full rounded-md transition-all duration-500" 
                style={{ 
                  width: `${spentPercent}%`, 
                  background: spentPercent > 90 ? "#EF4444" : spentPercent > 70 ? "#F97316" : "#10B981" 
                }} 
              />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter mt-3">{spentPercent.toFixed(1)}% of budget utilized</p>
          </div>
        </div>

        <div className="stat-card">
          <p className="stat-label">Available Balance</p>
          <p className={`stat-number ${remaining < 0 ? "text-rose-500" : "text-emerald-500"}`}>
            {formatPKR(remaining)}
          </p>
          <div className="mt-6 flex items-center gap-2">
            {remaining < 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-lg">
                <TrendingDown size={14} className="text-rose-500" /> 
                <span className="text-[10px] font-black text-rose-600 uppercase">Over Limit</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg">
                <TrendingUp size={14} className="text-emerald-500" /> 
                <span className="text-[10px] font-black text-emerald-600 uppercase">Sustainable</span>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <p className="stat-label">Major Outflow</p>
          {expenses.length > 0 ? (
            (() => {
              const top = getCategoryStats().sort((a,b) => b.amount - a.amount)[0];
              return (
                <>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                      {top.icon}
                    </div>
                    <p className="text-lg font-black text-slate-900 leading-tight">{top.name}</p>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter mt-6">
                    {formatPKR(top.amount)} in this category
                  </p>
                </>
              );
            })()
          ) : (
            <p className="stat-number text-slate-200">—</p>
          )}
        </div>

        {/* AI Insight Card */}
        <div className="card-premium bg-slate-900 border-none relative overflow-hidden group p-8">
          <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <BrainCircuit size={100} className="text-emerald-400" />
          </div>
          <p className="stat-label text-slate-500">AI Intelligence</p>
          <div className="mt-4 space-y-3 relative z-10">
            {getAIInsights().map((insight, i) => (
              <div key={i} className="flex gap-3 items-start animate-fade" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="mt-1 shrink-0">
                  <AlertCircle size={14} className={
                    insight.type === 'danger' ? 'text-rose-400' : 
                    insight.type === 'warning' ? 'text-orange-400' : 'text-emerald-400'
                  } />
                </div>
                <p className="text-[12px] font-bold leading-relaxed text-slate-300">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses List */}
        <div className="card">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Calendar size={22} className="text-emerald-500" />
              Transaction Log
            </h2>
            <button className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Export Data</button>
          </div>
          <div className="space-y-3 custom-scrollbar max-h-[500px] overflow-y-auto pr-2">
            {expenses.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                <Box size={48} />
                <p className="text-sm font-bold uppercase tracking-widest">No entries recorded</p>
              </div>
            ) : (
              expenses.map(exp => {
                const cat = CATEGORIES.find(c => c.name === exp.category);
                return (
                  <div key={exp.id} className="group flex items-center gap-4 p-5 bg-white hover:bg-slate-50 border border-gray-100 rounded-2xl transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ring-1 ring-slate-100" style={{ backgroundColor: `${cat?.color}10`, color: cat?.color }}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-bold truncate">{exp.description || exp.category}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {exp.category} • {new Date(exp.date).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{formatPKR(exp.amount)}</p>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity mt-2 justify-end">
                        <button onClick={() => handleEditClick(exp)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown Chart Area */}
        <div className="card">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <PieChart size={22} className="text-emerald-500" />
              Resource Allocation
            </h2>
          </div>
          <div className="space-y-8">
            {getCategoryStats().length === 0 ? (
              <div className="py-20 text-center opacity-30 italic font-bold">Sync your expenses to unlock visualization.</div>
            ) : (
              getCategoryStats().map((cat, idx) => (
                <div key={cat.name} className="animate-fade" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">{formatPKR(cat.amount)}</span>
                      <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">({((cat.amount / totalSpent) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-50 rounded-md overflow-hidden p-[2px]">
                    <div 
                      className="h-full rounded-md shadow-sm transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)" 
                      style={{ 
                        width: `${(cat.amount / totalSpent) * 100}%`, 
                        backgroundColor: cat.color 
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 p-6 rounded-3xl bg-slate-900/5 border border-dashed border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                <BrainCircuit size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Optimization Goal</p>
                <p className="text-xs text-slate-500 font-medium">Targeting 15% reduction in Transport next month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade" onClick={() => setShowAddForm(false)}>
          <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-2xl w-full max-w-[500px] relative animate-scale" onClick={e => e.stopPropagation()}>
            <button className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={() => setShowAddForm(false)}>
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-8">
              {editingExpenseId ? "Edit Outflow" : "New Transaction"}
            </h2>
            
            <form onSubmit={handleAddOrEditExpense} className="space-y-6">
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                <select 
                  className="input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:16px] bg-[right_20px_center] bg-no-repeat" 
                  value={newExpense.category} 
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount (PKR)</label>
                <input className="input font-black text-lg" type="number" placeholder="0.00" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              </div>
              
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reference / Description</label>
                <input className="input" placeholder="What was this for?" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddForm(false)}>Dismiss</button>
                <button type="submit" className="btn btn-emerald flex-1 shadow-lg shadow-emerald-500/30">
                  {editingExpenseId ? "Confirm Update" : "Log Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
