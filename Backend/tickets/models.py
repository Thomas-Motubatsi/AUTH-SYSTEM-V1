from django.db import models
import uuid
from django.conf import settings


class Ticket(models.Model):

    class Category(models.TextChoices):
        HARDWARE = 'HARDWARE', 'Hardware'
        SOFTWARE = 'SOFTWARE', 'Software'
        NETWORK = 'NETWORK', 'Network'
        PRINTER = 'PRINTER', 'Printer'
        EMAIL = 'EMAIL', 'Email'
        ACCOUNT_ACCESS = 'ACCOUNT_ACCESS', 'Account Access'
        OTHER = 'OTHER', 'Other'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        ON_HOLD = 'ON_HOLD', 'On Hold'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    # Unique ticket reference
    ticket_number = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    # Ticket information
    title = models.CharField(max_length=200)

    description = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=Category.choices
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )

    # Additional hospital information
    department = models.CharField(
        max_length=120,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    # Ticket ownership
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='submitted_tickets'
    )

    # IT technician assigned to the ticket
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )

    # Resolution information
    resolution_notes = models.TextField(blank=True)

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['assigned_to', 'status']),
        ]

    def __str__(self):
        return f"Ticket {self.ticket_number} - {self.title}"

    # AI-generated ticket analysis

    ai_summary = models.TextField(
        blank=True,
        help_text="AI-generated summary of the reported issue."
    )

    ai_suggested_priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        null=True,
        blank=True,
        help_text="AI-recommended priority. Requires IT staff review."
    )


class TicketActivity(models.Model):

    class Action(models.TextChoices):
        CREATED = 'CREATED', 'Ticket Created'
        ASSIGNED = 'ASSIGNED', 'Ticket Assigned'
        REASSIGNED = 'REASSIGNED', 'Ticket Reassigned'
        STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
        RESOLUTION_UPDATED = 'RESOLUTION_UPDATED', 'Resolution Updated'

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='activities'
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ticket_activities'
    )

    action = models.CharField(
        max_length=30,
        choices=Action.choices
    )

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ticket', 'created_at']),
        ]

    def __str__(self):
        return f'{self.ticket.ticket_number} - {self.action}'


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )

    title = models.CharField(max_length=150)
    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.recipient.email}'
