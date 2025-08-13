import { createContext, useContext } from "react";
import type { ToolsContextType } from "../context/ToolProvider";

export const ToolsContext = createContext<ToolsContextType | null>(null);

export const useTools = () => {
    const context = useContext(ToolsContext);
    if (!context) {
        throw new Error('Tools must be use in Tools provider');
    }
    return context;
};
