# NestJS Boilerplate

A boilerplate project built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [PostgreSQL](https://www.postgresql.org/).

## Installation

```bash
npm install
```

## Environment Setup

1. Create a `.env` file in the root directory.
2. Configure your database connection variables (e.g., `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`).

## Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Database Migrations

This project uses TypeORM for database migrations.

### Generate Migration

Generates a new migration file based on changes in your entities.

```bash
npm run migration:gen --name=MigrationName
```

### Create Empty Migration

Creates a blank migration file for manual SQL.

```bash
npm run migration:create --name=MigrationName
```

### Run Migrations

Applies all pending migrations to the database.

> **Note:** The run command targets the compiled files in the `dist` folder. You must build the project before running migrations.

```bash
npm run build
npm run migration:run
```

### Revert Migration

Reverts the most recently applied migration.

```bash
npm run migration:revert
```
