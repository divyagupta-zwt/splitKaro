/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    return localStorage.getItem('selectedGroupId') || '1';
  });

  useEffect(() => {
    localStorage.setItem('selectedGroupId', selectedGroupId);
  }, [selectedGroupId]);

  return (
    <GroupContext.Provider value={{ selectedGroupId, setSelectedGroupId }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useSelectedGroup() {
  const context = useContext(GroupContext);
  return context;
}
