import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const res = await client.post("/register", { name, username, password });
            if (res.status === httpStatus.CREATED) {
                return res.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const res = await client.post("/login", { username, password });
            if (res.status === httpStatus.OK) {
                localStorage.setItem("token", res.data.token);
                router("/home");
            }
        } catch (err) {
            throw err;
        }
    };

    const getHistoryOfUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${server}/api/v1/users/get_all_activity?token=${token}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
        console.error("❌ History is not an array", data);
        return [];
    }

    return data;
    };


    const addToUserHistory = async (meetingCode) => {
        try {
            const res = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return res;
        } catch (err) {
            throw err;
        }
    };

    const clearUserHistory = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${server}/api/v1/users/clear_history?token=${token}`, {
        method: "DELETE"
    });
    const data = await res.json();
    return data;
    };


    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory,
        clearUserHistory
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
