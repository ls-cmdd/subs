use rusqlite::Connection;
use serde::Serialize;

#[derive(Serialize)]
pub struct Payment {
    pub id: i32,
    pub subscriber_name: String,
    pub plan_name: String,
    pub amount: f64,
    pub payment_method: String,
    pub payment_date: String,
    pub receipt_number: String,
}

pub fn get_payments(conn: &Connection) -> Result<Vec<Payment>, String> {
    let mut stmt = conn.prepare("
        SELECT p.id, sub.full_name, pl.name, p.amount, p.payment_method, p.payment_date, p.receipt_number
        FROM payments p
        JOIN subscriptions s ON p.subscription_id = s.id
        JOIN subscribers sub ON s.subscriber_id = sub.id
        JOIN plans pl ON s.plan_id = pl.id
        WHERE p.deleted_at IS NULL
        ORDER BY p.payment_date DESC
    ").map_err(|e| e.to_string())?;
    
    let pay_iter = stmt.query_map([], |row| {
        Ok(Payment {
            id: row.get(0)?,
            subscriber_name: row.get(1)?,
            plan_name: row.get(2)?,
            amount: row.get(3)?,
            payment_method: row.get(4)?,
            payment_date: row.get(5)?,
            receipt_number: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut pays = Vec::new();
    for p in pay_iter {
        pays.push(p.map_err(|e| e.to_string())?);
    }
    Ok(pays)
}

pub fn add_payment(conn: &Connection, subscription_id: i32, amount: f64, payment_method: String, receipt_number: String, notes: Option<String>) -> Result<i32, String> {
    conn.execute(
        "INSERT INTO payments (subscription_id, amount, payment_method, receipt_number, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![subscription_id, amount, payment_method, receipt_number, notes]
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid() as i32)
}
