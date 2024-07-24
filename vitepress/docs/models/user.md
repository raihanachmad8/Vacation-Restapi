---
title: User Model
description: Documentation for the User model in the application.
sidebar: auto
---

# User Model

The `User` model represents a user within the application, encompassing all essential details required for user management, authentication, and authorization.

[[toc]]

## Table

### users

| Column     | Type      | Constraints                                           | Description                                                      |
| ---------- | --------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| user_id    | CHAR(36)  | PRIMARY KEY, DEFAULT (UUID())                         | A universally unique identifier (UUID) for the user.             |
| role       | ENUM      | DEFAULT 'Member'                                      | The role of the user, either 'Admin' or 'Member'.                |
| fullname   | VARCHAR   | NOT NULL                                              | The full name of the user.                                       |
| email      | VARCHAR   | NOT NULL, UNIQUE                                      | The user's email address, must be unique.                        |
| username   | VARCHAR   | NOT NULL, UNIQUE                                      | The unique username chosen by the user.                          |
| password   | VARCHAR   | NOT NULL                                              | The hashed password of the user.                                 |
| salt       | VARCHAR   | NOT NULL                                              | The salt used for hashing the user's password.                   |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP                             | The timestamp indicating when the user account was created.      |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | The timestamp indicating when the user account was last updated. |

## Fields

### `user_id`

- **Type**: string
- **Format**: uuid
- **Constraints**: primary key
- **Description**: A universally unique identifier (UUID) for the user, ensuring each user has a distinct identifier within the system.

### `role`

- **Type**: string
- **Format**: enum('Admin', 'Member')
- **Constraints**: default 'Member'
- **Description**: Identifies the role associated with the user, dictating permissions and access levels.

### `fullname`

- **Type**: string
- **Description**: The full name of the user, typically combining their first name and last name.

### `email`

- **Type**: string
- **Format**: email
- **Constraints**: required, unique
- **Description**: The user's email address, used for identification and communication purposes. Must be unique across all users.

### `username`

- **Type**: string
- **Constraints**: required, unique
- **Description**: The unique username chosen by the user for login and identification purposes.

### `password`

- **Type**: string
- **Constraints**: required
- **Description**: The hashed password of the user, stored securely for authentication.

### `salt`

- **Type**: string
- **Constraints**: required
- **Description**: The salt used for hashing the user's password, stored securely for authentication.

### `created_at`

- **Type**: timestamp
- **Constraints**: default current_timestamp
- **Description**: The timestamp indicating when the user account was created.

### `updated_at`

- **Type**: timestamp
- **Constraints**: default current_timestamp on update current_timestamp
- **Description**: The timestamp indicating when the user account was last updated.

## Description

The `User` model is pivotal in managing user interactions, authentication, and authorization within the system. It allows for unique identification of each user through a UUID, association with specific roles for access control, and storage of fundamental attributes such as name, email, and password.

This model forms the backbone for user-related operations and ensures the security and integrity of user data through appropriate constraints and data types.
