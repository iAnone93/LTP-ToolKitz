import{r as n,j as e,L as me}from"./vendor-react-DXiQitQg.js";import{D as pe,a as xe}from"./vendor-diff-CkMlU1OE.js";import{r as ee,u as te}from"./vendor-xlsx-DLNWaC59.js";import{g as ue,v as fe,G as he}from"./vendor-pdfjs-CWLcCflZ.js";import{N as ge,G as J,K as be,p as ve,T as ye,ab as Ne,ax as je,F as Se,ag as we,aj as Ce,w as Ee,r as Te,aH as Re,D as X}from"./vendor-icons-Bgcb_qka.js";import"./vendor-jspdf-BFVDm-JQ.js";he.workerSrc=`https://unpkg.com/pdfjs-dist@${fe}/build/pdf.worker.mjs`;const F=[{id:"katalon-groovy",name:"Katalon Groovy Script (v1 vs v2)",mode:"code",language:"groovy",description:"Katalon Studio automated test case refactored to use dynamic wait and custom keywords",leftTitle:"Baseline: LoginTest_v1.groovy (Old Katalon Script)",rightTitle:"Modified: LoginTest_v2.groovy (Refactored Katalon Script)",leftContent:`package com.katalon.automation.testcases

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
`,rightContent:`package com.katalon.automation.testcases

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
`},{id:"sql-migration",name:"SQL Database Migration",mode:"code",language:"sql",description:"PostgreSQL schema upgrade adding user roles, indexing, and foreign key constraints",leftTitle:"Baseline: V1.0__create_users_table.sql",rightTitle:"Modified: V2.0__upgrade_users_with_roles.sql",leftContent:`-- Version 1.0: Initial Customer Table Definition
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
`,rightContent:`-- Version 2.0: Upgraded Customer Schema with RBAC & Audit Triggers
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
`},{id:"text-paragraph",name:"Document / Scenario Text",mode:"text",description:"Release requirements comparing revision v1.0 specifications against revised v2.0 draft",leftTitle:"Baseline: Release_Requirement_v1.0.txt",rightTitle:"Modified: Release_Requirement_v2.0.txt",leftContent:`PROJECT SPECIFICATION & RELEASE PLAN (v1.0)

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
`,rightContent:`PROJECT SPECIFICATION & RELEASE PLAN (v2.0 - REVISED)

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
`},{id:"excel-sample",name:"Spreadsheet (Pricing & Catalog)",mode:"spreadsheet",description:"Sample CSV/Excel table showing updated unit prices, added SKUs, and discontinued inventory",leftTitle:"Baseline: Product_Catalog_Q3.csv",rightTitle:"Modified: Product_Catalog_Q4.csv",leftContent:`SKU,Product_Name,Category,Unit_Price,Stock_Qty,Status
SKU-1001,Wireless Keyboard,Electronics,45.00,120,Active
SKU-1002,Ergonomic Mouse,Electronics,29.99,85,Active
SKU-1003,USB-C Docking Hub,Accessories,89.50,40,Active
SKU-1004,27-inch 4K Monitor,Displays,299.00,15,Active
SKU-1005,Mechanical Numpad,Accessories,35.00,50,Discontinued
`,rightContent:`SKU,Product_Name,Category,Unit_Price,Stock_Qty,Status
SKU-1001,Wireless Keyboard (Backlit),Electronics,52.00,95,Active
SKU-1002,Ergonomic Mouse,Electronics,29.99,70,Active
SKU-1003,USB-C Docking Hub Pro,Accessories,99.00,35,Active
SKU-1004,27-inch 4K Monitor,Displays,279.00,28,Active
SKU-1006,Dual Monitor Arm Mount,Accessories,65.00,110,Active
SKU-1007,Noise-Canceling Headset,Audio,149.00,45,Active
`}];async function ke(s){const l=await ue({data:s.slice(0)}).promise,c=l.numPages,u=[];for(let d=1;d<=c;d++){const f=(await(await l.getPage(d)).getTextContent()).items,x=new Map;for(const a of f){if(!a.str||a.str.trim()==="")continue;const r=Math.round(a.transform[5]),m=x.get(r)||[];m.push(a.str),x.set(r,m)}const p=Array.from(x.keys()).sort((a,r)=>r-a).map(a=>(x.get(a)||[]).join(" "));u.push(`--- Page ${d} of ${c} ---
`+p.join(`
`))}return u.join(`

`)}function Ae(s){const i=ee(s,{type:"array"}),l=i.SheetNames[0],c=i.Sheets[l];return{csv:te.sheet_to_csv(c),sheetNames:i.SheetNames}}function Z(s){const i=ee(s,{type:"string"}),l=i.Sheets[i.SheetNames[0]],c=te.sheet_to_json(l,{defval:""}),u=new Set;return c.forEach(d=>Object.keys(d).forEach(C=>u.add(C))),{headers:Array.from(u),rows:c}}function Ue(s,i,l){const c=new Set;s.forEach(p=>Object.keys(p).forEach(a=>c.add(a))),i.forEach(p=>Object.keys(p).forEach(a=>c.add(a)));const u=Array.from(c),d=[];let C=0,N=0,f=0,x=0;if(l&&u.includes(l)){const p=new Map;s.forEach((r,m)=>{const h=String(r[l]??"");h&&p.set(h,{row:r,index:m+1})});const a=new Set;i.forEach((r,m)=>{const h=String(r[l]??""),E=h?p.get(h):void 0;if(!E)C++,d.push({status:"added",rowNumberRight:m+1,rightData:r,diffCells:{}});else{a.add(h);const y=E.row,T={};let R=!1;u.forEach(U=>{const P=String(y[U]??"").trim(),k=String(r[U]??"").trim();P!==k&&(T[U]=!0,R=!0)}),R?(f++,d.push({status:"modified",rowNumberLeft:E.index,rowNumberRight:m+1,leftData:y,rightData:r,diffCells:T})):(x++,d.push({status:"unchanged",rowNumberLeft:E.index,rowNumberRight:m+1,leftData:y,rightData:r,diffCells:{}}))}}),s.forEach((r,m)=>{const h=String(r[l]??"");a.has(h)||(N++,d.push({status:"removed",rowNumberLeft:m+1,leftData:r,diffCells:{}}))})}else{const p=Math.max(s.length,i.length);for(let a=0;a<p;a++){const r=s[a],m=i[a];if(r&&!m)N++,d.push({status:"removed",rowNumberLeft:a+1,leftData:r,diffCells:{}});else if(!r&&m)C++,d.push({status:"added",rowNumberRight:a+1,rightData:m,diffCells:{}});else{const h={};let E=!1;u.forEach(y=>{const T=String(r[y]??"").trim(),R=String(m[y]??"").trim();T!==R&&(h[y]=!0,E=!0)}),E?(f++,d.push({status:"modified",rowNumberLeft:a+1,rowNumberRight:a+1,leftData:r,rightData:m,diffCells:h})):(x++,d.push({status:"unchanged",rowNumberLeft:a+1,rowNumberRight:a+1,leftData:r,rightData:m,diffCells:{}}))}}}return{sheetName:"Sheet1",headers:u,rows:d,stats:{added:C,removed:N,modified:f,unchanged:x}}}const De=[{value:"groovy",label:"Groovy (Katalon Studio)",badge:"Katalon"},{value:"sql",label:"SQL Script / Migration",badge:"Database"},{value:"javascript",label:"JavaScript / TypeScript"},{value:"python",label:"Python Script"},{value:"java",label:"Java Class"},{value:"json",label:"JSON Data"},{value:"xml",label:"XML / HTML"},{value:"bash",label:"Bash / Shell"}],We=()=>{const[s,i]=n.useState("code"),[l,c]=n.useState("groovy"),[u,d]=n.useState("Baseline / Original"),[C,N]=n.useState("Modified / Target"),[f,x]=n.useState(""),[j,p]=n.useState(""),[a,r]=n.useState(null),[m,h]=n.useState(null),[E,y]=n.useState(!0),[T,R]=n.useState(!0),[U,P]=n.useState(!1),[k,se]=n.useState(!1),[I,ae]=n.useState(!0),[D,O]=n.useState(""),[M,V]=n.useState("table"),[v,_]=n.useState(null),[B,K]=n.useState(!1),[W,$]=n.useState(!1),G=n.useRef(null),H=n.useRef(null);n.useEffect(()=>{const t=F.find(o=>o.id==="katalon-groovy");t&&(d(t.leftTitle),N(t.rightTitle),x(t.leftContent),p(t.rightContent),i(t.mode),t.language&&c(t.language),y(!0))},[]),n.useEffect(()=>{if(s==="spreadsheet"&&f&&j)try{const t=Z(f),o=Z(j),g=Ue(t.rows,o.rows,D||void 0);_(g)}catch(t){console.error("Error computing spreadsheet diff",t),_(null)}else _(null)},[s,f,j,D]);const re=t=>{const o=F.find(g=>g.id===t);o&&(i(o.mode),o.language&&c(o.language),d(o.leftTitle),N(o.rightTitle),x(o.leftContent),p(o.rightContent),r(null),h(null),y(!0),o.mode==="spreadsheet"?O("SKU"):O(""))},z=async(t,o)=>{var g;$(!0);try{const b=o.name,S=((g=b.split(".").pop())==null?void 0:g.toLowerCase())||"";if(t==="left"?r(b):h(b),S==="pdf"){i("pdf");const w=await o.arrayBuffer(),A=await ke(w);t==="left"?(x(A),d(`PDF Baseline: ${b}`)):(p(A),N(`PDF Modified: ${b}`))}else if(["xlsx","xls","csv"].includes(S)){i("spreadsheet");const w=await o.arrayBuffer(),{csv:A}=Ae(w);t==="left"?(x(A),d(`Spreadsheet: ${b}`)):(p(A),N(`Spreadsheet: ${b}`))}else{const w=await o.text();S==="groovy"?(i("code"),c("groovy")):S==="sql"?(i("code"),c("sql")):["js","ts","jsx","tsx"].includes(S)?(i("code"),c("javascript")):S==="py"?(i("code"),c("python")):S==="java"&&(i("code"),c("java")),t==="left"?(x(w),d(b)):(p(w),N(b))}y(!0)}catch(b){console.error("File parsing error",b),alert("Could not read or parse this file.")}finally{$(!1)}},oe=()=>{x(""),p(""),r(null),h(null),d("Baseline / Original"),N("Modified / Target"),_(null)},ie=()=>{const t=`DATA COMPARE REPORT
Mode: ${s.toUpperCase()}${s==="code"?` (${l})`:""}
Left Source: ${u}
Right Source: ${C}
Timestamp: ${new Date().toLocaleString()}

${s==="spreadsheet"&&v?`
Summary:
- Added Rows: ${v.stats.added}
- Removed Rows: ${v.stats.removed}
- Modified Rows: ${v.stats.modified}
- Unchanged Rows: ${v.stats.unchanged}
`:`
Left Line Count: ${f.split(`
`).length} lines
Right Line Count: ${j.split(`
`).length} lines
`}
Generated via LTP-ToolKitz Data Compare.
`;navigator.clipboard.writeText(t),K(!0),setTimeout(()=>K(!1),2e3)},ne=n.useMemo(()=>{let t=f;return k&&(t=t.toLowerCase()),t},[f,k]),le=n.useMemo(()=>{let t=j;return k&&(t=t.toLowerCase()),t},[j,k]),de=n.useMemo(()=>s==="code"?l==="groovy"?"// Paste baseline Katalon Groovy script (v1) here or drop a .groovy file...":l==="sql"?"-- Paste initial SQL schema DDL or baseline queries here or drop a .sql file...":`// Paste original ${l} code here or drop code script...`:s==="spreadsheet"?"Paste CSV data or drag & drop baseline .xlsx / .csv spreadsheet...":s==="pdf"?"Drag & drop baseline PDF file here or paste extracted PDF text...":"Paste original paragraph, documentation, or release notes here...",[s,l]),ce=n.useMemo(()=>s==="code"?l==="groovy"?"// Paste modified Katalon Groovy script (v2) here or drop a .groovy file...":l==="sql"?"-- Paste updated SQL migration script or queries here or drop a .sql file...":`// Paste modified ${l} code here or drop code script...`:s==="spreadsheet"?"Paste CSV data or drag & drop target .xlsx / .csv spreadsheet...":s==="pdf"?"Drag & drop modified PDF file here or paste extracted PDF text...":"Paste updated paragraph, documentation, or release notes here...",[s,l]);return e.jsxs("div",{className:"min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800",children:[e.jsxs("header",{className:"bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs z-30",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(me,{to:"/",className:"p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors",title:"Return to Toolkit Dashboard",children:e.jsx(ge,{size:18})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("h1",{className:"text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2",children:[e.jsx(J,{size:20,className:"text-indigo-600"}),e.jsx("span",{children:"Data Compare"})]}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200",children:"Multi-Format Diff"})]}),e.jsx("p",{className:"text-xs text-slate-500 hidden sm:block",children:"Universal comparison for Groovy (Katalon), SQL, Code, Spreadsheets, PDF revisions, and Text"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:ie,className:"flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all",title:"Copy diff summary report",children:[B?e.jsx(be,{size:14,className:"text-emerald-600"}):e.jsx(ve,{size:14}),e.jsx("span",{children:B?"Report Copied":"Copy Summary"})]}),e.jsxs("button",{onClick:oe,className:"flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all",children:[e.jsx(ye,{size:14}),e.jsx("span",{children:"Clear"})]}),e.jsxs("button",{onClick:()=>y(!0),disabled:W,className:"flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-all",children:[W?e.jsx("div",{className:"w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"}):e.jsx(Ne,{size:14}),e.jsx("span",{children:W?"Parsing...":E?"Re-Compare":"Compare Now"})]})]})]}),e.jsxs("section",{className:"bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs",children:[e.jsxs("div",{className:"flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs",children:[e.jsxs("button",{onClick:()=>i("code"),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${s==="code"?"bg-white text-indigo-700 shadow-2xs border border-slate-200":"text-slate-600 hover:text-slate-900"}`,children:[e.jsx(je,{size:14}),e.jsx("span",{children:"Code & Scripts"})]}),e.jsxs("button",{onClick:()=>i("text"),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${s==="text"?"bg-white text-indigo-700 shadow-2xs border border-slate-200":"text-slate-600 hover:text-slate-900"}`,children:[e.jsx(Se,{size:14}),e.jsx("span",{children:"Text Paragraphs"})]}),e.jsxs("button",{onClick:()=>i("spreadsheet"),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${s==="spreadsheet"?"bg-white text-indigo-700 shadow-2xs border border-slate-200":"text-slate-600 hover:text-slate-900"}`,children:[e.jsx(we,{size:14}),e.jsx("span",{children:"Spreadsheets (Excel/CSV)"})]}),e.jsxs("button",{onClick:()=>i("pdf"),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${s==="pdf"?"bg-white text-indigo-700 shadow-2xs border border-slate-200":"text-slate-600 hover:text-slate-900"}`,children:[e.jsx(Ce,{size:14}),e.jsx("span",{children:"PDF Documents"})]})]}),s==="code"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-semibold text-slate-500",children:"Syntax Format:"}),e.jsx("select",{value:l,onChange:t=>c(t.target.value),className:"text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",children:De.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))})]}),e.jsxs("div",{className:"flex items-center gap-1.5 overflow-x-auto py-1",children:[e.jsxs("span",{className:"text-xs font-semibold text-slate-400 italic shrink-0 flex items-center gap-1",children:[e.jsx(Ee,{size:12,className:"text-amber-500"}),e.jsx("span",{children:"Quick Samples:"})]}),F.map(t=>e.jsxs("button",{onClick:()=>re(t.id),className:"px-2.5 py-1 rounded-lg text-xs italic font-medium bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all shrink-0",title:t.description,children:["*",t.name,"*"]},t.id))]})]}),e.jsxs("section",{className:"bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs",children:[e.jsxs("button",{onClick:()=>R(!0),className:`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${T?"bg-indigo-50 text-indigo-700":"text-slate-600 hover:text-slate-900"}`,children:[e.jsx(Te,{size:12}),e.jsx("span",{children:"Split (Side-by-Side)"})]}),e.jsxs("button",{onClick:()=>R(!1),className:`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${T?"text-slate-600 hover:text-slate-900":"bg-indigo-50 text-indigo-700"}`,children:[e.jsx(Re,{size:12}),e.jsx("span",{children:"Unified (Inline)"})]})]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-slate-600 select-none",children:[e.jsx("input",{type:"checkbox",checked:U,onChange:t=>P(t.target.checked),className:"rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"}),e.jsx("span",{children:"Ignore Whitespace"})]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-slate-600 select-none",children:[e.jsx("input",{type:"checkbox",checked:k,onChange:t=>se(t.target.checked),className:"rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"}),e.jsx("span",{children:"Ignore Case"})]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-slate-600 select-none",children:[e.jsx("input",{type:"checkbox",checked:I,onChange:t=>ae(t.target.checked),className:"rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"}),e.jsx("span",{children:"Word Wrap"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[s==="spreadsheet"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-slate-500",children:"Key Column:"}),e.jsx("input",{type:"text",value:D,onChange:t=>O(t.target.value),placeholder:"e.g. SKU or ID",className:"w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono",title:"Column name used to identify matching rows (e.g. SKU, ID, email)"}),e.jsxs("div",{className:"flex bg-white rounded border border-slate-200 p-0.5",children:[e.jsx("button",{onClick:()=>V("table"),className:`px-2 py-0.5 rounded text-[11px] font-bold ${M==="table"?"bg-indigo-600 text-white":"text-slate-600"}`,children:"Table Grid"}),e.jsx("button",{onClick:()=>V("text"),className:`px-2 py-0.5 rounded text-[11px] font-bold ${M==="text"?"bg-indigo-600 text-white":"text-slate-600"}`,children:"Raw CSV"})]})]}),v&&e.jsxs("div",{className:"flex items-center gap-1.5 text-[11px] font-bold",children:[e.jsxs("span",{className:"px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200",children:["+",v.stats.added," Added"]}),e.jsxs("span",{className:"px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200",children:["-",v.stats.removed," Removed"]}),e.jsxs("span",{className:"px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200",children:["~",v.stats.modified," Changed"]})]})]})]}),e.jsxs("section",{className:"grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-white",children:[e.jsxs("div",{className:"flex flex-col h-72 lg:h-80",children:[e.jsxs("div",{className:"px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0 pr-2",children:[e.jsx("span",{className:"font-bold text-slate-800 truncate",children:u}),a&&e.jsx("span",{className:"px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono truncate",children:a})]}),e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsx("span",{className:"text-[11px] text-slate-400 font-mono",children:f?`${f.split(`
`).length} lines`:"0 lines"}),e.jsx("button",{onClick:()=>{var t;return(t=G.current)==null?void 0:t.click()},className:"p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors",title:"Upload file for Left side",children:e.jsx(X,{size:13})}),e.jsx("input",{ref:G,type:"file",className:"hidden",onChange:t=>{var g;const o=(g=t.target.files)==null?void 0:g[0];o&&z("left",o)}})]})]}),e.jsx("textarea",{value:f,onChange:t=>x(t.target.value),placeholder:de,className:"flex-1 p-3 font-mono text-xs text-slate-800 bg-white resize-none focus:outline-none placeholder:italic placeholder:text-slate-400 leading-relaxed overflow-y-auto",spellCheck:!1})]}),e.jsxs("div",{className:"flex flex-col h-72 lg:h-80",children:[e.jsxs("div",{className:"px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0 pr-2",children:[e.jsx("span",{className:"font-bold text-slate-800 truncate",children:C}),m&&e.jsx("span",{className:"px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono truncate",children:m})]}),e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsx("span",{className:"text-[11px] text-slate-400 font-mono",children:j?`${j.split(`
`).length} lines`:"0 lines"}),e.jsx("button",{onClick:()=>{var t;return(t=H.current)==null?void 0:t.click()},className:"p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors",title:"Upload file for Right side",children:e.jsx(X,{size:13})}),e.jsx("input",{ref:H,type:"file",className:"hidden",onChange:t=>{var g;const o=(g=t.target.files)==null?void 0:g[0];o&&z("right",o)}})]})]}),e.jsx("textarea",{value:j,onChange:t=>p(t.target.value),placeholder:ce,className:"flex-1 p-3 font-mono text-xs text-slate-800 bg-white resize-none focus:outline-none placeholder:italic placeholder:text-slate-400 leading-relaxed overflow-y-auto",spellCheck:!1})]})]}),e.jsx("main",{className:"flex-1 p-4 sm:p-6 bg-slate-100 flex flex-col",children:e.jsxs("div",{className:"bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col",children:[e.jsxs("div",{className:"px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs",children:[e.jsxs("span",{className:"font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5",children:[e.jsx(J,{size:14,className:"text-indigo-600"}),e.jsx("span",{children:"Comparison Output"})]}),e.jsx("span",{className:"text-[11px] text-slate-500",children:T?"Side-by-Side View":"Inline Unified View"})]}),s==="spreadsheet"&&M==="table"&&v?e.jsx("div",{className:"flex-1 overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-xs text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-slate-100 border-b border-slate-300 text-slate-700 font-bold",children:[e.jsx("th",{className:"p-2 border-r border-slate-200 text-center w-12",children:"#"}),e.jsx("th",{className:"p-2 border-r border-slate-200 text-center w-20",children:"Diff"}),v.headers.map(t=>e.jsxs("th",{className:"p-2 border-r border-slate-200 min-w-28 font-mono",children:[t," ",D===t&&e.jsx("span",{className:"text-[9px] text-indigo-600 uppercase",children:"(Key)"})]},t))]})}),e.jsx("tbody",{className:"divide-y divide-slate-200 font-mono",children:v.rows.map((t,o)=>{const g=t.status==="added",b=t.status==="removed",S=t.status==="modified";let w="bg-white hover:bg-slate-50";g&&(w="bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950"),b&&(w="bg-rose-50 hover:bg-rose-100/70 text-rose-950 line-through"),S&&(w="bg-amber-50/70 hover:bg-amber-100/70 text-amber-950");const A=t.rowNumberRight||t.rowNumberLeft||o+1;return e.jsxs("tr",{className:`${w} transition-colors`,children:[e.jsx("td",{className:"p-2 border-r border-slate-200 text-center text-slate-400 font-mono text-[10px]",children:A}),e.jsxs("td",{className:"p-2 border-r border-slate-200 text-center",children:[g&&e.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800",children:"+ Added"}),b&&e.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800",children:"- Removed"}),S&&e.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900",children:"~ Changed"}),t.status==="unchanged"&&e.jsx("span",{className:"text-slate-400 text-[10px] font-bold",children:"Same"})]}),v.headers.map(L=>{const q=t.diffCells[L],Q=t.leftData?String(t.leftData[L]??""):"",Y=t.rightData?String(t.rightData[L]??""):"";return e.jsx("td",{className:`p-2 border-r border-slate-200 ${q?"bg-amber-200/80 font-bold border-amber-300":""}`,children:S&&q?e.jsxs("div",{className:"space-y-0.5",children:[e.jsx("div",{className:"line-through text-rose-700 text-[10px]",children:Q||"<empty>"}),e.jsx("div",{className:"text-emerald-800 font-bold",children:Y||"<empty>"})]}):e.jsx("span",{children:Y||Q||"—"})},L)})]},o)})})]})}):e.jsx("div",{className:"flex-1 overflow-x-auto text-xs font-mono",children:e.jsx(pe,{oldValue:ne,newValue:le,splitView:T,compareMethod:xe.WORDS,leftTitle:u,rightTitle:C,hideLineNumbers:!1,useDarkTheme:!1,styles:{variables:{light:{diffViewerBackground:"#ffffff",diffViewerColor:"#1e293b",addedBackground:"#ecfdf5",addedColor:"#065f46",removedBackground:"#fff1f2",removedColor:"#9f1239",wordAddedBackground:"#a7f3d0",wordRemovedBackground:"#fecdd3",addedGutterBackground:"#d1fae5",removedGutterBackground:"#ffe4e6",gutterBackground:"#f8fafc",gutterBackgroundDark:"#f1f5f9",gutterColor:"#94a3b8",codeFoldGutterBackground:"#f1f5f9",codeFoldBackground:"#f8fafc"}},line:{padding:"2px 8px",fontSize:"12px",fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",lineHeight:"1.5",wordBreak:I?"break-word":"normal",whiteSpace:I?"pre-wrap":"pre"}}})})]})})]})};export{We as default};
