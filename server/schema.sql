-- Janaya Computer Shop — database schema
--
-- The MySQL database module from the architecture diagram. String primary keys
-- (P-001, C-007, SL-00001) are kept deliberately: they are the ids the frontend
-- already carries, so the API shapes match the app without a translation layer.
--
-- Run through server/migrate.js, which creates the database then applies this
-- file. Safe to re-run: every object is dropped and recreated.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS customers;

SET FOREIGN_KEY_CHECKS = 1;

-- Customers -----------------------------------------------------------------
CREATE TABLE customers (
  id       VARCHAR(12)  NOT NULL PRIMARY KEY,
  name     VARCHAR(160) NOT NULL,
  phone    VARCHAR(40)  NOT NULL DEFAULT '',
  email    VARCHAR(160) NOT NULL DEFAULT '',
  address  VARCHAR(255) NOT NULL DEFAULT '',
  type     VARCHAR(20)  NOT NULL DEFAULT 'Walk-in',
  joined   DATE         NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Users (staff logins) ------------------------------------------------------
-- The owner and cashiers. Customers are records, not logins.
CREATE TABLE users (
  id            VARCHAR(12)  NOT NULL PRIMARY KEY,
  username      VARCHAR(60)  NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  name          VARCHAR(160) NOT NULL,
  role          ENUM('owner', 'cashier') NOT NULL,
  title         VARCHAR(60)  NOT NULL DEFAULT ''
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Suppliers -----------------------------------------------------------------
CREATE TABLE suppliers (
  id             VARCHAR(12)  NOT NULL PRIMARY KEY,
  name           VARCHAR(160) NOT NULL,
  contact_person VARCHAR(160) NOT NULL DEFAULT '',
  phone          VARCHAR(40)  NOT NULL DEFAULT '',
  email          VARCHAR(160) NOT NULL DEFAULT '',
  address        VARCHAR(255) NOT NULL DEFAULT '',
  supplies       VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Products ------------------------------------------------------------------
CREATE TABLE products (
  id            VARCHAR(12)   NOT NULL PRIMARY KEY,
  sku           VARCHAR(40)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  category      VARCHAR(40)   NOT NULL,
  supplier_id   VARCHAR(12)   NULL,
  cost          DECIMAL(12,2) NOT NULL DEFAULT 0,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock         INT           NOT NULL DEFAULT 0,
  reorder_point INT           NOT NULL DEFAULT 0,
  art           VARCHAR(32)   NOT NULL DEFAULT 'tower',
  image         TEXT          NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers (id) ON DELETE SET NULL,
  INDEX idx_products_category (category)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Purchase orders -----------------------------------------------------------
CREATE TABLE purchase_orders (
  id            VARCHAR(12) NOT NULL PRIMARY KEY,
  supplier_id   VARCHAR(12) NULL,
  order_date    DATE        NOT NULL,
  expected_date DATE        NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE purchase_order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  po_id      VARCHAR(12)   NOT NULL,
  product_id VARCHAR(12)   NULL,
  qty        INT           NOT NULL,
  cost       DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_poi_po FOREIGN KEY (po_id)
    REFERENCES purchase_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Sales ---------------------------------------------------------------------
-- customer_name and cashier_name are denormalised on purpose: a receipt must
-- read the same forever, even after the customer or staff record changes.
CREATE TABLE sales (
  id               VARCHAR(12)   NOT NULL PRIMARY KEY,
  invoice_no       VARCHAR(20)   NOT NULL UNIQUE,
  date             DATETIME      NOT NULL,
  customer_id      VARCHAR(12)   NULL,
  customer_name    VARCHAR(160)  NOT NULL,
  cashier_id       VARCHAR(12)   NULL,
  cashier_name     VARCHAR(160)  NOT NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  vat              DECIMAL(12,2) NOT NULL,
  total            DECIMAL(12,2) NOT NULL,
  payment_method   VARCHAR(20)   NOT NULL,
  payment_tendered DECIMAL(12,2) NOT NULL,
  payment_change   DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE SET NULL,
  CONSTRAINT fk_sales_cashier FOREIGN KEY (cashier_id)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_sales_date (date),
  INDEX idx_sales_customer (customer_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE sale_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  sale_id    VARCHAR(12)   NOT NULL,
  product_id VARCHAR(12)   NULL,
  sku        VARCHAR(40)   NOT NULL,
  name       VARCHAR(200)  NOT NULL,
  price      DECIMAL(12,2) NOT NULL,
  qty        INT           NOT NULL,
  CONSTRAINT fk_si_sale FOREIGN KEY (sale_id)
    REFERENCES sales (id) ON DELETE CASCADE,
  CONSTRAINT fk_si_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE SET NULL,
  INDEX idx_si_sale (sale_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
