import { Request, Response } from "express";

const STATUS_TEXT: Record<number, string> = {
	200: "OK",
	201: "Created",
	202: "Accepted",
	204: "No Content",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	409: "Conflict",
	500: "Internal Server Error",
	504: "Gateway Timeout",
};

const buildMeta = (req: Request) => ({
	url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
});

/**
 * Wraps a non-list response in the standard envelope:
 * { status, statusText, data: { message, data }, meta }
 */
export const sendSuccess = (
	req: Request,
	res: Response,
	statusCode: number,
	message: string,
	data: any = null
) => {
	return res.status(statusCode).json({
		status: statusCode,
		statusText: STATUS_TEXT[statusCode] || "OK",
		data: {
			message,
			data,
		},
		meta: buildMeta(req),
	});
};

/**
 * Wraps an error response in the standard envelope:
 * { status, statusText, data: { message, data }, meta }
 */
export const sendError = (
	req: Request,
	res: Response,
	statusCode: number,
	message: string,
	data: any = null
) => {
	return res.status(statusCode).json({
		status: statusCode,
		statusText: STATUS_TEXT[statusCode] || "Error",
		data: {
			message,
			data,
		},
		meta: buildMeta(req),
	});
};

export interface PaginatedPayload {
	message: string;
	documents: any[];
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	totalDocuments: number;
}

/**
 * Wraps a list response in the standard paginated envelope:
 * { status, statusText, data: { message, pageNumber, pageSize, totalPages, totalDocuments, documents }, meta }
 */
export const sendPaginated = (
	req: Request,
	res: Response,
	payload: PaginatedPayload
) => {
	const {
		message,
		documents,
		pageNumber,
		pageSize,
		totalPages,
		totalDocuments,
	} = payload;
	return res.status(200).json({
		status: 200,
		statusText: STATUS_TEXT[200],
		data: {
			message,
			pageNumber,
			pageSize,
			totalPages,
			totalDocuments,
			documents,
		},
		meta: buildMeta(req),
	});
};

/**
 * Reads pagination params from the request query.
 * Supports both `limit` and `pageSize`. Falls back to sensible defaults.
 */
export const getPagination = (req: Request, defaultLimit = 20) => {
	const page = Math.max(parseInt(req.query.page as string) || 1, 1);
	const limit = Math.max(
		parseInt((req.query.limit as string) || (req.query.pageSize as string)) ||
			defaultLimit,
		1
	);
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

export const totalPages = (totalDocuments: number, pageSize: number) =>
	Math.max(Math.ceil(totalDocuments / pageSize), 1);
