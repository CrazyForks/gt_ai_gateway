export interface ConfigMap {
    cch_rewrite_enabled: string;
    responses_prompt_cache_key_enabled: string;
    host_key: string;
    [key: string]: string;
}

export interface UpdateConfigRequest {
    cch_rewrite_enabled?: string;
    responses_prompt_cache_key_enabled?: string;
    host_key?: string;
    [key: string]: string | undefined;
}
