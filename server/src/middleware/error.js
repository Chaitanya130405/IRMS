export const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err?.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier" });
  }
  if (err?.name === "ValidationError") {
    const message = Object.values(err.errors)[0]?.message || "Invalid request data";
    return res.status(400).json({ message });
  }
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    const message = fields.includes("email")
      ? "Email already registered"
      : fields.includes("jobId")
        ? "Job ID already exists"
        : fields.includes("candidate") && fields.includes("job")
          ? "You have already applied for this job"
          : "A record with these details already exists";
    return res.status(409).json({
      message,
    });
  }
  res
    .status(err.statusCode || 500)
    .json({
      message: err.isOperational ? err.message : "Internal server error",
    });
};
