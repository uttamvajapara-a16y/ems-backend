const express = require("express") ;
const { userAuth } = require("../middleware/auth.middleware");
const { getContacts, getConversation, sendMessage, getUnreadCount } = require("../controllers/chatController");

const chatRouter = express.Router();

chatRouter.get("/chat/contacts", userAuth, getContacts);
chatRouter.get("/chat/unread-count", userAuth, getUnreadCount);
chatRouter.get("/chat/conversation/:userId", userAuth, getConversation); // specific route before :id-style ones — no conflict here since it's the only :userId route
chatRouter.post("/chat/send", userAuth, sendMessage);

module.exports = chatRouter;