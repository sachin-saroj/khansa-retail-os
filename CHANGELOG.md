# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-31

### Added
- Initial release of Khansa Retail OS.
- Premium Luxury Editorial Dashboard.
- Advanced Predictive Inventory limits.
- Multilingual support (English/Hindi) via `LanguageContext`.
- Theme switching (Light/Dark) via `ThemeContext`.
- Secure HTTP-only refresh tokens.
- Immediate UI alerts for low inventory boundary checks.
- PDF generation engine for final Udhari billing configurations.

### Security
- Hardened CORS implementation restricting API access strictly to `CLIENT_URL`.
- Enforced safe database seeding by blocking `seed.js` execution when `NODE_ENV === 'production'`.
- Upgraded authentication with strict single-use Refresh Token Rotation system and payload revocation checking.
- Verified input payload sanitization against Stored XSS via HTML entity escaping (using `express-validator`).
- Mitigated DB race conditions in billing endpoints utilizing atomic Window functions (`COUNT(*) OVER()`).