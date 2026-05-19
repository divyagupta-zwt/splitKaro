import { useState } from "react";
import { getGroupExpenses } from "../services/api";
import { useEffect } from "react";

const useExpenses=(groupId)=>{
    const [expenses, setExpenses]= useState([]);

    const fetchExpenses = async (signal) => {
        try {
            const res = await getGroupExpenses(groupId, signal);
            setExpenses(res.data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        (async () => {
            await fetchExpenses(controller.signal);
        })();
        return () => controller.abort();
    });

    return {expenses, refetch: fetchExpenses};
};

export default useExpenses;