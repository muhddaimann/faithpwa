# Repository Migration Guide

## Objective

Migrate FAITH PWA source code ownership from the personal GitHub repository to the company GitHub organization repository while preserving commit history and enabling future deployment through Docker and Dokploy.

### Source Repository

https://github.com/muhddaimann/faithpwa

### Target Repository

https://github.com/maiman0/faithpwa

---

# Step 1 - Verify Working Tree

Ensure all local changes are committed.

```bash
git status
```

If there are uncommitted changes:

```bash
git add .
git commit -m "Prepare repository for company migration"
git push origin main
```

---

# Step 2 - Verify Current Remote

Check current repository configuration.

```bash
git remote -v
```

Expected:

```text
origin  git@github.com:muhddaimann/faithpwa.git
```

or

```text
origin  https://github.com/muhddaimann/faithpwa.git
```

---

# Step 3 - Add Company Remote

Add the company repository as a new remote.

```bash
git remote add company https://github.com/maiman0/faithpwa.git
```

Verify:

```bash
git remote -v
```

Expected:

```text
origin   https://github.com/muhddaimann/faithpwa.git
company  https://github.com/maiman0/faithpwa.git
```

---

# Step 4 - Push to Company Repository

Push the existing branch and full history.

```bash
git push company main
```

If using another default branch:

```bash
git push company master
```

or

```bash
git push company develop
```

depending on the project.

---

# Step 5 - Verify Migration

Confirm the following items exist in the company repository:

* Source code
* Commit history
* Dockerfile
* docker-compose.yml
* .dockerignore
* .env.example
* README.md
* Deployment Guide

---

# Step 6 - Switch Local Repository to Company Remote

Once migration is verified:

```bash
git remote remove origin
```

Rename company remote:

```bash
git remote rename company origin
```

Verify:

```bash
git remote -v
```

Expected:

```text
origin https://github.com/maiman0/faithpwa.git
```

---

# Step 7 - Test New Remote

Perform a test push.

```bash
git push
```

Perform a test pull.

```bash
git pull
```

Both operations should succeed against the company repository.

---

# Step 8 - Handover Preparation

Ensure the repository contains:

```text
faithpwa
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── README.md
├── Deployment Guide
└── Source Code
```

---

# Expected Outcome

```text
Developer
    │
    ▼
Company GitHub Repository
    │
    ▼
Dokploy
    │
    ▼
Docker Build
    │
    ▼
Container Deployment
    │
    ▼
FAITH PWA
```

The project is now owned by the company GitHub organization and ready for future Dokploy deployment.
