# Decisions

## PostgreSQL As Default

- Decision: use PostgreSQL as the real database and keep JSON only as fallback/tests.
- Reason: user explicitly requested real DB and backend persistence.

## File Uploads On Backend Disk

- Decision: upload files to local `uploads/` and store metadata in task materials.
- Reason: useful for course demo, avoids adding S3/minio complexity, and still proves server-side upload behavior.

## No Email Invitations

- Decision: users are added to workspace by login only.
- Reason: user explicitly rejected email flow.
