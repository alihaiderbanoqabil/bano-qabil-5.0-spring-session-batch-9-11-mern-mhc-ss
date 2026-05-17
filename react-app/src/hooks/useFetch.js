import { useEffect, useState, useRef } from "react";

// export const useFetch = (url, options = {}) => {
//     const [data, setData] = useState([]);
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const abortRef = useRef(null);

//     useEffect(() => {
//         if (!url) return;

//         // cancel previous request
//         if (abortRef.current) {
//             abortRef.current.abort();
//         }

//         const controller = new AbortController();
//         abortRef.current = controller;

//         let isCurrent = true;

//         const fetchData = async () => {
//             setIsLoading(true);
//             setError("");

//             try {
//                 const res = await fetch(url, {
//                     ...options,
//                     signal: controller.signal,
//                 });

//                 const result = await res.json();

//                 if (isCurrent) {
//                     setData(result);
//                 }
//             } catch (err) {
//                 if (err.name !== "AbortError" && isCurrent) {
//                     setError(err.message);
//                 }
//             } finally {
//                 if (isCurrent) {
//                     setIsLoading(false);
//                 }
//             }
//         };

//         fetchData();

//         return () => {
//             isCurrent = false;
//             controller.abort();
//         };
//     }, [url]);

//     return { data, error, isLoading };
// };

export const useFetch = (url, options = {}) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!url) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError("");

            try {
                const res = await fetch(url, options);
                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, error, isLoading };
};