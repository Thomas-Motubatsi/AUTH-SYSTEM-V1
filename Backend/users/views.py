from rest_framework import viewsets, permissions, mixins
from rest_framework.response import Response
from .serializers import RegisterSerializers, LoginSerializer,  CurrentUserSerializer
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from knox.auth import TokenAuthentication
from rest_framework.decorators import action





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
        
class UserViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    authentication_classes = (TokenAuthentication,)
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = RegisterSerializers

    @action(detail=False, methods=['get'])
    def me(self, request):

        serializer = CurrentUserSerializer(request.user)

        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)