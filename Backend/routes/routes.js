import auth from "./auth.js";
import job from "./job.js"
const routes = (app) => {
    app.use("/api/auth", auth);
    app.use("/job", job)
};

export default routes

