export type SortDirection = 'asc' | 'desc';

export function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
}

export function sortByField<T>(list: T[], field: string, direction: SortDirection): T[] {
    if (!list || list.length <= 1 || !field) return list || [];
    return [...list].sort((a, b) => {
        const valA = getNestedValue(a, field);
        const valB = getNestedValue(b, field);

        if (valA == null && valB == null) return 0;
        if (valA == null) return direction === 'asc' ? 1 : -1;
        if (valB == null) return direction === 'asc' ? -1 : 1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return direction === 'asc' ? valA - valB : valB - valA;
        }

        // Numerical strings (e.g. monetary values or IDs that are digits)
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
            return direction === 'asc' ? numA - numB : numB - numA;
        }

        // Date detection
        if (typeof valA === 'string' && typeof valB === 'string' && (valA.includes('-') || valA.includes('/')) && (valA.includes('T') || valA.includes(':'))) {
            const timeA = Date.parse(valA);
            const timeB = Date.parse(valB);
            if (!isNaN(timeA) && !isNaN(timeB)) {
                return direction === 'asc' ? timeA - timeB : timeB - timeA;
            }
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        const res = strA.localeCompare(strB, 'pt-BR', { numeric: true });
        return direction === 'asc' ? res : -res;
    });
}
