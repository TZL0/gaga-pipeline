import { createContext, useContext, useRef } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const popupStackRef = useRef([]);

  return (
    <AppContext.Provider value={{ popupStackRef }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
