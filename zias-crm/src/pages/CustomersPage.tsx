import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCustomers } from "../hooks/useCustomers";
import CustomerForm from "../components/CustomerForm";
import type { Customer, CustomerInput, CustomerStatus } from "../types";
import { getErrorMessage } from "../utils";

type StatusFilter = CustomerStatus | "All";

const statusClass: Record<CustomerStatus, string> = {
  Lead: "badge badge-lead",
  Active: "badge badge-active",
  Inactive: "badge badge-inactive",
};

export default function CustomersPage() {
  const { user, logout } = useAuth();
  const { customers, loading, error, save, remove } = useCustomers();

  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selected, setSelected] = useState<Customer | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      customers.filter(
        (c) =>
          (filter === "All" || c.status === filter) &&
          `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase())
      ),
    [customers, search, filter]
  );

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "Active").length,
      leads: customers.filter((c) => c.status === "Lead").length,
    }),
    [customers]
  );

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const openNew = () => {
    setSelected(undefined);
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setSelected(customer);
    setShowForm(true);
  };

  const handleSave = async (input: CustomerInput) => {
    try {
      await save(input, selected?.id);
      setShowForm(false);
      notify(selected ? "Customer updated" : "Customer added");
    } catch (err) {
      notify(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      notify("Customer deleted");
    } catch (err) {
      notify(getErrorMessage(err));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">◆ ZIAS CRM</div>
        <nav>
          <div className="nav-item active">👥 Customers</div>
        </nav>
        <div className="user-box">
          <div className="muted">Signed in as</div>
          <strong>{user?.username}</strong>
          <button className="btn ghost full" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main>
        <header className="page-header">
          <div>
            <h1>Customers</h1>
            <p className="sub">Manage your relationships in one place</p>
          </div>
          <button className="btn primary" onClick={openNew}>+ New Customer</button>
        </header>

        <section className="stats">
          <StatCard label="Total customers" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Leads" value={stats.leads} />
        </section>

        <div className="toolbar">
          <input
            className="search"
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value as StatusFilter)}>
            <option value="All">All statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="table-card">
          {loading ? (
            <div className="empty">Loading customers...</div>
          ) : visible.length === 0 ? (
            <div className="empty">No customers found. Try a different search or add a new one.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="person">
                        <div className="avatar">{c.name.charAt(0)}</div>
                        <div>
                          <div>{c.name}</div>
                          <div className="muted">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.company}</td>
                    <td className="muted">{c.phone}</td>
                    <td><span className={statusClass[c.status]}>{c.status}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn ghost small" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn danger small" onClick={() => setToDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected ? "Edit Customer" : "New Customer"}</h2>
            <CustomerForm initial={selected} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {toDelete && (
        <div className="modal-overlay" onClick={() => setToDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete customer?</h2>
            <p className="sub">{toDelete.name} will be permanently removed.</p>
            <div className="form-actions">
              <button className="btn ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="btn danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
