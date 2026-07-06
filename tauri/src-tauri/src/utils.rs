pub fn generate_client_url(host: &str, port: u16) -> String {
    let client_host = if host == "0.0.0.0" {
        "127.0.0.1"
    } else {
        host
    };
    format!("http://{}:{}", client_host, port)
}
