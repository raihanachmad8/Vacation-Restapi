---
title: User Model
description: Documentation for the User model in the application.
sidebar: auto
---

# User Model

The `User` model represents a user within the application, encompassing all essential details required for user management, authentication, and authorization.

[[toc]]

## Fields

### `user_id`
- **Type**: string
- **Format**: uuid
- **Constraints**: primary key
- **Description**: A universally unique identifier (UUID) for the user, ensuring each user has a distinct identifier within the system.

### `role_id`
- **Type**: string
- **Format**: uuid
- **Description**: Identifies the role associated with the user, dictating permissions and access levels.

### `full_name`
- **Type**: string
- **Description**: The full name of the user, typically combining their first name and last name.

### `email`
- **Type**: string
- **Format**: email
- Constraints: required, unique
- **Description**: The user's email address, used for identification and communication purposes. Must be unique across all users.

### `username`
- Type: string
- Description: The unique username chosen by the user for login and identification purposes.

### `password`
- Type: string
- Constraints: required
- Description: The hashed password of the user, stored securely for authentication.

### `created_at`
- Type: timestamp
- Description: The timestamp indicating when the user account was created.

### `updated_at`
- Type: timestamp
- Description: The timestamp indicating when the user account was last updated.

### `phone`
- Type: string
- Description: The phone number associated with the user, if provided.

### `photo_url`
- Type: text
- Description: URL pointing to the user's profile picture or avatar.

## Description

The `User` model is pivotal in managing user interactions, authentication, and authorization within the system. It allows for unique identification of each user through a UUID, association with specific roles for access control, and storage of fundamental attributes such as name, email, and password.

This model forms the backbone for user-related operations and ensures the security and integrity of user data through appropriate constraints and data types.
