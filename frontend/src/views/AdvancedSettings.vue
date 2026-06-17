<template>
    <div class="advanced-settings">
        <div class="page-header">
            <h2 class="page-title">高级设置</h2>
        </div>

        <a-spin :spinning="loading">
            <div class="settings-section">
                <h3 class="section-title">请求处理</h3>
                <div class="settings-list">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">强制改写 CCH</div>
                            <div class="setting-desc">启用后，系统会自动修改 claudecode 请求体中的 cch 值为默认固定值，用于修复无法命中缓存问题</div>
                        </div>
                        <div class="setting-action">
                            <a-switch
                                v-model:checked="form.cch_rewrite_enabled"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">Responses API Prompt Caching</div>
                            <div class="setting-desc">启用后，会在 Responses API 请求中自动注入 prompt_cache_key，优化缓存命中率</div>
                        </div>
                        <div class="setting-action">
                            <a-switch
                                v-model:checked="form.responses_prompt_cache_key_enabled"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="section-title">系统信息</h3>
                <div class="settings-list">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">本机唯一 ID (Host Key)</div>
                            <div class="setting-desc">用于区分不同实例的短标识，不可随意修改。如需重新生成，可清空后保存。</div>
                        </div>
                        <div class="setting-action">
                            <a-input
                                v-model:value="form.host_key"
                                style="width: 200px"
                                placeholder="留空自动生成"
                                :disabled="saving"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="section-title">系统更新</h3>
                <div class="settings-list">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-title">自动检测更新</div>
                            <div class="setting-desc">
                                当前版本：v{{ currentVersion }}
                                <span v-if="hasUpdate" style="color: var(--accent-primary); margin-left: 8px;">
                                    (发现新版本：{{ latestVersion }})
                                </span>
                                <span v-else-if="checkedUpdate" style="color: var(--text-secondary); margin-left: 8px;">
                                    (已是最新版本)
                                </span>
                            </div>
                        </div>
                        <div class="setting-action">
                            <a-button 
                                v-if="hasUpdate" 
                                type="primary" 
                                @click="openUpdateUrl"
                            >
                                下载更新
                            </a-button>
                            <a-button v-else :loading="checkingUpdate" @click="doCheckUpdate">
                                检查更新
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="page-actions">
                <a-button style="margin-right: 12px" :disabled="!isDirty || saving" @click="cancelChanges">
                    取消修改
                </a-button>
                <a-button type="primary" :loading="saving" :disabled="!isDirty" @click="saveConfig">
                    保存配置
                </a-button>
            </div>
        </a-spin>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { message } from 'ant-design-vue/es';
import { getConfig, updateConfig } from '@/api/config';
import { checkUpdate } from '@/api/system';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const currentVersion = computed(() => appStore.version);
const checkingUpdate = ref(false);
const checkedUpdate = ref(false);
const hasUpdate = ref(false);
const updateUrl = ref('');
const latestVersion = ref('');

const loading = ref(false);
const saving = ref(false);

const originalConfig = reactive({
    cch_rewrite_enabled: false,
    responses_prompt_cache_key_enabled: false,
    host_key: '',
});

const form = reactive({
    cch_rewrite_enabled: false,
    responses_prompt_cache_key_enabled: false,
    host_key: '',
});

const isDirty = computed(() => {
    return form.cch_rewrite_enabled !== originalConfig.cch_rewrite_enabled ||
           form.responses_prompt_cache_key_enabled !== originalConfig.responses_prompt_cache_key_enabled ||
           form.host_key !== originalConfig.host_key;
});

onMounted(() => {
    void loadConfig();
});

async function loadConfig(): Promise<void> {
    loading.value = true;
    try {
        const config = await getConfig();
        form.cch_rewrite_enabled = config.cch_rewrite_enabled === "true";
        originalConfig.cch_rewrite_enabled = config.cch_rewrite_enabled === "true";
        
        form.responses_prompt_cache_key_enabled = config.responses_prompt_cache_key_enabled === "true";
        originalConfig.responses_prompt_cache_key_enabled = config.responses_prompt_cache_key_enabled === "true";
        
        form.host_key = config.host_key || '';
        originalConfig.host_key = config.host_key || '';
        if (!appStore.version) {
            appStore.fetchVersion();
        }
    } finally {
        loading.value = false;
    }
}

function cancelChanges() {
    form.cch_rewrite_enabled = originalConfig.cch_rewrite_enabled;
    form.responses_prompt_cache_key_enabled = originalConfig.responses_prompt_cache_key_enabled;
    form.host_key = originalConfig.host_key;
}

async function doCheckUpdate() {
    checkingUpdate.value = true;
    try {
        const status = await checkUpdate(true);
        if (!status.success) {
            message.error(status.error_message || '检查更新失败');
            return;
        }

        hasUpdate.value = status.has_update;
        checkedUpdate.value = true;
        if (status.has_update) {
            updateUrl.value = status.release_url || '';
            latestVersion.value = status.latest_version;
            message.info(`发现新版本 v${status.latest_version}`);
        } else {
            message.success('当前已是最新版本');
        }
    } catch (e) {
        message.error('检查更新失败');
        console.error(e);
    } finally {
        checkingUpdate.value = false;
    }
}

import { openUrl } from '@/utils/platform';

async function openUpdateUrl() {
    await openUrl(updateUrl.value);
}

async function saveConfig(): Promise<void> {
    saving.value = true;
    try {
        const config = await updateConfig({
            cch_rewrite_enabled: form.cch_rewrite_enabled ? "true" : "false",
            responses_prompt_cache_key_enabled: form.responses_prompt_cache_key_enabled ? "true" : "false",
            ...(form.host_key ? { host_key: form.host_key } : {}), // only send host_key if it's set
        });
        
        form.cch_rewrite_enabled = config.cch_rewrite_enabled === "true";
        originalConfig.cch_rewrite_enabled = config.cch_rewrite_enabled === "true";
        
        form.responses_prompt_cache_key_enabled = config.responses_prompt_cache_key_enabled === "true";
        originalConfig.responses_prompt_cache_key_enabled = config.responses_prompt_cache_key_enabled === "true";
        
        form.host_key = config.host_key || '';
        originalConfig.host_key = config.host_key || '';
        message.success('设置已保存');
    } catch {
        // error handling is typically done by the request interceptor
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.advanced-settings {
    background: var(--bg-page);
    min-height: calc(100vh - 64px);
    padding: 24px;
    max-width: 900px;
}

.page-header {
    margin-bottom: 24px;
}

.page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
}

.settings-section {
    margin-bottom: 32px;
}

.section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.settings-list {
    background: var(--component-bg, #ffffff);
    border: 1px solid var(--border-color, #f0f0f0);
    border-radius: 8px;
    overflow: hidden;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    transition: background-color 0.3s;
}

.setting-item:not(:last-child) {
    border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.setting-info {
    flex: 1;
    min-width: 0;
    margin-right: 24px;
}

.setting-title {
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 4px;
}

.setting-desc {
    color: var(--text-secondary, #8c8c8c);
    font-size: 13px;
    line-height: 1.5;
}

.page-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}
</style>
