import express from '..config/express';
import jobController from '../controller/jobController'

const router = express.router();

app.post("/post", jobController.postJob);