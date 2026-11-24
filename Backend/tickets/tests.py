from django.contrib.auth import get_user_model
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Ticket


User = get_user_model()


class TicketAuthenticationTests(APITestCase):
    def setUp(self):
        self.staff = self.create_user('staff@example.com', 'STAFF')
        self.other_staff = self.create_user('other@example.com', 'STAFF')
        self.it_staff = self.create_user('it@example.com', 'IT_STAFF')
        self.it_admin = self.create_user('admin@example.com', 'IT_ADMIN')

        self.staff_ticket = self.create_ticket(self.staff, 'Staff ticket')
        self.other_ticket = self.create_ticket(self.other_staff, 'Other ticket')

    def create_user(self, email, role):
        return User.objects.create_user(
            email=email,
            password='test-password',
            role=role,
        )

    def create_ticket(self, owner, title):
        return Ticket.objects.create(
            title=title,
            description='Ticket description',
            category=Ticket.Category.OTHER,
            created_by=owner,
        )

    def authenticate_as(self, user):
        _, token = AuthToken.objects.create(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    def test_ticket_list_accepts_knox_token(self):
        self.authenticate_as(self.staff)

        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data], [self.staff_ticket.id])

    def test_ticket_list_rejects_missing_token(self):
        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_token_authenticates_ticket_request(self):
        response = self.client.post(
            '/login/',
            {'email': self.staff.email, 'password': 'test-password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {response.data['token']}"
        )
        ticket_response = self.client.get('/api/tickets/')

        self.assertEqual(ticket_response.status_code, status.HTTP_200_OK)

    def test_it_staff_can_list_all_tickets(self):
        self.authenticate_as(self.it_staff)

        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {item['id'] for item in response.data},
            {self.staff_ticket.id, self.other_ticket.id},
        )

    def test_it_admin_can_list_all_tickets(self):
        self.authenticate_as(self.it_admin)

        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {item['id'] for item in response.data},
            {self.staff_ticket.id, self.other_ticket.id},
        )

    def test_user_without_ticket_role_is_forbidden(self):
        user = self.create_user('visitor@example.com', 'OTHER')
        self.authenticate_as(user)

        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
