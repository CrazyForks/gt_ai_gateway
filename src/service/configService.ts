import { SgConfig } from "../model/sgConfig";

export enum ConfigKey {
    CCH_REWRITE_ENABLED = "cch_rewrite_enabled",
    RESPONSES_PROMPT_CACHE_KEY_ENABLED = "responses_prompt_cache_key_enabled",
    HOST_KEY = "host_key",
}

export class ConfigItem {
    constructor(private readonly value: string | null | undefined, private readonly defaultValue: string) {}

    getString(): string {
        return this.value ?? this.defaultValue;
    }

    getBoolean(): boolean {
        const val = this.value ?? this.defaultValue;
        if (val === "true") return true;
        if (val === "false") return false;
        return false;
    }

    getNumber(): number {
        const val = this.value ?? this.defaultValue;
        if (!val || val.trim() === "") return 0;
        const num = Number(val);
        return Number.isFinite(num) ? num : 0;
    }
}

async function getConfig(name: ConfigKey | string, defaultValue: string = ""): Promise<ConfigItem> {
    const config = await SgConfig.query().where("name", name).first();
    return new ConfigItem(config?.value, defaultValue);
}

async function setValue(name: ConfigKey | string, value: string): Promise<SgConfig> {
    const config = await SgConfig.query().where("name", name).first();
    if (config) {
        await config.update({ value });
        return config;
    }

    return await SgConfig.query().create({ name, value });
}

async function getAll(): Promise<Record<string, string>> {
    const configs = await SgConfig.query().get();
    const result: Record<string, string> = {};
    for (const config of configs) {
        result[config.name] = config.value;
    }

    return result;
}

async function updateAll(data: Record<string, string>): Promise<Record<string, string>> {
    for (const [name, value] of Object.entries(data)) {
        await setValue(name, value);
    }

    return await getAll();
}

export default {
    getConfig,
    setValue,
    getAll,
    updateAll,
};
