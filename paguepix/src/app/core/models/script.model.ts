export interface Script {
    id: number;
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
    id: number;
    code: string;
    type: string;
    description: string;
}
