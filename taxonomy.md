# ReachStack Document Taxonomy

ReachStack should treat documents as searchable client records first, and workflow inputs second. For common financial records such as invoices, the preferred source of truth should usually be the SMB's accounting system rather than AI document processing.

## Top-Level Document Types

Use these as the first-pass UI taxonomy.

| Type | Purpose | Examples |
| --- | --- | --- |
| Email | Client or stakeholder communication | Requests, approvals, complaints, missing-info replies, status checks, forwarded threads |
| Form | Structured intake or data capture | Client intake form, onboarding form, authority form, change request, service request |
| Contract | Binding or draft agreement | Service agreement, supplier contract, lease, statement of work, partnership agreement |
| Report | Prepared business or professional report | Management report, board pack, audit report, payroll report, advisory report |
| Financial | Finance and accounting records | Invoice, receipt, quote, purchase order, remittance, bank statement, supplier statement, BAS/GST document |
| Identity | Identity and entity verification | ID, proof of address, ABN/ACN details, company extract, director details |
| Compliance | Regulatory, risk, or assurance material | KYC/AML material, compliance checklist, risk assessment, signed declaration, privacy consent |
| Meeting Note | Human or AI-generated meeting record | Call summary, meeting notes, action list, discovery notes, handover notes |
| Supporting File | Evidence or attachment that supports work | Screenshots, photos, letters, notices, document bundles, spreadsheets, signed PDFs |
| Other | Fallback for uncategorised material | Anything not yet mapped to a stable type |

## Financial Documents

Financial documents should be handled carefully because many already belong in dedicated accounting systems.

Preferred approach:

- If the record already exists in Xero, MYOB, QuickBooks, or another accounting platform, ReachStack should integrate, link, search, and summarise it rather than becoming the source of truth.
- If the record arrives by email, portal, or file upload and is not yet in the accounting system, ReachStack can extract enough information to route it, create a task, or prepare it for sync.
- Invoices, receipts, purchase orders, and remittances should be treated as operational records until the accounting platform confirms sync.

Suggested financial subtypes:

- Invoice
- Receipt
- Quote / estimate
- Purchase order
- Bank statement
- Supplier statement
- Payment remittance
- Payroll report
- BAS / GST document
- Financial statement
- Management accounts

## Professional Services Subtypes

These subtypes are useful across accounting, advisory, consulting, legal support, agencies, and other professional services firms.

- Engagement letter
- Signed authority
- Client intake form
- Statement of work
- Proposal
- Scope change
- Advice memo
- Draft response
- Review draft
- Board pack
- Management report
- Compliance checklist
- Risk assessment
- Client approval
- Meeting notes
- Call summary
- Action list
- Handover note

## Standard Metadata

Every document record should carry these fields where possible.

| Field | Notes |
| --- | --- |
| Document type | One of the top-level types above |
| Subtype | More specific label, such as Invoice or Engagement letter |
| Client | Linked client/customer |
| Engagement | Linked work item, matter, project, or service engagement |
| Source | Email, portal, Google Drive, Microsoft 365, upload, accounting software, CRM |
| Source system ID | External ID when synced from another system |
| Status | Indexed, processing, needs review, missing info, filed, synced, archived |
| Owner | Staff member or system owner |
| Created / received date | When the record arrived or was created |
| Last updated date | Last meaningful change |
| Tags | Search and workflow labels |
| Extracted summary | Short system-generated summary |
| Searchable text | Extracted or indexed text |
| Citations | Snippets and source locations used by AI answers |
| Linked tasks | Follow-ups, approvals, missing-info requests |
| Linked bookings | Meetings or calls related to the document |
| Linked time entries | Billable or non-billable time associated with the document |
| Audit history | Who viewed, edited, approved, synced, or exported it |

## Status Values

Initial document statuses:

- Indexed
- Processing
- Needs review
- Missing info
- Filed
- Synced
- Archived

## Source Systems

Initial source system values:

- Email
- Client portal
- Manual upload
- Google Drive
- Microsoft 365 / SharePoint / OneDrive
- Accounting software
- CRM
- Calendar
- System generated

## V1 Product Rules

- Keep the top-level taxonomy simple in the UI.
- Use subtypes for detail, not extra navigation complexity.
- Always link documents to clients where possible.
- Link to an engagement when the document belongs to active work.
- Do not make ReachStack the source of truth for records that already have a clear system of record.
- AI answers should cite the exact document or record used.
- Document processing actions should appear in audit history.
