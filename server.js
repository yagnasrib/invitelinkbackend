const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auths");
const messageRoutes = require("./routes/messages");
const pollRoutes = require("./routes/polls");
const inviteRoutes = require("./routes/inviteRoutes");
const Message = require("./routes/messages"); // Assuming you have this model
const crypto = require("crypto"); // For generating a random string
require("dotenv").config();

const app = express();

// CORS setup for API routes (this will allow requests from both localhost:3000 and localhost:3002)
const corsOptions = {
  origin: ["https://invitelinkfrontend-4yz18tjg1-yagnasree128-ballanis-projects.vercel.app"],  // Add both frontend URLs
  methods: ["GET", "POST"],
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));  // Apply CORS to API routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to DB:", err));

// API Routes
app.use("/api/auths", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/invite", inviteRoutes);

// // Generate invite link route
// API endpoint to generate invite link
app.post("/api/invites/generate-invite", async (req, res) => {
  try {
    const { chatId } = req.body

    // Validate chatId
    if (!chatId) {
      console.log("Missing chatId in request:", req.body) // Debug log
      return res.status(400).json({ error: "Chat ID is required" })
    }

    // Generate unique code
    const inviteCode = crypto.randomUUID()

    // Create new invite
    const newInvite = new Invite({
      chatId,
      inviteCode,
      createdAt: new Date(),
    })

    await newInvite.save()

    // Generate invite link
    const inviteLink =  `https://invitelinkfrontend-4yz18tjg1-yagnasree128-ballanis-projects.vercel.app/${inviteCode}`

    // Emit socket event
    io.emit("new-invite", { chatId, inviteLink })

    return res.status(201).json({ inviteLink })
  } catch (error) {
    console.error("Error generating invite:", error)
    return res.status(500).json({ error: "Failed to generate invite" })
  }
})


// Start Server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

// Initialize Socket.IO with CORS settings for both frontend origins
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","https://invitelinkfrontend-4yz18tjg1-yagnasree128-ballanis-projects.vercel.app"], // Allow both frontend URLs
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials like cookies
  },
});

// Make io globally accessible
global.io = io;
global.onlineUsers = new Map();

// Socket.IO Configuration
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on("add-user", (userId) => {
    if (userId) {
      global.onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} added with socket ID: ${socket.id}`);
    }
  });

  // Handle real-time invites (to send the invite when it's created)
  socket.on("new-invite", (data) => {
    io.emit("new-invite", data);
    console.log("New invite sent to clients:", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        global.onlineUsers.delete(userId);
        break;
      }
    }
  });
});
