import { createContext, useContext } from "react";
import { THEMES } from "./theme";

export const ThemeCtx = createContext({ theme: THEMES.light, dark: false, setDark: () => {} });
export const useTh = () => useContext(ThemeCtx);

export const LangCtx = createContext({ lang: "az", setLang: () => {}, t: (k) => k });
export const useT = () => useContext(LangCtx);

export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export const ToastCtx = createContext({ addToast: () => {} });
export const useToast = () => useContext(ToastCtx);
