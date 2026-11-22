
from rest_framework import serializers
from .models import Ticket


class TicketCreateSerializer(serializers.ModelSerializer):
    """
    Handles ticket creation by hospital staff and IT staff.
    Automatically assigns the authenticated user as the ticket owner.
    """

    class Meta:
        model = Ticket

        fields = [
            'id',
            'ticket_number',
            'title',
            'description',
            'category',
            'department',
            'location',
        ]

        read_only_fields = [
            'id',
            'ticket_number',
        ]

    def create(self, validated_data):
        # Automatically assign the logged-in user.
        validated_data['created_by'] = self.context['request'].user

        return super().create(validated_data)


class TicketSerializer(serializers.ModelSerializer):
    """
    Handles ticket retrieval and displaying ticket information.
    Includes AI-generated analysis and user information.
    """

    created_by_email = serializers.EmailField(
        source='created_by.email',
        read_only=True
    )

    assigned_to_email = serializers.EmailField(
        source='assigned_to.email',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Ticket

        fields = '__all__'

        read_only_fields = [
            'id',
            'ticket_number',
            'created_by',
            'assigned_to',
            'status',
            'priority',
            'ai_summary',
            'ai_suggested_priority',
            'resolution_notes',
            'resolved_at',
            'created_at',
            'updated_at',
        ]
