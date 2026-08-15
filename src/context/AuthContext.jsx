import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] =
    useState(true);

  /* ========================================
     RESTORE LOGIN AFTER PAGE REFRESH
  ======================================== */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("biterush-user");

      const storedToken =
        localStorage.getItem("biterush-token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error(
        "Unable to restore login:",
        error
      );

      localStorage.removeItem(
        "biterush-user"
      );

      localStorage.removeItem(
        "biterush-token"
      );
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /* ========================================
     LOGIN
  ======================================== */

  async function login(email, password) {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to log in."
      );
    }

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem(
      "biterush-user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "biterush-token",
      data.token
    );

    return data;
  }

  /* ========================================
     REGISTER
  ======================================== */

  async function register(
    fullName,
    email,
    password
  ) {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to create account."
      );
    }

    return data;
  }

  /* ========================================
     LOGOUT
  ======================================== */

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      "biterush-user"
    );

    localStorage.removeItem(
      "biterush-token"
    );
  }

  const isAuthenticated =
    Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}