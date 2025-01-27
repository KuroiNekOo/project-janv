import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";

import errorMiddleware from './middlewares/error.middleware.js';
import router from './routers/index.js';
import authMiddleware from "./middlewares/auth.middleware.js";

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:4200'
    : 'https://skillforge.keyce.fr',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('dist'));

app.use(authMiddleware);

app.use(router);

app.use(errorMiddleware);

export default app;
