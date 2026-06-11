# Railway Booking App

A train ticket booking web application built with Angular 21, connected to the Step Academy Railway API.

## Live Demo

[Coming Soon]

## Features

- Browse available train routes and schedules
- Select departure and destination stations
- View seat availability per wagon
- Book tickets with user authentication
- Full auth flow — register, login, token refresh
- Protected routes with functional guards
- HTTP interceptor for automatic token attachment

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=flat&logo=reactivex&logoColor=white)

## Architecture

- **Standalone components** — Angular 21 modern architecture
- **Functional guards** — route protection based on auth state
- **HTTP Interceptor** — attaches JWT token to all requests automatically
- **forkJoin** — parallel API calls for wagon seat data
- **Lazy loading** — feature modules loaded on demand
- **Reactive forms** — form validation and submission

## API

Connected to `railway.stepprojects.ge` — Step Academy's Railway REST API.
Authentication via `everrest.stepprojects.ge`.

## Getting Started

```bash
git clone https://github.com/datogeguchadze1/ang3
cd ang3
npm install
ng serve
```

## Deployment

Deployed on Netlify with SPA routing support (`_redirects`).
