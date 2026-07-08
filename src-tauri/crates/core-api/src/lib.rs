use axum::{
    routing::post,
    Router,
    extract::State,
    http::{StatusCode, HeaderMap},
    body::Bytes,
};
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use core_db::init_db; // just for types maybe? We can pass a connection string or the app state
use rusqlite::Connection;
use hmac::{Hmac, Mac};
use sha2::Sha256;

// A simple state holding DB path and key
pub struct ApiState {
    pub db_path: String,
    pub db_key: String,
}

#[derive(Deserialize, Debug)]
pub struct WebhookPayload {
    pub subscriber_id: i32,
    pub plan_id: i32,
    pub amount: f64,
}

pub async fn start_api_server(db_path: String, db_key: String) {
    let state = Arc::new(ApiState { db_path, db_key });

    let app = Router::new()
        .route("/webhook/subscription", post(handle_webhook))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:4545").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_webhook(
    State(state): State<Arc<ApiState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    // 1. Verify HMAC
    let signature = headers.get("X-Signature")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let secret = b"my_super_secret_webhook_key";
    let mut mac = Hmac::<Sha256>::new_from_slice(secret).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    mac.update(&body);
    let expected = hex::encode(mac.finalize().into_bytes());

    if signature != expected {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // 2. Parse payload
    let payload: WebhookPayload = serde_json::from_slice(&body).map_err(|_| StatusCode::BAD_REQUEST)?;

    // 3. Insert into DB (this is just an example, a real app would have more logic)
    // Here we open a new connection to the DB using the path and key, insert a subscription and a payment.
    let conn = core_db::init_db(&state.db_path, &state.db_key).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Quick insert logic
    conn.execute(
        "INSERT INTO subscriptions (subscriber_id, plan_id, start_date, end_date, status, auto_renew) 
         VALUES (?1, ?2, date('now'), date('now', '+30 days'), 'active', 1)",
        rusqlite::params![payload.subscriber_id, payload.plan_id]
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let sub_id = conn.last_insert_rowid();

    conn.execute(
        "INSERT INTO payments (subscription_id, amount, payment_method, receipt_number) 
         VALUES (?1, ?2, 'webhook', 'WH-' || hex(randomblob(4)))",
        rusqlite::params![sub_id, payload.amount]
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}
