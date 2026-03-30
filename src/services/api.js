import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5001/api" 
        : "https://grocery-store-backend-dc6p.onrender.com/api"
});

export default API;