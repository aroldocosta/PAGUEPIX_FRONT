import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import JSONBig from 'json-bigint';

// Configure json-bigint to parse big numbers as strings instead of BigNumber objects
const JSONBigString = JSONBig({ storeAsString: true });

export const jsonBigIntInterceptor: HttpInterceptorFn = (req, next) => {
    // If expecting JSON, we need to intercept the response as 'text' to prevent Angular's default JSON.parse
    if (req.responseType === 'json') {
        const textReq = req.clone({ responseType: 'text' });

        return next(textReq).pipe(
            map(event => {
                if (event instanceof HttpResponse && typeof event.body === 'string') {
                    try {
                        // Parse the raw JSON text with json-bigint to preserve 64-bit integers as strings
                        const parsedBody = JSONBigString.parse(event.body);
                        return event.clone({ body: parsedBody });
                    } catch (e) {
                        // If parsing fails (e.g., empty body or invalid JSON), return the original text
                        return event;
                    }
                }
                return event;
            })
        );
    }

    return next(req);
};
