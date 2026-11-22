from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret


class RegisterSerializers(serializers.ModelSerializer):
    first_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False
    )
    class Meta:  # Must have a Capital "M"
        model = User
        # FIX: Ensure this is spelled exactly as 'fields' with a single 's'
        fields = ('id', 'email','first_name', 'password')  
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class CurrentUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'first_name', 'email')
