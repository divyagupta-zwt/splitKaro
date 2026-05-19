import { useEffect, useState } from "react"
import { getGroupSettlements, suggestSettlements } from "../services/api";

const useSettlements= (groupId)=> {
    const [suggestions, setSuggestions]= useState([]);
    const [history, setHistory]= useState([]);

    const fetchData = async (signal) => {
        try {
            const [suggest, hist] = await Promise.all([
                suggestSettlements(groupId, signal),
                getGroupSettlements(groupId, signal) 
            ]);
            setSuggestions(suggest.data);
            setHistory(hist.data.slice(0, 5)); // Keep only the latest 5 settlements
        } catch (error) {
            if(error.name !== "AbortError") {
                console.error("Failed to fetch settlements:", error);
            }
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        (async()=> {
            await fetchData(controller.signal);
        })();
        
        return () => controller.abort();
    });

    return {suggestions, history, refresh: fetchData};
};

export default useSettlements;