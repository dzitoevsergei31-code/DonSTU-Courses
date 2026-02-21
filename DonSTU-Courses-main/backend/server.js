import express from 'express';
import cors from 'cors';
import http from 'http';
import "dotenv/config";
import './config/db.js'
import { authRouter } from './routes/authRoute.js';
import { courseRoute } from './routes/courseRoute.js';
import { achievementRouter } from './routes/achievementRoute.js';
import { notificationRouter } from './routes/notificationRoute.js';

// Configure Server
const app = express();
const server = http.createServer(app);

app.use(express.json({limit: "4mb"}));
app.use(cors());

// Routes
app.use("/api/status", (req, res) => res.send("server is working"));
app.use("/api/auth", authRouter);
app.use("/api/courses", courseRoute);
app.use('/api/achievements', achievementRouter);
app.use('/api/notifications', notificationRouter);

// Server starts
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT))