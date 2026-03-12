import { Context } from 'hono';
import { dbContext } from '../config/database';

/**
 * Adapter to allow Express-style controller methods to work with Hono
 * This handles the mapping of req, res, and next.
 */
export const expressToHono = (handler: any) => {
    return async (c: Context) => {
        // 1. Mock the Request object
        const req: any = {
            params: c.req.param(),
            query: c.req.query(),
            body: await (async () => {
                try {
                    return await c.req.json();
                } catch {
                    return {};
                }
            })(),
            headers: c.req.header(),
            method: c.req.method,
            path: c.req.path,
            url: c.req.url,
        };

        // 2. Mock the Response object
        let status = 200;
        let responseBody: any = null;
        let isFinished = false;

        const res: any = {
            status: (s: number) => {
                status = s;
                return res;
            },
            json: (data: any) => {
                responseBody = data;
                isFinished = true;
                return res;
            },
            send: (data: any) => {
                responseBody = data;
                isFinished = true;
                return res;
            },
            end: () => {
                isFinished = true;
                return res;
            }
        };

        // 3. Mock Next function
        let nextCalled = false;
        let nextError: any = null;
        const next = (err?: any) => {
            nextCalled = true;
            nextError = err;
        };

        // Run the handler
        try {
            await handler(req, res, next);
        } catch (err) {
            nextError = err;
        }

        if (nextError) {
            throw nextError;
        }

        if (isFinished) {
            if (typeof responseBody === 'object') {
                return c.json(responseBody, status as any);
            }
            return c.text(responseBody, status as any);
        }

        return c.text('Not Found', 404);
    };
};

/**
 * Middleware to set the D1 database instance in AsyncLocalStorage
 */
export const d1Middleware = () => {
    return async (c: Context, next: any) => {
        const db = c.env.DB as D1Database;
        if (!db) {
            console.error('D1 Database binding (env.DB) not found!');
            return c.text('Internal Server Error: DB not bound', 500);
        }
        return dbContext.run(db, next);
    };
};
