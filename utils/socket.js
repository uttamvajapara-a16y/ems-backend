const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
    const getRoomId = (senderId, receiverId) => {
        return crypto.createHash('sha256').update([senderId, receiverId].sort().join(':')).digest("hex");
    }

    const io = socket(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                process.env.FRONTEND_PRODUCTION_LINK,
                process.env.FRONTEND_PRODUCTION_LINK2
            ],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstName, lastName, senderId, receiverId }) => {
            const roomId = getRoomId(senderId, receiverId);
            socket.join(roomId);
        })

        socket.on("sendMessage", async ({ senderId, receiverId, senderModel, receiverModel, text }) => {
            try {
                const roomId = getRoomId(senderId, receiverId);
                // let chat = await Chat.find({senderId, receiverId}) ;
                const chat = await Chat.create({
                    senderId,
                    receiverId,
                    senderModel,
                    receiverModel,
                    text
                });

                io.to(roomId).emit("messageReceived", {
                    senderId,
                    receiverId,
                    senderModel,
                    receiverModel,
                    text,
                    createdAt: chat.createdAt,
                })

            } catch (err) {
                return res.status(400).json({ success: false, message: "Error in loading chats" })
            }
        })

        socket.on("disconnect", () => {
            // console.log("User Disconnected");
        })
    })
}

module.exports = initializeSocket;