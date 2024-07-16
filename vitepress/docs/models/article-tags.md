---
title: ArticleTags Model
description: Documentation for the ArticleTags model in the application.
sidebar: auto
---

# ArticleTags Model

The `ArticleTags` model represents the relationship between articles and tags in the application.

## Fields

### `tag_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the tag associated with the article.

### `article_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the article associated with the tag.

### `tag_name`
- **Type**: string
- **Description**: The name of the tag associated with the article.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the association between the article and tag was last updated.
