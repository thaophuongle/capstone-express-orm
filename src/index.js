import express from "express";
import rootRouter from "./routes/rootRouter.js";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.static("."));

app.listen(8080);
app.use(rootRouter);
