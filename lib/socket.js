const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "https://sprightly-trifle-9b980c.netlify.app",
                "https://teal-daffodil-d3a9b2.netlify.app",
                "http://localhost:5173",
                "http://localhost:3000"
            ],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId && userId !== 'undefined') {
            socket.join(userId);
            console.log(`🔌 User connected to socket: ${userId}`);
        }

        socket.on("disconnect", () => {
            if (userId) {
                console.log(`🔌 User disconnected from socket: ${userId}`);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const sendNotification = (userId, eventType, payload) => {
    if (io) {
        io.to(userId.toString()).emit(eventType, payload);
        console.log(`📡 Socket notification sent to ${userId}: ${eventType}`);
    }
};

module.exports = { initSocket, getIO, sendNotification };
