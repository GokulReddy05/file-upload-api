import "dotenv/config";
import express from "express";
import pool from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import documentRoute from "./routes/documentRoute.js"


const app = express()

app.use(express.json())


app.use('/auth',authRouter);
app.use('/document',documentRoute);


app.get("/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})