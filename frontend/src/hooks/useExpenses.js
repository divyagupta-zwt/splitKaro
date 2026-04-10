/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback } from "react";
import { useState } from "react";
import { getGroupExpenses } from "../services/api";
import { useEffect } from "react";

const useExpenses=(groupId)=>{
    const [expenses, setExpenses]= useState([]);

    const fetchExpenses= useCallback(async()=>{
        const res= await getGroupExpenses(groupId);
        setExpenses(res.data);
    }, [groupId]);

    useEffect(()=>{
        fetchExpenses();
    }, [fetchExpenses]);

    return {expenses, refetch: fetchExpenses};
};

export default useExpenses;