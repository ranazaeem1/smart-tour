"use client";
import { useState, useEffect } from "react";
import { formatPKR } from "@/lib/data";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const CATEGORIES = [
  { name: "Transport", color: "#14D2BE", icon: "🚗" },
  { name: "Accommodation", color: "#7C3AED", icon: "🏨" },
  { name: "Food", color: "#F59E0B", icon: "🍱" },
  { name: "Activities", color: "#10B981", icon: "🏔️" },
  { name: "Shopping", color: "#EC4899", icon: "🛍️" },
  { name: "Miscellaneous", color: "#6B7280", icon: "📦" },
];

export default function BudgetTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(100000);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: "Food",
    amount: "",
    description: "",
  });

  useEffect(() => {
    setExpenses([
      { id: "1", category: "Transport", amount: 15000, description: "Fuel & Jeep Rental", date: "2024-04-20" },
      { id: "2", category: "Accommodation", amount: 25000, description: "Hunza Serena Hotel", date: "2024-04-21" },
      { id: "3", category: "Food", amount: 5000, description: "Cafe de Hunza", date: "2024-04-22" },
    ]);
  }, []);

  const handleAddOrEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;

    if (editingExpenseId) {
      setExpenses(prev =>
        prev.map(exp =>
          exp.id === editingExpenseId
            ? {
                ...exp,
                category: newExpense.category,
                amount: parseFloat(newExpense.amount),
                description: newExpense.description,
              }
            : exp
        )
      );
    } else {
      const expense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: new Date().toISOString().split("T")[0],
      };
      setExpenses([expense, ...expenses]);
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = Math.min((totalSpent / totalBudget) * 100, 100);

  const getCategoryStats = () => {
    return CATEGORIES.map(cat => {
      const amount = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, amount };
    }).filter(c => c.amount > 0);
  };

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Manage your travel spending</div>
          <h1 className="topbar-title">💰 Budget Tracker</h1>
        </div>
        <div className="topbar-actions">
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-glass)", padding: "4px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Budget:</span>
            <input 
              type="number" 
              value={totalBudget} 
              onChange={e => setTotalBudget(Number(e.target.value))}
              style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 800, width: 80, fontSize: 14, outline: "none" }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => {
            setNewExpense({ category: "Food", amount: "", description: "" });
            setEditingExpenseId(null);
            setShowAddForm(true);
          }}>+ Add Expense</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="card">
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Total Spent</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--rose)" }}>{formatPKR(totalSpent)}</div>
          <div style={{ marginTop: 12 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${spentPercent}%`, background: spentPercent > 90 ? "var(--rose)" : "var(--teal)" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{spentPercent.toFixed(1)}% of budget used</div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Remaining Balance</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: remaining < 0 ? "var(--rose)" : "var(--emerald)" }}>{formatPKR(remaining)}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
            {remaining < 0 ? "⚠️ You are over budget!" : "✅ You are within budget"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Top Expense</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {expenses.length > 0 ? CATEGORIES.find(c => c.name === [...expenses].sort((a,b) => b.amount - a.amount)[0].category)?.icon : "—"}
            {" "}
            {expenses.length > 0 ? [...expenses].sort((a,b) => b.amount - a.amount)[0].category : "No data"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
            Largest single spending category
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>📋 Recent Expenses</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {expenses.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                No expenses logged yet.
              </div>
            )}
            {expenses.map(exp => {
              const cat = CATEGORIES.find(c => c.name === exp.category);
              return (
                <div key={exp.id} className="group" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat?.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {cat?.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{exp.description || exp.category}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{exp.category} · {exp.date}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{formatPKR(exp.amount)}</div>
                  
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleEditClick(exp)}
                      className="text-white/40 hover:text-blue-400 p-1 rounded-md transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(exp.id)}
                      className="text-white/40 hover:text-red-400 p-1 rounded-md transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>📊 Spending by Category</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {getCategoryStats().length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Add expenses to see breakdown.
              </div>
            )}
            {getCategoryStats().map(cat => (
              <div key={cat.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{cat.icon}</span>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {formatPKR(cat.amount)} ({((cat.amount / totalSpent) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(cat.amount / totalSpent) * 100}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
              {editingExpenseId ? "Edit Expense" : "Add New Expense"}
            </h2>
            <form onSubmit={handleAddOrEditExpense} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Amount (PKR)</label>
                <input className="input" type="number" placeholder="e.g. 5000" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input className="input" placeholder="e.g. Lunch at Mountain View" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {editingExpenseId ? "Save Changes" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
