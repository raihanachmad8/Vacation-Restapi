---
title: Event Model
description: Documentation for the Event model in the application.
sidebar: auto
---

# Event Model

The `Event` model represents events within the application.

## Fields

### `event_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the event.

### `user_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the user who created the event.

### `title`
- **Type**: string
- **Description**: The title of the event.

### `price_range`
- **Type**: string
- **Description**: The price range of the event.

### `location_state`
- **Type**: string
- **Description**: The state where the event is located.

### `location_province`
- **Type**: string
- **Description**: The province where the event is located.

### `location_city`
- **Type**: string
- **Description**: The city where the event is located.

### `location_postal_code`
- **Type**: string
- **Description**: The postal code of the event location.

### `hours_operation_start`
- **Type**: time
- **Description**: The start time of the event.

### `hours_operation_end`
- **Type**: time
- **Description**: The end time of the event.

### `photo`
- **Type**: string
- **Description**: The URL of the event photo.

### `description`
- **Type**: string
- **Description**: The description of the event.

### `category_event_id`
- **Type**: string
- **Format**: uuid
- **Description**: The identifier of the event category.

### `created_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the event was created.

### `updated_at`
- **Type**: timestamp
- **Description**: The timestamp indicating when the event was last updated.
