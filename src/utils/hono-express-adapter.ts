import { Context } from 'hono';

/**
 * Adapter to allow Express-style controller methods to work with Hono
 * This handles the mapping of req, res, and next.
 */
export const expressToHono = (handler: any) => {
    return async (c: Context, honoNext?: any) => {
        // 1. Mock the Request object
        // Use a cache for the body to prevent multiple reads of the stream
        const cachedBody = (c as any)._cachedBody;
        const body = cachedBody || await (async () => {
            if (['GET', 'HEAD'].includes(c.req.method)) return {};
            try {
                const b = await c.req.json();
                (c as any)._cachedBody = b;
                return b;
            } catch {
                return {};
            }
        })();

        const req: any = {
            params: c.req.param(),
            query: c.req.query(),
            body: body,
            headers: c.req.header(),
            method: c.req.method,
            path: c.req.path,
            url: c.req.url,
            // Carry over user state from previous middleware if it exists
            user: (c as any).user || null
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
            },
            locals: {}
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

        if (nextCalled && honoNext) {
            // Pass state (like req.user) from mock req to Hono context
            if (req.user) (c as any).user = req.user;
            return await honoNext();
        }

        return c.text('Not Found', 404);
    };
};
