import { Context } from "hono";


class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public code?: string,
    ) {
        super(message);
        this.name = "AppError";
    }
}


class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}


function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}


const errorHandler = async (c: Context, next: () => Promise<void>) => {
    try {
        await next();
    } catch (error) {
        console.error("[ErrorHandler] Error caught:", error);

        if (isAppError(error)) {
            return c.json(
                {
                    error: error.message,
                    code: error.code,
                },
                error.statusCode,
            );
        }

        // 处理未知错误
        return c.json(
            {
                error: "Internal server error",
                message: String(error),
            },
            500,
        );
    }
};

export default {
    AppError,
    NotFoundError,
    isAppError,
    errorHandler,
};