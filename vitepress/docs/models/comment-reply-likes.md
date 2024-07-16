---
title: Comment Reply Likes Model
description: Documentation for the Comment Reply Likes model in the application.
sidebar: auto
---

# Comment Reply Likes Model

The `Comment Reply Likes` model represents the likes associated with replies to comments within the application.

## Fields

### `like_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the like.

### `reply_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the reply that was liked.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who liked the reply.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the like was created.
