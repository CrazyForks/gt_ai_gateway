// 注释掉以便在终端中看到 println! 日志输出（目前仅在 dev 模式下保留 cmd 窗口）
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ai_gateway_lib::run();
}
