import auth from "./auth.js";
import job from "./job.js"
import candidate from "./candidate.js";

const routes = (app) => {
    app.use("/api/auth", auth);
    app.use("/api/job", job)
    app.use("/api/candidate", candidate)
};

export default routes

