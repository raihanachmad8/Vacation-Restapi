---
title: Personal Access Token Model
description: Documentation for the Personal Access Token model in the application.
sidebar: auto
---

# Personal Access Token Model

The `PersonalAccessToken` model represents the tokens used for user authentication, including access tokens and refresh tokens.

[[toc]]

## Table

### refresh_tokens

| Column                | Type         | Constraints                                           | Description                                                     |
| --------------------- | ------------ | ----------------------------------------------------- | --------------------------------------------------------------- |
| id                    | INT          | PRIMARY KEY, AUTO_INCREMENT                           | The unique identifier for the token entry.                      |
| access_token          | VARCHAR(400) | NOT NULL, UNIQUE                                      | The access token for the user session.                          |
| refresh_token         | VARCHAR(255) | NOT NULL, UNIQUE                                      | The refresh token for the user session.                         |
| user_id               | CHAR(36)     | FOREIGN KEY REFERENCES users(user_id)                 | The user ID associated with the tokens.                         |
| expires_access_token  | TIMESTAMP    | NOT NULL                                              | The expiration timestamp for the access token.                  |
| expires_refresh_token | TIMESTAMP    | NOT NULL                                              | The expiration timestamp for the refresh token.                 |
| created_at            | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                             | The timestamp indicating when the token entry was created.      |
| updated_at            | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | The timestamp indicating when the token entry was last updated. |

## Fields

### `id`
- **Type**: int
- **Constraints**: primary key, auto increment
- **Description**: The unique identifier for the token entry.

### `access_token`
- **Type**: string
- **Constraints**: required, unique
- **Description**: The access token for the user session.

### `refresh_token`
- **Type**: string
- **Constraints**: required, unique
- **Description**: The refresh token for the user session.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Constraints**: foreign key references users(user_id)
- **Description**: The user ID associated with the tokens.

### `expires_access_token`
- **Type**: timestamp
- **Constraints**: required
- **Description**: The expiration timestamp for the access token.

### `expires_refresh_token`
- **Type**: timestamp
- **Constraints**: required
- **Description**: The expiration timestamp for the refresh token.

### `created_at`
- **Type**: timestamp
- **Constraints**: default current_timestamp
- **Description**: The timestamp indicating when the token entry was created.

### `updated_at`
- **Type**: timestamp
- **Constraints**: default current_timestamp on update current_timestamp
- **Description**: The timestamp indicating when the token entry was last updated.

## Description

The `PersonalAccessToken` model is essential for managing user authentication tokens, including both access tokens and refresh tokens. This model ensures that each token is uniquely identified and associated with a specific user, with clear expiration times and timestamps for creation and updates.
