---
title: Article Model
description: Documentation for the Article model in the application.
sidebar: auto
---

# Article Model

The `Article` model represents individual articles within the application.

## Fields

### `article_id`
- **Type**: string
- **Format**: uuid
- **Constraints**: primary key
- **Description**: A universally unique identifier (UUID) for the article, ensuring each article has a distinct identifier within the system.

### `article_title`
- **Type**: string
- **Constraints**: required
- **Description**: The title of the article.

### `article_content`
- **Type**: text
- **Description**: The main content or body of the article.

### `article_header_img_url`
- **Type**: string
- **Description**: URL pointing to the header image of the article.

### `created_by`
- **Type**: string
- **Description**: The user identifier (e.g., user_id) of the user who created the article.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the article was created.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the article was last updated.
