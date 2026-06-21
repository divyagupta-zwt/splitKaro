import { useState, useEffect } from "react";
import { getGroupBalances } from "../services/api";

const useBalances=(groupId)=>{
    const [balances, setBalances]= useState([]);

    const fetchBalances = async (signal) => {
        try {
            const res = await getGroupBalances(groupId, signal);
            setBalances(res.data);
        } catch (error) {
            if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED' || String(error?.message).toLowerCase().includes('canceled') || String(error?.message).toLowerCase().includes('aborted')) {
                return;
            }
            console.error("Failed to fetch balances:", error);
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        (async () => {
            await fetchBalances(controller.signal);
        })();
        return () => controller.abort();
    }, [groupId]);

    return {balances, refetch: fetchBalances};
};

export default useBalances;