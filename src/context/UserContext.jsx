"use client";

import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(() => {
    const savedUsername = localStorage.getItem("gameUsername");
    return savedUsername || "";
  });

  useEffect(() => {
    if (username) {
      localStorage.setItem("gameUsername", username);
    }
  }, [username]);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
