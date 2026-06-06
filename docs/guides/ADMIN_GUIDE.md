# AppForge Administrator Guide

Welcome to the Admin Guide. As an Administrator, you have the power to define the database and application structures without writing code.

## 1. Creating Data Models (Entities)

1. Navigate to **Data Models** in the sidebar.
2. Click **Create New Entity**.
3. Name your entity (e.g., `Employee`).

### Adding Fields
Add fields to define what data this entity holds:
- **TEXT**: Short strings (e.g., Names).
- **TEXTAREA**: Long strings (e.g., Biographies).
- **NUMBER**: Integers or decimals.
- **BOOLEAN**: True/False toggles.
- **DATE**: Calendar pickers.

*Note: Once you save the entity, the system automatically provisions the database storage and REST APIs for this model. You do not need to run any migrations.*

## 2. Managing Users & Access (RBAC)

1. Navigate to **Settings > Users**.
2. You can invite new users to your organization.
3. Assign Roles:
   - **ADMIN**: Can create/edit Data Models and manage users.
   - **USER**: Can only interact with the generated UI and insert data.

## 3. Reviewing Audit Logs

AppForge provides strict compliance tracking.
1. Navigate to the **Dashboard**.
2. The **Activity Feed** displays a chronological timeline of every action (Create, Update, Delete) performed by any user in your organization.
