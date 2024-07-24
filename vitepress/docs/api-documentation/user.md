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

## Register User

The register allows users to register themselves by providing their fullname, email username and password. 

</template>
<template #right>

::: code-group

```curl
curl -X POST http://yourdomain.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "fullname": "yourname",
    "email"   : "yourmail@example.com",
    "username": "yourusername", 
    "password": "yourpassword"
}'

```

:::

<div style="padding: 10px 30px; border: 1px solid gray; border-radius:.4rem;">

Sample Response
::: code-group

```201
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 201,
    "message": "User successfully registered",
    "data": {
        "access_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWNhZDY2ZDktZDUzMC00OWRkLTkyMTgtOTYzMGM2NWI0MjBmIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6Ik1lbWJlciIsInRpbWVzdGFtcCI6MTcyMTgzOTE0MzUzMCwiaWF0IjoxNzIxODM5MTQzLCJleHAiOjE3MjE4NDk5NDN9.J9P_A4L0pmvvGgvRccEaa6eFIbrZMFCpbA67qhTsH5g",
            "expires_in": "2024-07-24T19:39:03.531Z"
        },
        "refresh_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWNhZDY2ZDktZDUzMC00OWRkLTkyMTgtOTYzMGM2NWI0MjBmIiwidGltZXN0YW1wIjoxNzIxODM5MTQzNTMyLCJpYXQiOjE3MjE4MzkxNDMsImV4cCI6MTcyMjA5ODM0M30.einDEmgscRq-pqIzD1ZCl1uP18OrPDif88veSG1bWdU",
            "expires_in": "2024-07-27T16:39:03.532Z"
        }
    }
}
```

```400
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 400,
    "message":  "Bad Request",
    "errors": {
        "username": [
            "The username field is required."
        ],
        "password": [
            "The password field is required."
        ]
    }
}
```

```403
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 403
    "message": "Forbiden"
}
```

```404
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 404,
    "message":  "Not Found",
}
```

```500
{
    "statusCode": 500,
    "message": "Internal Server Error",
}
```

:::
</div>

</template>
</DividePage>

<DividePage :top="63">
<template #left>

## Login User

The login endpoint allows a user to authenticate themselves by providing their username and password. Upon successful authentication, the server returns a token that can be used for subsequent authenticated requests.

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
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 200,
    "message": "User successfully logged in",
    "data": {
        "access_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWNhZDY2ZDktZDUzMC00OWRkLTkyMTgtOTYzMGM2NWI0MjBmIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6Ik1lbWJlciIsInRpbWVzdGFtcCI6MTcyMTgzOTE0MzUzMCwiaWF0IjoxNzIxODM5MTQzLCJleHAiOjE3MjE4NDk5NDN9.J9P_A4L0pmvvGgvRccEaa6eFIbrZMFCpbA67qhTsH5g",
            "expires_in": "2024-07-24T19:39:03.531Z"
        },
        "refresh_token": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWNhZDY2ZDktZDUzMC00OWRkLTkyMTgtOTYzMGM2NWI0MjBmIiwidGltZXN0YW1wIjoxNzIxODM5MTQzNTMyLCJpYXQiOjE3MjE4MzkxNDMsImV4cCI6MTcyMjA5ODM0M30.einDEmgscRq-pqIzD1ZCl1uP18OrPDif88veSG1bWdU",
            "expires_in": "2024-07-27T16:39:03.532Z"
        }
    }
}
```

```400
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 400,
    "message":  "Bad Request",
    "errors": {
        "username": [
            "The username field is required."
        ],
        "password": [
            "The password field is required."
        ]
    }
}
```

```403
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 403
    "message": "Forbiden"
}
```

```404
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 404,
    "message":  "Not Found",
}
```

```500
{
    "statusCode": 500,
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
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 200,
    "message": "User successfully logged out",
}
```

```401
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 400,
    "message":  "Unautorized"
}
```

```403
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 403
    "message": "Forbiden"
}
```

```404
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 404,
    "message":  "Not Found",
}
```

```500
{
    "statusCode": 500,
    "message": "Internal Server Error",
}
```

:::

</div>

</template>
</DividePage>


<DividePage :top="63">
<template #left>

## Refresh Token User

The Refresh token endpoint allows a user to invalidate their authentication token, and renew the token for access data.

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
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 200,
    "message": "Token successfully refreshed",
}
```

```401
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 400,
    "message":  "Unautorized"
}
```

```403
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 403
    "message": "Forbiden"
}
```

```404
{
    "timestamp": "2024-07-24T16:34:05.337Z",
    "statusCode": 404,
    "message":  "Not Found",
}
```

```500
{
    "statusCode": 500,
    "message": "Internal Server Error",
}
```

:::

</div>

</template>
</DividePage>
