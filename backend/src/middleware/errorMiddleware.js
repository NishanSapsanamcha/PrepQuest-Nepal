class ApiError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
	}
}

const notFound = (req, res, next) => {
	next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || err.status || 500;
	const message = err.message || "Internal server error";

	if (res.headersSent) {
		return next(err);
	}

	if (err.name === "SequelizeUniqueConstraintError") {
		return res.status(409).json({
			success: false,
			message: "This record already exists",
			errors: err.errors?.map((error) => error.message) || []
		});
	}

	if (err.name === "SequelizeValidationError") {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: err.errors?.map((error) => error.message) || []
		});
	}

	return res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
	});
};

export { ApiError, errorHandler, notFound };
