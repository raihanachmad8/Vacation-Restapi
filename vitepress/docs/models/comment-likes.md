---
title: Comment Likes Model
description: Documentation for the Comment Likes model in the application.
sidebar: auto
---

# Comment Likes Model

The `Comment Likes` model represents the likes associated with comments within the application.

## Fields

### `like_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the like.

### `comment_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the comment that was liked.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who liked the comment.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the like was created.
