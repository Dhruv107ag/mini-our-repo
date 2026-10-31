-- Migration: Add 'center_lead' role and create center tables for isolated department purchase, inventory, issue & return
-- Run this if MySQL database is active:

ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('student','faculty','lab_staff','hod','lab_coordinator','admin','others','center_lead') 
COLLATE utf8mb4_unicode_ci NOT NULL;

-- 1. Center Purchases Table
CREATE TABLE IF NOT EXISTS `center_purchases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_no` VARCHAR(100) NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
  `category` VARCHAR(100) DEFAULT 'General',
  `quantity` INT NOT NULL DEFAULT 1,
  `unit` VARCHAR(50) DEFAULT 'pcs',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `vendor_name` VARCHAR(200) NOT NULL,
  `vendor_contact` VARCHAR(150) NULL,
  `purchase_date` DATE NOT NULL,
  `invoice_pdf_url` TEXT NULL,
  `invoice_pdf_name` VARCHAR(255) NULL,
  `status` ENUM('received', 'ordered', 'cancelled') NOT NULL DEFAULT 'received',
  `added_to_inventory` TINYINT(1) NOT NULL DEFAULT 1,
  `remarks` TEXT NULL,
  `purchased_by` VARCHAR(150) NULL,
  `center_name` VARCHAR(150) DEFAULT 'Center for Advanced Studies',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_purchase_no` (`purchase_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Center Inventory Table (Separate from lab_inventory)
CREATE TABLE IF NOT EXISTS `center_inventory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `center_name` VARCHAR(150) DEFAULT 'Center for Advanced Studies',
  `part_no` VARCHAR(100) NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
  `category` VARCHAR(100) DEFAULT 'General',
  `total_purchased` INT NOT NULL DEFAULT 0,
  `available_quantity` INT NOT NULL DEFAULT 0,
  `issued_quantity` INT NOT NULL DEFAULT 0,
  `condemned_quantity` INT NOT NULL DEFAULT 0,
  `repair_quantity` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) DEFAULT 'pcs',
  `location` VARCHAR(100) DEFAULT 'Center Storage',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `purchase_date` DATE NULL,
  `purchase_no` VARCHAR(100) NULL,
  `invoice_pdf_url` TEXT NULL,
  `invoice_pdf_name` VARCHAR(255) NULL,
  `remarks` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_center_inv_part_no` (`part_no`),
  INDEX `idx_center_inv_type` (`item_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Center Item Issues & Returns Table (Separate from item_issues)
CREATE TABLE IF NOT EXISTS `center_item_issues` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `issue_code` VARCHAR(100) NOT NULL,
  `inventory_id` INT NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
  `part_no` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `issued_to_name` VARCHAR(150) NOT NULL,
  `issued_to_email` VARCHAR(255) NOT NULL,
  `issued_to_role` ENUM('student', 'faculty', 'staff', 'other') NOT NULL DEFAULT 'student',
  `issued_to_id` VARCHAR(50) NULL,
  `department` VARCHAR(100) NULL,
  `issue_date` DATETIME NOT NULL,
  `expected_return_date` DATE NULL,
  `actual_return_date` DATETIME NULL,
  `purpose` TEXT NULL,
  `status` ENUM('issued', 'returned', 'overdue', 'lost') NOT NULL DEFAULT 'issued',
  `return_condition` ENUM('good', 'minor_damage', 'damaged', 'lost') NULL,
  `issued_by_name` VARCHAR(150) NOT NULL,
  `returned_to_name` VARCHAR(150) NULL,
  `remarks` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_issue_code` (`issue_code`),
  INDEX `idx_center_issue_inv` (`inventory_id`),
  INDEX `idx_center_issue_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Center Stock Adjustments Audit Table
CREATE TABLE IF NOT EXISTS `center_inventory_adjustments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `inventory_id` INT NOT NULL,
  `action_type` ENUM('purchase_add', 'issue', 'return', 'consumed', 'condemned', 'repair_send', 'repair_return', 'stock_adjustment') NOT NULL,
  `quantity_change` INT NOT NULL,
  `prev_available` INT NOT NULL,
  `new_available` INT NOT NULL,
  `prev_issued` INT NOT NULL DEFAULT 0,
  `new_issued` INT NOT NULL DEFAULT 0,
  `remark` TEXT NOT NULL,
  `proof_doc_url` TEXT NULL,
  `proof_doc_name` VARCHAR(255) NULL,
  `performed_by` VARCHAR(150) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_center_adj_inv` (`inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
