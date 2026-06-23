import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { auditRouter } from "./routes/audit.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running..."
    });
});

app.use("/api/v1/audit", auditRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});