import express from "express";
import checkCookies from "../middleware/checkCookies.js";
import { googleAuthUrl, googleCallback, googleDriveStatus, googleDriveDisconnect } from "../controller/googleDriveController.js";


const router = express.Router();

router.get("/connect", checkCookies, googleAuthUrl)
router.get("/callback", checkCookies, googleCallback)
router.get("/status", checkCookies, googleDriveStatus)
router.post("/disconnect", checkCookies, googleDriveDisconnect)

export default router;
