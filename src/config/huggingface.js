import axios from "axios";

const huggingface = axios.create({
  baseURL: "https://router.huggingface.co",
  headers: {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default huggingface;
