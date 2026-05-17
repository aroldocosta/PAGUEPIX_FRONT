export interface ScriptSummaryResponse {
    id: string | number;
    name: string;
    type: string;
}

export interface ScriptDetailResponse {
    id: string | number;
    name: string;
    type: string;
    description?: string;
}

export interface ScriptRequest {
    id?: string | number;
    name: string;
    type: string;
    description: string;
}

export interface ScriptResponse extends ScriptDetailResponse {}
export interface Script extends ScriptDetailResponse {}

