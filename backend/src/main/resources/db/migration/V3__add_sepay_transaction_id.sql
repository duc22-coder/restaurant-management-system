ALTER TABLE payments
    ADD COLUMN sepay_transaction_id varchar(100) NULL,
    ADD UNIQUE KEY uk_payments_sepay_transaction_id (sepay_transaction_id);
