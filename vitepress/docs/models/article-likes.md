---
title: Article Likes Model
description: Documentation for the Article Likes model in the application.
sidebar: auto
---

# Article Likes Model

The `Article Likes` model represents the likes associated with articles within the application.

## Fields

### `like_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the like.

### `article_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the article that was liked.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who liked the article.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the like was created.
