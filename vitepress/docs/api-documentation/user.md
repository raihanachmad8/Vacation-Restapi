---
title: Model
description: User
sidebar: auto
aside: false
---

<!-- <style>@import './node_modules/vitepress-theme-api/dist/style.css';</style> -->
<script setup>import {DividePage} from 'vitepress-theme-api';</script>

# User Specs

[[toc]]

<DividePage :top="63">
<template #left>

## Login User

The login endpoint allows a user to authenticate themselves by providing their email and password. Upon successful authentication, the server returns a token that can be used for subsequent authenticated requests.

</template>
<template #right>

::: code-group

```curl
curl -X POST http://yourdomain.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "yourusername",
    "password": "yourpassword"
}'

```

:::

<div style="padding: 10px 30px; border: 1px solid gray; border-radius:.4rem;">

Sample Response
::: code-group

```200
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "user_id": "123e4567-e89b-12d3-a456-426614174000",
            "full_name": "John Doe",
            "email": "user@example.com",
            "username": "johndoe"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

```400
{
    "success": false,
    "message": "Bad Request",
    "errors": {
        "email": [
            "The email field is required."
        ],
        "password": [
            "The password field is required."
        ]
    }
}
```

```403
{
    "success": false,
    "message": "Forbidden",
}
```

```404
{
    "success": false,
    "message": "Not Found",
}
```

```500
{
    "success": false,
    "message": "Internal Server Error",
}
```

:::
</div>

</template>
</DividePage>


<DividePage :top="63">
<template #left>

## Get User

The get user endpoint retrieves the authenticated user's information. This requires a valid token obtained from the login step.

</template>
<template #right>

::: code-group

```curl
curl -X GET http://yourdomain.com/api/user \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

:::

<div style="padding: 10px 30px; border: 1px solid gray; border-radius:.4rem;">

Sample Response
::: code-group

```200
{
    "success": true,
    "data": {
        "user": {
            "user_id": "123e4567-e89b-12d3-a456-426614174000",
            "role_id": "1b2b3b4b-5b6b-7b8b-9bab-cdedefababab",
            "full_name": "John Doe",
            "email": "user@example.com",
            "username": "johndoe",
            "phone": "123-456-7890",
            "photo_url": "http://yourdomain.com/images/profile.jpg",
            "created_at": "2023-07-15T12:34:56Z",
            "updated_at": "2024-07-15T12:34:56Z"
        }
    }
}
```

```401
{
    "success": false,
    "message": "Unauthorized",
}
```

```403
{
    "success": false,
    "message": "Forbidden",
}
```

```404
{
    "success": false,
    "message": "Not Found",
}
```

```500
{
    "success": false,
    "message": "Internal Server Error",
}
```

:::
</div>

</template>
</DividePage>

<DividePage :top="63">
<template #left>

## Logout User

The logout endpoint allows a user to invalidate their authentication token, effectively logging them out of the system.

</template>
<template #right>

::: code-group

```curl
curl -X POST http://yourdomain.com/api/auth/logout \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

:::

<div style="padding: 10px 30px; border: 1px solid gray; border-radius:.4rem;">

Sample Response
::: code-group

```200
{
    "success": true,
    "message": "Logout successful"
}
```

```401
{
    "success": false,
    "message": "Unauthorized",
}
```

```403
{
    "success": false,
    "message": "Forbidden",
}
```

```404
{
    "success": false,
    "message": "Not Found",
}
```

```500
{
    "success": false,
    "message": "Internal Server Error",
}
```

:::
</div>

</template>
</DividePage>