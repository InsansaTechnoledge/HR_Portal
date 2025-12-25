import auth from "./auth.js";
import job from "./job.js";
import candidate from "./candidate.js";
import documentupload from "./documentupload.js"; 
import user from "./user.js"
import employee from "./employee.js"
import payslip from "./paySlip.js";
import careerPortal from "./careerPortal.js";
import bulkUpload from "./bulkUpload.js";
import googleDriveRoute from "./googleDriveRoute.js";
import candidateApplicationRoute from "./candidateApplication.js";

const routes = (app) => {
    app.use("/api/auth", auth);
    app.use("/api/job", job);
    app.use("/api/candidate", candidate);
    app.use("/api/documents", documentupload); 
    app.use("/api/user", user); 
    app.use("/api/employee",employee);
    app.use("/api/payslip", payslip);
    app.use("/api/career-portal", careerPortal);
    app.use("/api/candidate-application", candidateApplicationRoute);
    app.use("/api/bulk-upload",bulkUpload)
    app.use("/api/google-drive",googleDriveRoute)

};

export default routes;
