import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * Converte uma string snake_case para camelCase.
 * Ex: "payment_workflow_mode" → "paymentWorkflowMode"
 */
function snakeToCamel(key: string): string {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Percorre recursivamente o objeto/array convertendo todas as chaves de
 * snake_case para camelCase. Valores primitivos e datas são mantidos intactos.
 */
function convertKeysToCamel(value: any): any {
    if (Array.isArray(value)) {
        return value.map(convertKeysToCamel);
    }

    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        return Object.keys(value).reduce((acc: any, key) => {
            acc[snakeToCamel(key)] = convertKeysToCamel(value[key]);
            return acc;
        }, {});
    }

    return value;
}

/**
 * Interceptor global: transforma automaticamente todas as respostas JSON
 * recebidas do backend de snake_case → camelCase.
 *
 * Padrão de mercado: backend (Java/Spring) serializa em snake_case por
 * convenção do banco; o interceptor normaliza para camelCase, que é o
 * padrão JavaScript/TypeScript.
 *
 * Ordem de execução: deve vir APÓS o jsonBigIntInterceptor para que o
 * JSON já esteja parseado quando esta transformação ocorrer.
 */
export const camelCaseInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        map(event => {
            if (event instanceof HttpResponse && event.body !== null) {
                return event.clone({ body: convertKeysToCamel(event.body) });
            }
            return event;
        })
    );
};
