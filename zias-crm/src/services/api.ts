import type { ApiResponse, Customer, CustomerInput, User } from "../types";

// In-memory API that mirrors a Django REST Framework backend.
// To connect your Django backend later, replace these bodies with axios calls
// to your DRF endpoints (e.g. /api/customers/) and keep the same signatures.

const delay = (ms = 400): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const respond = async <T>(data: T, message = "OK"): Promise<ApiResponse<T>> => {
  await delay();
  return { data, message };
};

let customers: Customer[] = [
  { id: 1, name: "Aarav Menon", email: "aarav@acme.com", phone: "+91 98470 11223", company: "Acme Corp", status: "Active", createdAt: "2026-01-12T10:00:00Z" },
  { id: 2, name: "Priya Nair", email: "priya@nova.io", phone: "+91 90720 55481", company: "Nova Labs", status: "Lead", createdAt: "2026-02-03T09:30:00Z" },
  { id: 3, name: "Rahul Krishnan", email: "rahul@brightsoft.in", phone: "+91 98955 77012", company: "BrightSoft", status: "Active", createdAt: "2026-03-18T14:15:00Z" },
  { id: 4, name: "Meera Pillai", email: "meera@edge.dev", phone: "+91 94470 33340", company: "Edge Dev", status: "Inactive", createdAt: "2026-04-22T16:45:00Z" },
  { id: 5, name: "Vikram Iyer", email: "vikram@orbit.co", phone: "+91 97440 88765", company: "Orbit Co", status: "Lead", createdAt: "2026-05-30T11:20:00Z" },
];
let nextId = 6;

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<User>> => {
    await delay(700);
    if (username === "admin" && password === "admin123") {
      return { data: { username, token: "mock-jwt-token" }, message: "Logged in" };
    }
    throw new Error("Invalid username or password");
  },
};

export const customerApi = {
  list: () => respond<Customer[]>([...customers]),

  create: (input: CustomerInput) => {
    const customer: Customer = { ...input, id: nextId++, createdAt: new Date().toISOString() };
    customers = [customer, ...customers];
    return respond(customer, "Customer created");
  },

  update: (id: number, input: CustomerInput) => {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Customer not found");
    customers[index] = { ...customers[index], ...input };
    return respond(customers[index], "Customer updated");
  },

  remove: (id: number) => {
    customers = customers.filter((c) => c.id !== id);
    return respond(id, "Customer deleted");
  },
};
