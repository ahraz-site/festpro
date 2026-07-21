const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/MSI PC/Downloads/festize-com-full-site-offline/festpro-saas/supabase/migrations';

function removeTableAndStatements(filename, tableName) {
  const fpath = path.join(dirPath, filename);
  if (!fs.existsSync(fpath)) return;
  let text = fs.readFileSync(fpath, 'utf8');

  // 1. Remove CREATE TABLE tableName (...)
  // Match CREATE TABLE followed by balanced parentheses and ending with ;
  const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${tableName}\\s*\\(([^)]|\\(([^)]|\\([^)]*\\))*\\))*\\);`, 'gi');
  text = text.replace(tableRegex, '');

  // 2. Remove ALTER TABLE, CREATE INDEX, CREATE POLICY, CREATE TRIGGER ending with ;
  // Use [^;]+? to prevent crossing statement boundaries
  const statementsRegex = new RegExp(`(ALTER\\s+TABLE\\s+(?:ONLY\\s+)?${tableName}\\b[^;]*?;|CREATE\\s+(?:UNIQUE\\s+)?INDEX\\s+[^;]+?\\s+ON\\s+${tableName}\\b[^;]*?;|CREATE\\s+POLICY\\s+[^;]+?\\s+ON\\s+${tableName}\\b[^;]*?;|CREATE\\s+TRIGGER\\s+[^;]+?\\s+ON\\s+${tableName}\\b[^;]*?;)`, 'gi');
  text = text.replace(statementsRegex, '');

  // 3. Remove array elements like 'tableName'
  const arrayElementRegex = new RegExp(`'${tableName}'\\s*,?\\s*|,\\s*'${tableName}'`, 'gi');
  text = text.replace(arrayElementRegex, '');

  fs.writeFileSync(fpath, text, 'utf8');
  console.log(`Successfully cleaned duplicate table "${tableName}" from ${filename}`);
}

function renameTableReferences(filename, oldName, newName) {
  const fpath = path.join(dirPath, filename);
  if (!fs.existsSync(fpath)) return;
  let text = fs.readFileSync(fpath, 'utf8');

  const patterns = [
    { regex: new RegExp(`\\bCREATE TABLE (IF NOT EXISTS )?${oldName}\\b`, 'g'), replace: `CREATE TABLE $1${newName}` },
    { regex: new RegExp(`\\bALTER TABLE (ONLY )?${oldName}\\b`, 'g'), replace: `ALTER TABLE $1${newName}` },
    { regex: new RegExp(`\\bREFERENCES ${oldName}\\b`, 'g'), replace: `REFERENCES ${newName}` },
    { regex: new RegExp(`\\bON ${oldName}\\b`, 'g'), replace: `ON ${newName}` },
    { regex: new RegExp(`\\bFROM ${oldName}\\b`, 'gi'), replace: `FROM ${newName}` },
    { regex: new RegExp(`\\bJOIN ${oldName}\\b`, 'gi'), replace: `JOIN ${newName}` },
    { regex: new RegExp(`\\bUPDATE ${oldName}\\b`, 'gi'), replace: `UPDATE ${newName}` },
    { regex: new RegExp(`\\bINSERT INTO ${oldName}\\b`, 'gi'), replace: `INSERT INTO ${newName}` },
    { regex: new RegExp(`\\bINDEX idx_[a_zA-Z0-9_]+ ON ${oldName}\\b`, 'gi'), replace: (match) => match.replace(oldName, newName) }
  ];

  patterns.forEach(p => {
    text = text.replace(p.regex, p.replace);
  });

  fs.writeFileSync(fpath, text, 'utf8');
  console.log(`Renamed table "${oldName}" to "${newName}" in ${filename}`);
}

// Clean duplicate tables
removeTableAndStatements('00015_sponsor_donor_crm.sql', 'transactions');
removeTableAndStatements('00021_mobile_platform.sql', 'push_subscriptions');
removeTableAndStatements('00024_observability.sql', 'system_health');
removeTableAndStatements('00024_observability.sql', 'error_logs');
removeTableAndStatements('00028_edms.sql', 'knowledge_articles');
removeTableAndStatements('00030_enterprise_hardening.sql', 'health_checks');
removeTableAndStatements('00029_devops.sql', 'deployment_history');

// Rename conflicting tables
renameTableReferences('00022_saas_platform.sql', 'payment_methods', 'saas_payment_methods');
renameTableReferences('00022_saas_platform.sql', 'coupon_redemptions', 'saas_coupon_redemptions');
renameTableReferences('00018_accommodation_transport.sql', 'checkins', 'room_checkins');
