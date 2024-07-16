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
- Docker (if you plan to use Docker for deployment). You can also use MySQL directly if you prefer.

## Step 1: Clone the Repository

First, clone the Vacation RestAPI repository from GitHub:

```shell
git clone https://github.com/yourusername/vacation-restapi.git
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
API_KEY=your_api_key
DATABASE_URL=your_database_url
```

## Step 4: Database Setup

If your project requires a database, set it up according to the instructions in the documentation. For example, if you are using Docker, you might run:

```shell
docker-compose up -d
```

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

For any issues or questions, please reach out to our support team at [support@vacationrestapi.com](mailto:support@vacationrestapi.com).

This guide provides a comprehensive step-by-step installation process for setting up the Vacation RestAPI project. Adjust the details as necessary to fit your specific setup and environment requirements.
