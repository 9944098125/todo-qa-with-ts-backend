"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalPages = exports.getPagination = exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const STATUS_TEXT = {
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
const buildMeta = (req) => ({
    url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
});
/**
 * Wraps a non-list response in the standard envelope:
 * { status, statusText, data: { message, data }, meta }
 */
const sendSuccess = (req, res, statusCode, message, data = null) => {
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
exports.sendSuccess = sendSuccess;
/**
 * Wraps an error response in the standard envelope:
 * { status, statusText, data: { message, data }, meta }
 */
const sendError = (req, res, statusCode, message, data = null) => {
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
exports.sendError = sendError;
/**
 * Wraps a list response in the standard paginated envelope:
 * { status, statusText, data: { message, pageNumber, pageSize, totalPages, totalDocuments, documents }, meta }
 */
const sendPaginated = (req, res, payload) => {
    const { message, documents, pageNumber, pageSize, totalPages, totalDocuments, } = payload;
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
exports.sendPaginated = sendPaginated;
/**
 * Reads pagination params from the request query.
 * Supports both `limit` and `pageSize`. Falls back to sensible defaults.
 */
const getPagination = (req, defaultLimit = 20) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || req.query.pageSize) ||
        defaultLimit, 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPagination = getPagination;
const totalPages = (totalDocuments, pageSize) => Math.max(Math.ceil(totalDocuments / pageSize), 1);
exports.totalPages = totalPages;
