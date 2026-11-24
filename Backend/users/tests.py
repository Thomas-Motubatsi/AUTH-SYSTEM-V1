from django.contrib.auth import get_user_model
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class UserViewsetSerializerTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='test-password',
            role='IT_ADMIN',
        )
        self.staff = User.objects.create_user(
            email='staff@example.com',
            password='test-password',
            role='STAFF',
        )

    def authenticate_as(self, user):
        _, token = AuthToken.objects.create(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    def test_me_uses_current_user_serializer(self):
        self.authenticate_as(self.staff)

        response = self.client.get('/users/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data),
            {'id', 'first_name', 'email', 'role'},
        )

    def test_user_management_list_uses_management_serializer(self):
        self.authenticate_as(self.admin)

        response = self.client.get('/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data[0]),
            {'id', 'first_name', 'last_name', 'email', 'role', 'is_active'},
        )