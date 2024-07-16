---
title: Article Bookmarks Model
description: Documentation for the Article Bookmarks model in the application.
sidebar: auto
---

# Article Bookmarks Model

The `Article Bookmarks` model represents the bookmarks associated with articles within the application.

## Fields

### `bookmark_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the bookmark.

### `article_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the article that was bookmarked.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who bookmarked the article.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the bookmark was created.
