import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api`,
});

export const AuthProvider = ({ children }) => {

  const [userData, setUserData] = useState(null);

  const router = useNavigate();

  /* ================= REGISTER ================= */

  const handleRegister = async (name, username, password) => {
    try {

      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response.status === httpStatus.CREATED) {
        return response;
      }

    } catch (err) {
      console.error("Registration error:", err);
      // Provide better error messages
      if (err.message === "Network Error") {
        // eslint-disable-next-line no-throw-literal
        throw {
          response: {
            data: {
              message: "Cannot connect to server. Make sure the backend is running at " + server
            }
          }
        };
      }
      throw err;
    }
  };

  /* ================= LOGIN ================= */

  const handleLogin = async (username, password) => {
    try {

      const response = await client.post("/login", {
        username,
        password,
      });

      if (response.status === httpStatus.OK) {

        localStorage.setItem("token", response.data.token);

        setUserData(response.data.user);

        router("/home");

        return response;
      }

    } catch (err) {
      console.error("Login error:", err);
      // Provide better error messages
      if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
        // eslint-disable-next-line no-throw-literal
        throw {
          response: {
            data: {
              message: "Cannot connect to server. Make sure the backend is running at " + server
            }
          }
        };
      }
      throw err;
    }
  };

  /* ================= USER HISTORY ================= */

  const getHistoryOfUser = async () => {
    try {

      const response = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });

      return response.data;

    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  /* ================= ADD HISTORY ================= */

  const addToUserHistory = async (meetingCode) => {
    try {

      const response = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });

      return response;

    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};