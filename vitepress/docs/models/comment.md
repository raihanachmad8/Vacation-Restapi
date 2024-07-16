---
title: Comment Model
description: Documentation for the Comment model in the application.
sidebar: auto
---

# Comment Model

The `Comment` model represents user comments on articles within the application.

## Fields

### `comment_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the comment.

### `article_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the article associated with the comment.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who posted the comment.

### `content`
- **Type**: string
- **Description**: The content of the comment.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the comment was created.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the comment was last updated.
