# Changelog

This changelog covers **only the two most recent published GitHub releases** of `tiny_screenrecorder`. Each entry is based on the differences between its published tag and the immediately preceding **published release** tag. Commits made after `1.0.3` are excluded.

## [1.0.3] - 2026-10-15

Published: 2026-10-15 20:36:13 UTC.

Comparison: [1.0.2...1.0.3](https://github.com/EduardoKrausME/moodle-tiny_screenrecorder/compare/1.0.2...1.0.3)

### Changed

- Replaced the plugin icon asset: removed `pix/icon.svg` and added `pix/icon.png`.
- Updated the version metadata in `version.php` from `2026101500` / release `1.0.2` to `2026101501` / release `1.0.3`.

### Scope

The published-tag comparison contains two commits (`dab9782887d97e192c1c77cb8d945f281374c167` and `17303c9c13aeda47fc065a412f8f3a17a5813710`) and changes only `pix/icon.png`, `pix/icon.svg`, and `version.php`. There are no runtime code changes or recorder-behavior modifications in this comparison. The minimum Moodle build (`2024100700`) is unchanged.

## [1.0.2] - 2026-10-15

Published: 2026-10-15 18:37:37 UTC.

Comparison: [1.0.1...1.0.2](https://github.com/EduardoKrausME/moodle-tiny_screenrecorder/compare/1.0.1...1.0.2)

### Changed: continuous integration

- Updated the PostgreSQL service used by the GitHub Actions CI workflow from `postgres:16` to **`postgres:17`**.
- Updated the MariaDB CI service from `mariadb:10` to **`mariadb:11.4`**.
- Replaced the previous MariaDB empty-password environment configuration with `MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=1`, and switched the database readiness check from `mysqladmin ping` to `healthcheck.sh --connect --innodb_initialized`, with updated health-check retry settings.

### Changed: release metadata

- Updated `version.php` from version `2026101200` / release `1.0.1` to `2026101500` / release `1.0.2`.

### Scope

The published-tag comparison contains four commits and changes only `.github/workflows/ci.yml` and `version.php`. No application source files, screen recording features, or minimum Moodle requirements changed between these tags. The database version updates describe the CI test environment and do not by themselves establish a change in the plugin's production database requirements.

---

All statements are grounded in published Git tag diffs; no tests or deployments were executed while writing this changelog.
