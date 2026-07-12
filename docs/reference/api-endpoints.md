---
title: "ETL API Reference"
tags: ["api", "hitl", "endpoints", "silver", "gold"]
created_at: "2026-07-11"
last_updated_at: "2026-07-11"
---

# Elite ETL API Reference

This document outlines the core API endpoints exposed by the Elite ETL pipeline. It serves as the primary reference for building the `elite_dashboard` frontend and orchestrating the Human-in-the-Loop (HitL) ETL processes.

## 1. Bronze Sync

Triggers the initial extraction and loading of data into the raw Bronze layer.

* **Endpoint:** `POST /api/v1/pipeline/bronze/sync/{source_id}`
* **Description:** Initiates a background job to download, verify, and load data from the registered source URL into raw PostgreSQL tables via `python-dlt`.
* **Payload:**
  ```json
  {
    "limit_mb": 10
  }
  ```
* **Response:** Returns an asynchronous `job_id`.

## 2. Bronze Catalog (Schema Introspection)

Retrieves the structural schema menu of all tables generated during the Bronze sync. This is the crucial first step of the HitL handshake.

* **Endpoint:** `GET /api/v1/pipeline/bronze/catalog/{source_id}`
* **Description:** Returns a detailed list of all physical tables and their precise column data types that were dynamically generated in the database.
* **Response Payload (Example):**
  ```json
  {
    "source_id": "d1584036-f5e4-4213-b000-8484b91b8521",
    "layer": "bronze",
    "tables": [
      {
        "table_name": "raw_spansh_populated",
        "columns": [
          {"name": "id64", "data_type": "bigint"},
          {"name": "name", "data_type": "text"},
          {"name": "coords__x", "data_type": "double"}
        ]
      }
    ]
  }
  ```

## 3. Silver Normalization

Submits the user's custom SQL transformation logic to the server. The server performs a transactional "Dry Run" validation before writing the templates and triggering execution.

* **Endpoint:** `POST /api/v1/pipeline/silver/normalize/{source_id}`
* **Payload:** `SqlTransformPayload`
  ```json
  {
    "dry_run": false,
    "transformations": [
      {
        "target_table": "stg_spansh_populated",
        "sql": "CREATE TABLE IF NOT EXISTS silver.stg_spansh_populated AS SELECT * FROM bronze.raw_spansh_populated;"
      }
    ]
  }
  ```
* **Behavior:** 
  1. Validates the `sql` against the database via a rollback transaction. If `dry_run` is true, returns immediately after validation.
  2. If `dry_run` is false, writes the SQL to the filesystem (`data/sql_templates/`) and registers the reference pointer in the Data Lineage Catalog.
  3. Executes the background normalization job.
* **Error Response (Validation Failure):** Returns `400 Bad Request` containing the direct PostgreSQL error string (e.g., `ERROR: column "foo" does not exist`).

## 4. Gold Aggregation

Submits the user's custom SQL to perform fact/dimension aggregations and business modeling on top of the Silver layer.

* **Endpoint:** `POST /api/v1/pipeline/gold/aggregate/{source_id}`
* **Payload:** `SqlTransformPayload`
  ```json
  {
    "dry_run": false,
    "transformations": [
      {
        "target_table": "dim_spansh_populated",
        "sql": "CREATE TABLE IF NOT EXISTS gold.dim_spansh_populated AS SELECT * FROM silver.stg_spansh_populated;"
      }
    ]
  }
  ```
* **Behavior:** Operates identically to the Silver endpoint, isolating validation, securely saving templates, updating lineage, and executing.
