import { useState, useEffect } from "react";
import { getGroupBalances } from "../services/api";

const useBalances=(groupId)=>{
    const [balances, setBalances]= useState([]);

    const fetchBalances = async (signal) => {
        try {
            const res = await getGroupBalances(groupId, signal);
            setBalances(res.data);
        } catch (error) {
            console.error("Failed to fetch balances:", error);
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        (async () => {
            await fetchBalances(controller.signal);
        })();
        return () => controller.abort();
    });

    return {balances, refetch: fetchBalances};
};

export default useBalances;