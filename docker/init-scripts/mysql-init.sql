-- ============================================================
-- MySQL Test Database Initialization
-- ============================================================
-- This script runs once when the container is first created.
-- ============================================================

-- Ensure UTF-8 encoding throughout
ALTER DATABASE testdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant all privileges to the test user
GRANT ALL PRIVILEGES ON testdb.* TO 'testuser'@'%';
GRANT SUPER ON *.* TO 'testuser'@'%';
FLUSH PRIVILEGES;

-- ── Stored procedure: truncate all user tables ─────────────
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS truncate_all_tables()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE tbl_name VARCHAR(255);
  DECLARE cur CURSOR FOR
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma_%';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  SET FOREIGN_KEY_CHECKS = 0;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO tbl_name;
    IF done THEN
      LEAVE read_loop;
    END IF;
    SET @stmt = CONCAT('TRUNCATE TABLE `', tbl_name, '`');
    PREPARE stmt FROM @stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;

  CLOSE cur;

  SET FOREIGN_KEY_CHECKS = 1;
END$$

DELIMITER ;
