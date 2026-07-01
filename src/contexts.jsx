import { createContext, useContext } from "react";
import { THEMES } from "./theme";

// Mövzu konteksti (açıq/tünd)
export const ThemeCtx = createContext({ theme: THEMES.light, dark: false, setDark: () => {} });
export const useTh = () => useContext(ThemeCtx);

// Dil konteksti (AZ/EN)
export const LangCtx = createContext({ lang: "az", setLang: () => {}, t: (k) => k });
export const useT = () => useContext(LangCtx);

// Auth + state konteksti — istifadəçi, RBAC helperləri və qlobal state
export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// Toast notification konteksti
export const ToastCtx = createContext({ addToast: () => {} });
export const useToast = () => useContext(ToastCtx);
