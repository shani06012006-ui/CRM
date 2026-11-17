import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import CustomersPage from "./pages/CustomersPage";

export default function App() {
  const { user } = useAuth();
  return user ? <CustomersPage /> : <LoginPage />;
}
