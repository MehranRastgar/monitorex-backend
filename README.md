
# Monitorex Backend

A backend service built with NestJS framework.

## Description

This is the backend service for the Monitorex application, built using:

- NestJS - A progressive Node.js framework
- TypeScript - For type-safe code
- MongoDB - For data persistence (based on the database providers setup)

## Prerequisites

- Node.js (>= 12.x.x)
- npm or yarn
- MongoDB instance running

## Installation

```bash
# Install dependencies
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Project Structure

```
src/
  ├── ability/              # Ability module (CASL authorization)
  ├── auth/                 # Authentication module
  ├── database/             # Database configuration
  ├── modules/              # Feature modules
  ├── users/               # Users module
  ├── app.controller.ts    # Main app controller
  ├── app.module.ts        # Main app module
  ├── app.service.ts       # Main app service
  ├── main.ts             # Application entry point
```

## Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and adjust the values:

```bash
# Copy example env file
cp .env.example .env
```

## License

[UNLICENSED](LICENSE)
