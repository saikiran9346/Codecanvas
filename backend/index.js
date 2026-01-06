// server.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const socketIo = require("socket.io");
const cors = require("cors");
const Message = require("./models/messageModel.js");
const connectDB = require("./config/db");
const loginRoute = require("./routes/LoginRoute.js");
const solutionsRoute = require("./routes/Solutions.js");
const profileRoute = require("./routes/Profile.js");
const socketHandler = require("./socketHandler");
const User = require("./models/UserModel.js");
const discussionsRoute = require("./routes/Discussions.js");
const contestsRoute = require("./routes/Contests.js");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Keeping this in case you use it
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});
app.use(express.json());

// routes
app.use("/", loginRoute);
app.use("/api/solutions", solutionsRoute);
app.use("/user", profileRoute);
app.use("/discussions", discussionsRoute);
app.use("/api/contests", contestsRoute);
app.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  if (!username || username.trim() === "") {
    return res.status(400).send([]);
  }
  try {
    const usersList = await User.find({
      Username: { $regex: `^${username}`, $options: "i" },
    }).select("_id Username"); // Only select _id and Username fields

    if (usersList && usersList.length > 0) {
      // Map to return array of objects with id and username
      const result = usersList.map((user) => ({
        id: user._id,
        username: user.Username,
      }));
      res.status(200).send(result);
    } else {
      res.status(404).send("No users found!");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.get("/ping", (req, res) => {
  res.json({ msg: "API is working !" });
});

socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
