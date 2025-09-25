import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().role === "admin");
      } else {
        setIsAdmin(false);
      }
    };
    fetchRole();
  }, [currentUser]);

  if (loading || isAdmin === null) return null;
  return isAdmin ? children : <Navigate to="/" replace />;
}
