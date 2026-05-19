import { useEffect, useState } from "react";
import { getGroup } from "../services/api";

const useGroup=(id)=>{
    const [group, setGroup]= useState(null);
    const [members, setMembers]= useState([]);

    const fetchGroup = async (signal) => {
        try {
            const res = await getGroup(id, signal);
            setGroup(res.data);
            setMembers(res.data.members || []);
        } catch (error) {
            console.error("Failed to fetch group:", error);
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        (async () => {
            await fetchGroup(controller.signal);
        })();
        return () => controller.abort();
    }, [id]);

    return {group, members, refetch: fetchGroup};
};

export default useGroup;