import { io } from "socket.io-client";
import { ENV } from "@/config/env";

const socket = io(ENV.API_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
});

export default socket;