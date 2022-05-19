# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.2.0 - 2022-04-28

### Added

- Attempting to version and NPM package release via
  [auto](https://intuit.github.io/auto/)

## 1.1.2 - 2021-03-30

### Fixed

- Updates (primarily documentation) for switching to using auth tokens.

## 1.1.1 - 2021-12-03

### Fixed

- Switched from /users/ to /members/ API call to pull in all available members
  of an organization.

## 1.1.0 - 2021-12-03

### Added

- New properties added to resources:

  | Entity          | Properties                                                                                            |
  | --------------- | ----------------------------------------------------------------------------------------------------- |
  | `sentry_member` | `createdOn`, `active`, `isManaged`, `isStaff`, `isSuperuser`, `dataJoined`, `lastActive`, `lastLogin` |

## 1.0.0 - 2021-11-12

### Added

- Initial Sentry integration release

- Added support for ingesting the following **new** resources:

  | Resources    | Entity `_type`        | Entity `_class` |
  | ------------ | --------------------- | --------------- |
  | Member       | `sentry_member`       | `User`          |
  | Organization | `sentry_organization` | `Account`       |
  | Project      | `sentry_project`      | `Project`       |
  | Team         | `sentry_team`         | `UserGroup`     |

- Added support for ingesting the following **new** relationships:

  | Source Entity `_type` | Relationship `_class` | Target Entity `_type` |
  | --------------------- | --------------------- | --------------------- |
  | `sentry_organization` | **HAS**               | `sentry_member`       |
  | `sentry_organization` | **HAS**               | `sentry_project`      |
  | `sentry_organization` | **HAS**               | `sentry_team`         |
  | `sentry_team`         | **ASSIGNED**          | `sentry_project`      |
  | `sentry_team`         | **HAS**               | `sentry_member`       |
