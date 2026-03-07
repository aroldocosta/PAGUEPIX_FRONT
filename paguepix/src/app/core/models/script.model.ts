export interface Script {
    id: string | number;
    code: string;
    type: string;
    description: string;
}

export interface ScriptRequest {
    code: string;
    type: string;
    description: string;
}

export interface ScriptResponse {
    id: string | number;
    code: string;
    type: string;
    description: string;
}
