
from rest_framework import viewsets, permissions, mixins
from rest_framework.response import Response
from rest_framework.decorators import action

from django.contrib.auth import get_user_model, authenticate

from knox.models import AuthToken
from knox.auth import TokenAuthentication

from .permissions import IsITAdmin

from .serializers import (
    RegisterSerializers,
    LoginSerializer,
    CurrentUserSerializer,
    UserManagementSerializer
)

User = get_user_model()


class LoginViewset(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if user:
            _, token = AuthToken.objects.create(user)
            return Response(
                {
                    'user': LoginSerializer(user).data,
                    'token': token,
                }
            )

        return Response({'error': 'Invalid credentials'}, status=401)



class RegisterViewset(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializers

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
        



class UserViewset(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    authentication_classes = (TokenAuthentication,)
    permission_classes = [IsITAdmin]
    queryset = User.objects.all().order_by('first_name', 'email')
    serializer_class = UserManagementSerializer

    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action == 'me':
            return [permissions.IsAuthenticated()]

        return [IsITAdmin()]

    def get_serializer(self, *args, **kwargs):
        if self.action == 'me':
            serializer_class = CurrentUserSerializer
        else:
            serializer_class = UserManagementSerializer

        kwargs.setdefault('context', self.get_serializer_context())

        return serializer_class(*args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
