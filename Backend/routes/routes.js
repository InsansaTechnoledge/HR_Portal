const auth=require("./auth");
const job=require("./job")
module.exports = (app) => {
    app.use("/api/auth", auth);
    app.use("/job", job)
};