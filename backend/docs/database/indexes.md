# Database Indexes

Proper indexing is critical for the performance of the MongoDB cluster. The schemas automatically build the following indices:

## Users Collection
- `email`: 1 (Unique)
- `roleId`: 1
- `collegeId`: 1 (Sparse)
- `department`: 1
- `status`: 1
- `googleId`: 1 (Unique, Sparse)
- `providers`: 1

## Roles Collection
- `name`: 1 (Unique)
- `permissions`: 1

## Lessons Collection
- `moduleId: 1, order: 1` (Unique Compound Index)
- `moduleId: 1, slug: 1` (Unique Compound Index)

*Note: There are no explicit TTL indexes for tokens currently since tokens are managed via expiration date checking on login/refresh.*
