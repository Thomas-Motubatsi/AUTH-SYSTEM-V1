
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'email': instance.email,
            'first_name': instance.first_name,
            'role': instance.role
        }


class RegisterSerializers(serializers.ModelSerializer):
    first_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CurrentUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'first_name', 'email', 'role')


class UserManagementSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'role',
            'is_active',
        )
        read_only_fields = ('id', 'email')

    def validate(self, attrs):
        request = self.context.get('request')

        if request and self.instance:
            if self.instance.pk == request.user.pk:

                if attrs.get('is_active') is False:
                    raise serializers.ValidationError(
                        "You cannot deactivate your own account."
                    )

                if (
                    'role' in attrs
                    and attrs['role'] != 'IT_ADMIN'
                    and request.user.role == 'IT_ADMIN'
                ):
                    raise serializers.ValidationError(
                        "You cannot remove your own IT Admin role."
                    )

        return attrs
