export type CustomerStatus = "Lead" | "Active" | "Inactive";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  createdAt: string;
}

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface User {
  username: string;
  token: string;
}
