import { createContext, useContext, useReducer } from "react";

const FAKE_USER = {
  name: "Tanush",
  email: "tanushdeshpande07@gmail.com",
  password: "Tanush@344",
  avatar: "https://i.pravatar.cc/100?u=zz",
};

const AuthContext = createContext(); // Corrected the capitalization for consistency
const initialState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...state, user: null, isAuthenticated: false };
    default:
      throw new Error("Unkown action");
  }
}

function AuthProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );
  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({ type: "login", payload: FAKE_USER.name });
    }
  }
  function logout() {
    dispatch({ type: "logout" });
  }
  // Added the value prop to the Provider, typically you would pass auth-related data here
  return (
    <AuthContext.Provider
      value={{ user, FAKE_USER, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
