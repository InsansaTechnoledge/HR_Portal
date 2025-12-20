import express from "express";
import checkCookies from "../middleware/checkCookies.js";
import { googleAuthUrl, googleCallback } from "../controller/googleDriveController.js";


const router = express.Router();

router.get("/connect", checkCookies, googleAuthUrl)
router.get("/callback", checkCookies, googleCallback)

export default router;
