import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import "express-async-errors";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/users", userRoutes);

app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, () => console.log(`Server is listening on ${PORT}`))
  )
  .catch((error) => console.log(error));
