import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Visits } from "@/api/entities";

export default function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    Visits.log(pathname);
  }, [pathname]);

  return null;
}
