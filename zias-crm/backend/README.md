# ZIAS CRM Backend (Django REST Framework + JWT)

## Setup (Windows PowerShell)

    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py makemigrations crm
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py runserver

Server runs at http://127.0.0.1:8000

## API endpoints

| Method | URL | Body | Purpose |
|---|---|---|---|
| POST | /api/auth/register/ | {username, password} | Create user, returns access + refresh |
| POST | /api/auth/login/ | {username, password} | Returns access + refresh |
| POST | /api/auth/refresh/ | {refresh} | Returns a new access token |
| POST | /api/auth/logout/ | {refresh} | Blacklists the refresh token |
| GET | /api/customers/ | - | List (supports ?search= &status= &ordering=) |
| POST | /api/customers/ | customer JSON | Create |
| GET | /api/customers/{id}/ | - | Read one |
| PUT/PATCH | /api/customers/{id}/ | customer JSON | Update |
| DELETE | /api/customers/{id}/ | - | Delete |

Customer endpoints require the header `Authorization: Bearer <access>`.
Admin panel: http://127.0.0.1:8000/admin/
