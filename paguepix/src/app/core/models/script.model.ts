export interface Script {
    id: string | number;
    name: string;
    code: string;
    type: string;
    description: string;
}

export interface ScriptRequest {
    name: string;
    code: string;
    type: string;
    description: string;
}

export interface ScriptResponse {
    id: string | number;
    name: string;
    code: string;
    type: string;
    description: string;
}
