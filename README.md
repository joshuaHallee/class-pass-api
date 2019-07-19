# class-pass-api

Classroom management API for Class Pass

This API documentation is broken down into different routes a user may call. A sample path / description / model is provided.

## Installation

### Node

After cloning or forking this repository

```bash
npm install
```

## API Paths

### User

POST
`/api/user/register`

```json
{
  "name": "YOUR_USERNAME",
  "email": "YOUR_EMAIL",
  "password": "YOUR_PASSWORD"
}
```

Creates a user login resource

POST
`/api/user/login`

```json
{
  "email": "YOUR_EXISTING_EMAIL",
  "password": "YOUR_EXISTING_PASSWORD"
}
```

### Announcements

POST
`/api/posts`

```json
{
  "title": "YOUR_TITLE",
  "description": "YOUR_DESCRIPTION"
}
```

Creates a resource

GET
`/api/posts`
Retrieves all available posts

GET
`/api/posts/:id`
Retrieves a specific post by ID

PATCH
`/api/posts/:id`

```json
{
  "title": "Joshua",
  "description": "Hallee api test"
}
```

Updates title / description

DELETE
`/api/posts/:id`
Removes a specific post by ID
