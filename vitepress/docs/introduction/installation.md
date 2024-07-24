---
title: Introduction
description: Installation
sidebar: auto
aside: right
---

# Installation

Welcome to the installation guide for Vacation RestAPI. Follow these steps to set up the project on your local machine.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js `version 18.x or higher`
- npm `version 9.x or higher`, yarn `version 1.22.x or higher`, or pnpm `version 8.x or higher`
- Git
- Mysql (recommended because I build with mysql and there is an event trigger in prisma migration)
- Docker (if you plan to use Docker for deployment). You can also use MySQL directly if you prefer.

## Step 1: Clone the Repository

First, clone the Vacation RestAPI repository from GitHub:

```shell
git clone https://github.com/raihanachmad8/Vacation-Restapi
```

## Step 2: Install Dependencies

Navigate to the project directory and install the necessary dependencies:

::: code-group

```shell [npm]
cd vacation-restapi
npm install 
```

```shell [yarn]
cd vacation-restapi
yarn 
```

```shell [pnpm]
cd vacation-restapi
pnpm install
```

:::

## Step 3: Configure Environment Variables

Create a .env file in the root directory of your project and add the required environment variables. Refer to the .env.example file for guidance:

```shell
cp .env.example .env
```

Edit the .env file to include your specific configuration:

```shell
# Example environment variables
APP_NAME=vacation-restapi
APP_ENV=development
APP_URL=http://localhost:8000

DB_DATABASE=vacation-restapi
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_SCHEMA=public
DB_SSL=false
DB_TIMEZONE=UTC

JWT_SECRET=
JWT_SECRET_EXPIRATION=3h

JWT_SECRET_REFRESH=
JWT_SECRET_REFRESH_EXPIRATION=3d

# This was inserted by `prisma init`:
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings


DATABASE_URL="mysql://root:root@localhost:3306/vacation-restapi?schema=public"
```

## Step 4: Database Setup

If your project requires a database, set it up according to the instructions in the documentation. For example, if you are using Docker, you might run:

```shell
docker-compose up -d
```

Note: note if you want to access the database outside of docker you must prepare a public docker network ip

::: tip
Note: if you want to access the database outside of docker you must prepare a public docker network ip
:::

## Step 5: Start the Development Server

Once everything is set up, start the development server:


::: code-group

```shell [npm]
npm run dev
```

```shell [yarn]
yarn dev
```

```shell [pnpm]
pnpm dev
```

:::

## Step 6: Building for Production

To build the project for production, use the following command:

::: code-group

```shell [npm]
npm run build
```

```shell [yarn]
yarn build
```

```shell [pnpm]
pnpm build
```

:::

## Conclusion

You have successfully installed Vacation RestAPI. You can now start exploring its features and integrating it with your applications. For more detailed information, refer to the full documentation.

For any issues or questions, please reach out to our support team at [support@vacationrestapi.com](mailto:raihanachmad8@gmail.com).

This guide provides a comprehensive step-by-step installation process for setting up the Vacation RestAPI project. Adjust the details as necessary to fit your specific setup and environment requirements.
