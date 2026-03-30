import axios from "axios";

const API = axios.create({
    baseURL: "https://grocery-store-backend-dc6p.onrender.com/api"
});

export default API;