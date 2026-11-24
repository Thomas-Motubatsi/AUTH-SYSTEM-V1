from rest_framework import serializers
from .models import Ticket
from django.contrib.auth import get_user_model
from .models import Ticket, TicketActivity
from .models import Ticket, TicketActivity, Notification

User = get_user_model()

class TicketCreateSerializer(serializers.ModelSerializer):
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
        read_only_fields = ['id', 'ticket_number']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
class TicketSerializer(serializers.ModelSerializer):

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

        fields = [
            'id',
            'ticket_number',
            'title',
            'description',
            'category',
            'priority',
            'status',
            'department',
            'location',
            'created_by',
            'created_by_email',
            'assigned_to',
            'assigned_to_email',
            'resolution_notes',
            'resolved_at',
            'ai_summary',
            'ai_suggested_priority',
            'created_at',
            'updated_at',
        ]

        read_only_fields = fields
class TicketAssignSerializer(serializers.ModelSerializer):

    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='IT_STAFF')
    )

    class Meta:
        model = Ticket
        fields = ['assigned_to']

    def update(self, instance, validated_data):
        instance.assigned_to = validated_data['assigned_to']
        instance.save()

        return instance

class TicketUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = [
            'status',
            'resolution_notes'
        ]

    def validate(self, attrs):
        status_value = attrs.get('status')

        if status_value == Ticket.Status.RESOLVED:
            if not attrs.get('resolution_notes'):
                raise serializers.ValidationError({
                    'resolution_notes': 'Resolution notes are required when resolving a ticket.'
                })

        return attrs

    def update(self, instance, validated_data):
        instance.status = validated_data.get(
            'status',
            instance.status
        )

        instance.resolution_notes = validated_data.get(
            'resolution_notes',
            instance.resolution_notes
        )

        if instance.status == Ticket.Status.RESOLVED:
            from django.utils import timezone
            instance.resolved_at = timezone.now()

        instance.save()

        return instance

def get_fields(self):
    fields = super().get_fields()

    request = self.context.get('request')

    if not request or request.user.role != 'IT_ADMIN':
        fields.pop('created_by_email', None)
        fields.pop('assigned_to_email', None)

    return fields


class TicketActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()
    performed_by_email = serializers.EmailField(
        source='performed_by.email',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = TicketActivity
        fields = [
            'id',
            'action',
            'description',
            'performed_by_name',
            'performed_by_email',
            'created_at',
        ]
        read_only_fields = fields

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            full_name = obj.performed_by.get_full_name()
            return full_name or obj.performed_by.email

        return 'Deleted user'


class NotificationSerializer(serializers.ModelSerializer):
    ticket_number = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'ticket',
            'ticket_number',
            'is_read',
            'created_at',
        ]
        read_only_fields = fields

    def get_ticket_number(self, obj):
        if obj.ticket:
            return str(obj.ticket.ticket_number)
        return None
