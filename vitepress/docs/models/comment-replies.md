---
title: Comment Replies Model
description: Documentation for the Comment Replies model in the application.
sidebar: auto
---

# Comment Replies Model

The `Comment Replies` model represents the replies to comments within the application.

## Fields

### `reply_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the reply.

### `comment_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the comment being replied to.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who posted the reply.

### `content`
- **Type**: string
- **Description**: The content of the reply.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the reply was created.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the reply was last updated.
