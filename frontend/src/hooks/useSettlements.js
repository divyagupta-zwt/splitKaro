/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react"
import { getGroupSettlements, suggestSettlements } from "../services/api";

const useSettlements= (groupId)=> {
    const [suggestions, setSuggestions]= useState([]);
    const [history, setHistory]= useState([]);

    const fetchData= useCallback(async()=>{
        const [suggest, hist]= await Promise.all([
            suggestSettlements(groupId),
            getGroupSettlements(groupId) 
        ]);
        setSuggestions(suggest);
        setHistory(hist);
    }, [groupId]);

    useEffect(()=>{
        fetchData();
    }, [fetchData]);

    return {suggestions, history, refresh: fetchData};
};

export default useSettlements;