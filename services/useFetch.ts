import { useEffect, useState } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async (): Promise<T | null> => {
        try {
            setLoading(true);
            setError(null);

            const result = await fetchFunction();
            setData(result);
            return result; // 🔥 ini tambahan
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error("An error occurred.");
            setError(errorObj);
            return null; // 🔥 biar aman saat await
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setLoading(false);
        setError(null);
    };

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, []);

    return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
