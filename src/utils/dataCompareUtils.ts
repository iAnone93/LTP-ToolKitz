import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

export type CompareMode = 'code' | 'text' | 'spreadsheet' | 'pdf';

export type CodeLanguage = 
  | 'groovy'
  | 'sql'
  | 'javascript'
  | 'python'
  | 'java'
  | 'json'
  | 'xml'
  | 'bash';

export interface CompareSample {
  id: string;
  name: string;
  mode: CompareMode;
  language?: CodeLanguage;
  description: string;
  leftTitle: string;
  rightTitle: string;
  leftContent: string;
  rightContent: string;
}

export interface SheetDiffResult {
  sheetName: string;
  headers: string[];
  rows: {
    status: 'added' | 'removed' | 'modified' | 'unchanged';
    rowNumberLeft?: number;
    rowNumberRight?: number;
    leftData?: Record<string, any>;
    rightData?: Record<string, any>;
    diffCells: Record<string, boolean>; // true if column value changed
  }[];
  stats: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

// ----------------------------------------------------
// Pre-loaded Samples with descriptive italicized placeholders
// ----------------------------------------------------
export const COMPARE_SAMPLES: CompareSample[] = [
  {
    id: 'katalon-groovy',
    name: 'Katalon Groovy Script (v1 vs v2)',
    mode: 'code',
    language: 'groovy',
    description: 'Katalon Studio automated test case refactored to use dynamic wait and custom keywords',
    leftTitle: 'Baseline: LoginTest_v1.groovy (Old Katalon Script)',
    rightTitle: 'Modified: LoginTest_v2.groovy (Refactored Katalon Script)',
    leftContent: `package com.katalon.automation.testcases

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable

// Step 1: Open browser & navigate
WebUI.openBrowser('')
WebUI.navigateToUrl('https://app.enterprise-demo.com/login')
WebUI.maximizeWindow()

// Hardcoded wait (Legacy Flaky Pattern)
WebUI.delay(5)

// Step 2: Input user credentials
WebUI.setText(findTestObject('Object Repository/Page_Login/txt_Username'), 'admin@company.com')
WebUI.setText(findTestObject('Object Repository/Page_Login/txt_Password'), 'AdminSecret123!')

// Step 3: Click login button
WebUI.click(findTestObject('Object Repository/Page_Login/btn_Submit'))
WebUI.delay(3)

// Step 4: Verify landing dashboard
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/header_Welcome'), 10)
WebUI.comment('User login verification completed successfully.')
WebUI.closeBrowser()
`,
    rightContent: `package com.katalon.automation.testcases

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import com.company.automation.keywords.AuthKeywords as CustomAuth
import internal.GlobalVariable

// Step 1: Open browser & navigate with robust options
WebUI.openBrowser('')
WebUI.navigateToUrl(GlobalVariable.G_BaseUrl + '/login')
WebUI.maximizeWindow()

// Replaced static delay with dynamic element visibility wait
WebUI.waitForElementVisible(findTestObject('Object Repository/Page_Login/txt_Username'), 15)

// Step 2: Input user credentials with masked secret
WebUI.setText(findTestObject('Object Repository/Page_Login/txt_Username'), GlobalVariable.G_AdminUser)
WebUI.setEncryptedText(findTestObject('Object Repository/Page_Login/txt_Password'), GlobalVariable.G_AdminPassword)

// Step 3: Trigger login with custom keyword audit logger
CustomAuth.recordLoginAuditTrail('admin_session_init')
WebUI.click(findTestObject('Object Repository/Page_Login/btn_Submit'))

// Step 4: Enhanced validation with dynamic timeout and toast check
WebUI.waitForElementNotPresent(findTestObject('Object Repository/Page_Login/btn_Submit'), 10)
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/header_Welcome'), 15, FailureHandling.STOP_ON_FAILURE)
WebUI.verifyElementText(findTestObject('Object Repository/Page_Dashboard/user_Badge'), 'System Administrator')

WebUI.comment('User login verification with RBAC assertion passed.')
WebUI.closeBrowser()
`
  },
  {
    id: 'sql-migration',
    name: 'SQL Database Migration',
    mode: 'code',
    language: 'sql',
    description: 'PostgreSQL schema upgrade adding user roles, indexing, and foreign key constraints',
    leftTitle: 'Baseline: V1.0__create_users_table.sql',
    rightTitle: 'Modified: V2.0__upgrade_users_with_roles.sql',
    leftContent: `-- Version 1.0: Initial Customer Table Definition
CREATE TABLE public.customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Basic index on email
CREATE UNIQUE INDEX idx_customers_email ON public.customers(email);

-- Query legacy active members
SELECT customer_id, full_name, email 
FROM public.customers 
WHERE is_active = true 
ORDER BY created_at DESC;
`,
    rightContent: `-- Version 2.0: Upgraded Customer Schema with RBAC & Audit Triggers
CREATE TABLE public.customers (
    customer_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(50) DEFAULT 'STANDARD_USER' NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized compound indexes for authentication and status filtering
CREATE UNIQUE INDEX idx_customers_email_lower ON public.customers(LOWER(email));
CREATE INDEX idx_customers_status_role ON public.customers(status, role);

-- Enhanced query with status filtering and column projections
SELECT 
    customer_id, 
    first_name || ' ' || last_name AS full_name, 
    email,
    role,
    two_factor_enabled
FROM public.customers 
WHERE status = 'ACTIVE' 
  AND role IN ('STANDARD_USER', 'PREMIUM_USER')
ORDER BY created_at DESC;
`
  },
  {
    id: 'text-paragraph',
    name: 'Document / Scenario Text',
    mode: 'text',
    description: 'Release requirements comparing revision v1.0 specifications against revised v2.0 draft',
    leftTitle: 'Baseline: Release_Requirement_v1.0.txt',
    rightTitle: 'Modified: Release_Requirement_v2.0.txt',
    leftContent: `PROJECT SPECIFICATION & RELEASE PLAN (v1.0)

1. Executive Overview:
The customer checkout gateway must complete credit card transactions within 4 seconds. 
All transaction data will be stored in the legacy local database without tokenization.

2. Supported Currencies:
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)

3. Error Handling:
When payment gateway fails, display a generic message: "Something went wrong, please try again."

4. Notification Delivery:
Send transaction receipt exclusively via standard email to the billing address within 10 minutes.
`,
    rightContent: `PROJECT SPECIFICATION & RELEASE PLAN (v2.0 - REVISED)

1. Executive Overview:
The customer checkout gateway must complete transactions within 1.5 seconds under 99th percentile load. 
All transaction data must be end-to-end tokenized via PCI-DSS Level 1 certified vault before storage.

2. Supported Currencies & Digital Rails:
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)
- IDR (Indonesian Rupiah)
- Apple Pay & Google Wallet

3. Error Handling & Auto-Recovery:
When payment gateway fails, display context-aware guidance with specific recovery action:
"Transaction timed out at card issuer. No funds were debited. Click here to retry or select alternate payment."

4. Notification Delivery:
Send real-time instant notification via Push Notification and WhatsApp webhook within 3 seconds,
with backup fallback email receipt within 2 minutes.
`
  },
  {
    id: 'excel-sample',
    name: 'Spreadsheet (Pricing & Catalog)',
    mode: 'spreadsheet',
    description: 'Sample CSV/Excel table showing updated unit prices, added SKUs, and discontinued inventory',
    leftTitle: 'Baseline: Product_Catalog_Q3.csv',
    rightTitle: 'Modified: Product_Catalog_Q4.csv',
    leftContent: `SKU,Product_Name,Category,Unit_Price,Stock_Qty,Status
SKU-1001,Wireless Keyboard,Electronics,45.00,120,Active
SKU-1002,Ergonomic Mouse,Electronics,29.99,85,Active
SKU-1003,USB-C Docking Hub,Accessories,89.50,40,Active
SKU-1004,27-inch 4K Monitor,Displays,299.00,15,Active
SKU-1005,Mechanical Numpad,Accessories,35.00,50,Discontinued
`,
    rightContent: `SKU,Product_Name,Category,Unit_Price,Stock_Qty,Status
SKU-1001,Wireless Keyboard (Backlit),Electronics,52.00,95,Active
SKU-1002,Ergonomic Mouse,Electronics,29.99,70,Active
SKU-1003,USB-C Docking Hub Pro,Accessories,99.00,35,Active
SKU-1004,27-inch 4K Monitor,Displays,279.00,28,Active
SKU-1006,Dual Monitor Arm Mount,Accessories,65.00,110,Active
SKU-1007,Noise-Canceling Headset,Audio,149.00,45,Active
`
  }
];

// ----------------------------------------------------
// PDF Text Extraction Helper
// ----------------------------------------------------
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    
    // Group text items by approximate baseline Y position to preserve paragraphs
    const lineMap = new Map<number, string[]>();
    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;
      const y = Math.round(item.transform[5]);
      const list = lineMap.get(y) || [];
      list.push(item.str);
      lineMap.set(y, list);
    }

    // Sort descending by Y (top to bottom of page)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const pageLines = sortedY.map(y => (lineMap.get(y) || []).join(' '));

    pageTexts.push(`--- Page ${i} of ${numPages} ---\n` + pageLines.join('\n'));
  }

  return pageTexts.join('\n\n');
}

// ----------------------------------------------------
// Spreadsheet Parsing & Diff Computation
// ----------------------------------------------------
export function parseSpreadsheetToCsv(buffer: ArrayBuffer): { csv: string; sheetNames: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return { csv, sheetNames: workbook.SheetNames };
}

export function parseSpreadsheetToRows(buffer: ArrayBuffer, sheetName?: string): { headers: string[]; rows: any[]; sheetNames: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const selectedSheet = sheetName && workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  
  // Extract all distinct headers
  const headersSet = new Set<string>();
  rows.forEach(r => Object.keys(r).forEach(k => headersSet.add(k)));
  const headers = Array.from(headersSet);

  return { headers, rows, sheetNames: workbook.SheetNames };
}

export function parseCsvStringToRows(csvText: string): { headers: string[]; rows: any[] } {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });
  const headersSet = new Set<string>();
  rows.forEach(r => Object.keys(r).forEach(k => headersSet.add(k)));
  return { headers: Array.from(headersSet), rows };
}

export function computeSpreadsheetDiff(
  leftRows: Record<string, any>[],
  rightRows: Record<string, any>[],
  primaryKey?: string
): SheetDiffResult {
  const allHeadersSet = new Set<string>();
  leftRows.forEach(r => Object.keys(r).forEach(k => allHeadersSet.add(k)));
  rightRows.forEach(r => Object.keys(r).forEach(k => allHeadersSet.add(k)));
  const headers = Array.from(allHeadersSet);

  const diffRows: SheetDiffResult['rows'] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  // Determine key: if provided and exists, use it; otherwise use row index matching
  const hasKey = primaryKey && headers.includes(primaryKey);

  if (hasKey) {
    const leftMap = new Map<string, { row: Record<string, any>; index: number }>();
    leftRows.forEach((r, idx) => {
      const keyVal = String(r[primaryKey] ?? '');
      if (keyVal) leftMap.set(keyVal, { row: r, index: idx + 1 });
    });

    const matchedLeftKeys = new Set<string>();

    rightRows.forEach((rRight, rIdx) => {
      const keyVal = String(rRight[primaryKey] ?? '');
      const leftEntry = keyVal ? leftMap.get(keyVal) : undefined;

      if (!leftEntry) {
        // Added in right
        addedCount++;
        diffRows.push({
          status: 'added',
          rowNumberRight: rIdx + 1,
          rightData: rRight,
          diffCells: {}
        });
      } else {
        matchedLeftKeys.add(keyVal);
        const rLeft = leftEntry.row;
        const diffCells: Record<string, boolean> = {};
        let isModified = false;

        headers.forEach(h => {
          const lVal = String(rLeft[h] ?? '').trim();
          const rVal = String(rRight[h] ?? '').trim();
          if (lVal !== rVal) {
            diffCells[h] = true;
            isModified = true;
          }
        });

        if (isModified) {
          modifiedCount++;
          diffRows.push({
            status: 'modified',
            rowNumberLeft: leftEntry.index,
            rowNumberRight: rIdx + 1,
            leftData: rLeft,
            rightData: rRight,
            diffCells
          });
        } else {
          unchangedCount++;
          diffRows.push({
            status: 'unchanged',
            rowNumberLeft: leftEntry.index,
            rowNumberRight: rIdx + 1,
            leftData: rLeft,
            rightData: rRight,
            diffCells: {}
          });
        }
      }
    });

    // Check for removed rows (in left but not in right)
    leftRows.forEach((rLeft, lIdx) => {
      const keyVal = String(rLeft[primaryKey] ?? '');
      if (!matchedLeftKeys.has(keyVal)) {
        removedCount++;
        diffRows.push({
          status: 'removed',
          rowNumberLeft: lIdx + 1,
          leftData: rLeft,
          diffCells: {}
        });
      }
    });
  } else {
    // Index-based comparison
    const maxLen = Math.max(leftRows.length, rightRows.length);
    for (let i = 0; i < maxLen; i++) {
      const rLeft = leftRows[i];
      const rRight = rightRows[i];

      if (rLeft && !rRight) {
        removedCount++;
        diffRows.push({
          status: 'removed',
          rowNumberLeft: i + 1,
          leftData: rLeft,
          diffCells: {}
        });
      } else if (!rLeft && rRight) {
        addedCount++;
        diffRows.push({
          status: 'added',
          rowNumberRight: i + 1,
          rightData: rRight,
          diffCells: {}
        });
      } else {
        const diffCells: Record<string, boolean> = {};
        let isModified = false;

        headers.forEach(h => {
          const lVal = String(rLeft[h] ?? '').trim();
          const rVal = String(rRight[h] ?? '').trim();
          if (lVal !== rVal) {
            diffCells[h] = true;
            isModified = true;
          }
        });

        if (isModified) {
          modifiedCount++;
          diffRows.push({
            status: 'modified',
            rowNumberLeft: i + 1,
            rowNumberRight: i + 1,
            leftData: rLeft,
            rightData: rRight,
            diffCells
          });
        } else {
          unchangedCount++;
          diffRows.push({
            status: 'unchanged',
            rowNumberLeft: i + 1,
            rowNumberRight: i + 1,
            leftData: rLeft,
            rightData: rRight,
            diffCells: {}
          });
        }
      }
    }
  }

  return {
    sheetName: 'Sheet1',
    headers,
    rows: diffRows,
    stats: {
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      unchanged: unchangedCount
    }
  };
}
