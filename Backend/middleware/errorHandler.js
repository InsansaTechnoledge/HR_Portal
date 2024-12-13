module.exports = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === "UnauthorizedError") {
      return res.status(401).json({ message: "Unauthorized" });
    } else if (err.name === "NotFoundError") {
      return res.status(404).json({ message: "Resource not found" });
    } else if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
  
    res.status(500).json({ message: "Internal server error" });
  };
  