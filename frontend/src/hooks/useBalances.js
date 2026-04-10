/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useState, useEffect } from "react";
import { getGroupBalances } from "../services/api";

const useBalances=(groupId)=>{
    const [balances, setBalances]= useState([]);

    const fetchBalances= useCallback(async()=>{
        const res= await getGroupBalances(groupId);
        const bal= res.data;
        setBalances(bal);
    },[groupId]);

    useEffect(()=>{
        fetchBalances();
    }, [fetchBalances]);

    return {balances, refetch: fetchBalances};
};

export default useBalances;