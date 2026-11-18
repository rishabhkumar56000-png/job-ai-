# JobMatch AI Security Specification (Phase 0)

## 1. Data Invariants
1. Every document under `/users/{userId}` and its subcollections (`resumes`, `jobMatches`, `skillProgress`, `roadmaps`, `interviews`) is strictly private to the authenticated owner (`request.auth.uid == userId && request.auth.token.email_verified == true`).
2. Every subcollection document (`resumes`, `jobMatches`, `skillProgress`, `roadmaps`, `interviews`) requires the parent `/users/{userId}` profile document to exist on creation and enforces `incoming().userId == userId`.
3. All `id`, `userId`, and `resumeId` path/document identifiers must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
4. All strings and arrays have bounded `.size()` limits to prevent resource exhaustion attacks.
5. `createdAt` and `userId` / `uid` are immutable after creation (`incoming().createdAt == existing().createdAt`, `incoming().userId == existing().userId`).
6. Timestamps (`createdAt`, `updatedAt`) must match `request.time` via `serverTimestamp()`.
7. All `allow list` rules verify `resource.data.userId == request.auth.uid` directly without `get()` or `exists()` lookups.

## 2. Adversarial "Dirty Dozen" Payloads Blocked by Rules
1. **Unauthenticated Profile Read**: `GET /users/userA` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Cross-User Resume Read**: `GET /users/userA/resumes/res1` signed in as `userB` -> `PERMISSION_DENIED`.
3. **Unverified Email Write**: `CREATE /users/userA` with `email_verified: false` -> `PERMISSION_DENIED`.
4. **UID Spoofing on Profile**: `CREATE /users/userA` with `uid: "userB"` -> `PERMISSION_DENIED`.
5. **Shadow Ghost Field Injection**: `CREATE /users/userA` including `isAdmin: true` -> `PERMISSION_DENIED`.
6. **Subcollection Orphan Write**: `CREATE /users/userA/resumes/res1` when `/users/userA` does not exist -> `PERMISSION_DENIED`.
7. **ID Poisoning**: `CREATE /users/userA/resumes/../../admin` or 500-char ID -> `PERMISSION_DENIED`.
8. **Client-Spoofed Timestamp**: `CREATE /users/userA/jobMatches/m1` with hardcoded `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
9. **Immutable Owner Mutation**: `UPDATE /users/userA/skillProgress/s1` changing `userId` -> `PERMISSION_DENIED`.
10. **Immutable CreatedAt Mutation**: `UPDATE /users/userA/roadmaps/r1` changing `createdAt` -> `PERMISSION_DENIED`.
11. **Unbounded Array / String Poisoning**: `CREATE /users/userA/resumes/res1` with `extractedText` > 35,000 chars or `programmingSkills` > 40 items -> `PERMISSION_DENIED`.
12. **Blanket List Query Scraping**: `LIST /users/userA/interviews` signed in as `userB` -> `PERMISSION_DENIED`.
