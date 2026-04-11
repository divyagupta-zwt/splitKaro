/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { getGroup } from "../services/api";

const useGroup=(id)=>{
    const [group, setGroup]= useState(null);
    const [members, setMembers]= useState([]);

    const fetchGroup= useCallback(async()=>{
        const res= await getGroup(id);
        setGroup(res.data);
        setMembers(res.data.members || []);
    }, [id]);

    useEffect(()=>{
        fetchGroup();
    }, [fetchGroup]);

    return {group, members, refetch: fetchGroup};
};

export default useGroup;