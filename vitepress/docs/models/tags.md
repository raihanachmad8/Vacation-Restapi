---
title: Tag Model
description: Documentation for the Tag model in the application.
sidebar: auto
---

# Tag Model

The `Tag` model represents tags associated with articles in the application.

## Fields

### `tag_id`
- **Type**: string
- **Format**: uuid
- **Constraints**: primary key
- **Description**: A universally unique identifier (UUID) for the tag, ensuring each tag has a distinct identifier within the system.

### `tag_name`
- **Type**: string
- **Constraints**: required, unique
- **Description**: The name of the tag, which categorizes articles.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the tag was created.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the tag was last updated.