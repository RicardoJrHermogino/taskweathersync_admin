import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login page
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Or your loading component
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}