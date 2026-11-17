import { useCallback, useEffect, useState } from "react";
import { customerApi } from "../services/api";
import type { Customer, CustomerInput } from "../types";
import { getErrorMessage } from "../utils";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerApi.list();
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (input: CustomerInput, id?: number): Promise<void> => {
    if (id !== undefined) {
      await customerApi.update(id, input);
    } else {
      await customerApi.create(input);
    }
    await refresh();
  };

  const remove = async (id: number): Promise<void> => {
    await customerApi.remove(id);
    await refresh();
  };

  return { customers, loading, error, save, remove };
}
