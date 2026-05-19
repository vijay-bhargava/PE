import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useInternetChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.Worker) return;

    const worker = new Worker("worker/internetworker.js");

    worker.onmessage = (e) => {
      if (e.data === "offline") {
        console.warn("Internet lost. Redirecting to /no-internet");
        navigate("/no-internet");
      }
    };

    return () => worker.terminate();
  }, [navigate]);
};
