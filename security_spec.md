# Security Specification - SKY Custom ROM CMS

## 1. Data Invariants
- A ROM must have a `maintainerId` that matches the `userId` of an authorized admin.
- A screenshot must be associated with a valid `romId`.
- Only `published` ROMs are visible to the public.
- Admin profiles can only be created/modified by super admins or the owners themselves (with restrictions on role/active status).

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a ROM with a `maintainerId` that is not the current user's UID.
2. **Privilege Escalation**: A regular admin attempts to update their own `isSuperAdmin` or `active` status in their profile.
3. **State Shortcutting**: A regular admin attempts to set their ROM status directly to `published` or `approved`.
4. **Unauthorized Deletion**: Admin A attempts to delete a ROM owned by Admin B.
5. **Unauthorized Access**: An unauthenticated user attempts to read ROMs with status `draft` or `pending`.
6. **Resource Poisoning**: Injecting a 2MB string into the ROM `description` field.
7. **Invalid Reference**: Creating a ROM with a `maintainerId` that doesn't exist in the `admins` collection.
8. **Shadow Fields**: Creating a ROM with extra fields not defined in the schema (e.g., `isFeatured: true`).
9. **PII Leak**: An unauthenticated user attempts to read an admin's private info (if any).
10. **Timestamp Manipulation**: Providing a future `createdAt` date from the client.
11. **Malicious ID**: Using a very long and strange string as a document ID to cause resource exhaustion.
12. **Public Write**: An unauthenticated user attempts to create a ROM or an admin profile.

## 3. Test Runner (Draft)
The `firestore.rules` will be tested against these scenarios using the Firebase Emulator or the `deploy_firebase` tool once finalized.
