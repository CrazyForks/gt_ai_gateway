use ai_gateway_lib::utils;

#[test]
fn test_generate_client_url() {
    // Normal localhost
    assert_eq!(utils::generate_client_url("127.0.0.1", 6722), "http://127.0.0.1:6722");
    assert_eq!(utils::generate_client_url("localhost", 6722), "http://localhost:6722");
    
    // Custom IP
    assert_eq!(utils::generate_client_url("192.168.1.100", 8080), "http://192.168.1.100:8080");
    
    // 0.0.0.0 should be mapped to 127.0.0.1
    assert_eq!(utils::generate_client_url("0.0.0.0", 6722), "http://127.0.0.1:6722");
}
