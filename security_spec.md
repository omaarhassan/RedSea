# Security Specification - Red Sea Connect

## 1. Data Invariants
- A **WorkOrder** cannot be created without a valid `customerId` strictly matching `request.auth.uid`.
- Customers can only read and update work orders that they own (`resource.data.customerId == request.auth.uid`).
- Customers can only perform customer-allowed status transitions (e.g., cancelling before dispatch, accepting/declining quotes, confirming completion).
- Providers can only access and update Work Orders and Appointments assigned to their `providerId`.
- Internal costs, provider margin, and internal admin notes are strictly filtered or stored in admin-only secured structures.
- City and Service catalog definitions are read-only for public/customers, and writeable exclusively by Admins.

## 2. Dirty Dozen Threat Matrix
1. **Unauthenticated WorkOrder Write**: Blocked (requires auth and verified session).
2. **Impersonate Customer ID**: Blocked (`request.resource.data.customerId == request.auth.uid`).
3. **Customer Self-Assigning Provider**: Blocked (only Admin can assign `assignedProviderId`).
4. **Customer Arbitrary Status Jump**: Blocked (controlled state machine).
5. **Provider Viewing Unassigned Jobs**: Blocked (`resource.data.assignedProviderId == request.auth.uid` or Admin).
6. **Customer Reading Internal Margins**: Blocked (admin fields secured).
7. **Junk Character ID Injection**: Blocked (`isValidId` regex and length checks).
8. **Malicious Giant Payloads**: Blocked (explicit `.size()` string limits).
9. **Tampering with CreatedAt Timestamp**: Blocked (immutability rule).
10. **Unauthorized Service Catalog Alteration**: Blocked (Admin only).
11. **Profile Role Escalation**: Blocked (users cannot escalate to `ADMIN`).
12. **Double Booking Modification**: Blocked (Appointments checked server-side & admin controlled).
