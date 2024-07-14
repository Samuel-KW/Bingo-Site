import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authentication.tsx";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

	if (!auth?.session) {

		// user is not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};