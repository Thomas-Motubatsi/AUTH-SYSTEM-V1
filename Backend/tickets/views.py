
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from knox.auth import TokenAuthentication

from django.contrib.auth import get_user_model

from .models import Ticket, TicketActivity, Notification
from .serializers import (
    TicketCreateSerializer,
    TicketSerializer,
    TicketAssignSerializer,
    TicketUpdateSerializer,
    TicketActivitySerializer,
    NotificationSerializer,
)

User = get_user_model()



class TicketListCreateView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    # Get tickets according to the authenticated user's role.
    def get_queryset(self, user):

        queryset = Ticket.objects.select_related(
            'created_by',
            'assigned_to'
        )

        if user.is_superuser or user.role == 'IT_ADMIN':
            return queryset.all()

        elif user.role == 'STAFF':
            return queryset.filter(created_by=user)

        elif user.role == 'IT_STAFF':
            return queryset.filter(assigned_to=user)

        return queryset.none()

    # Retrieve tickets.
    def get(self, request):

        tickets = self.get_queryset(request.user)

        serializer = TicketSerializer(
            tickets,
            many=True,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # Create tickets.
    def post(self, request):

        if (
            request.user.role not in ['STAFF', 'IT_ADMIN']
            and not request.user.is_superuser
        ):
            return Response(
                {'error': 'You do not have permission to create tickets.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TicketCreateSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()

        # Record ticket creation activity.
        TicketActivity.objects.create(
            ticket=ticket,
            performed_by=request.user,
            action=TicketActivity.Action.CREATED,
            description=f'Ticket created by {request.user.email}.'
        )

        response_serializer = TicketSerializer(
            ticket,
            context={'request': request}
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )



class TicketAssignView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'IT_ADMIN' and not request.user.is_superuser:
            return Response(
                {'error': 'You do not have permission to assign tickets.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {'error': 'Ticket not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        previous_assignee = ticket.assigned_to

        serializer = TicketAssignSerializer(
            ticket,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        new_assignee = ticket.assigned_to

        # Record assignment activity
        if previous_assignee is None and new_assignee is not None:
            action = TicketActivity.Action.ASSIGNED
            description = (
                f'Ticket assigned to {new_assignee.email} '
                f'by {request.user.email}.'
            )

        elif (
            previous_assignee is not None
            and new_assignee is not None
            and previous_assignee != new_assignee
        ):
            action = TicketActivity.Action.REASSIGNED
            description = (
                f'Ticket reassigned from {previous_assignee.email} '
                f'to {new_assignee.email} by {request.user.email}.'
            )

        else:
            action = None
            description = None

        if action is not None:
            TicketActivity.objects.create(
                ticket=ticket,
                performed_by=request.user,
                action=action,
                description=description
            )

        # Notify the newly assigned technician
        if (
            new_assignee is not None
            and new_assignee != previous_assignee
        ):
            Notification.objects.create(
                recipient=new_assignee,
                ticket=ticket,
                title='New ticket assigned',
                message=(
                    f'You have been assigned ticket '
                    f'#{ticket.ticket_number}: {ticket.title}.'
                )
            )

        # Notify the previous technician about reassignment
        if (
            previous_assignee is not None
            and new_assignee is not None
            and previous_assignee != new_assignee
        ):
            Notification.objects.create(
                recipient=previous_assignee,
                ticket=ticket,
                title='Ticket reassigned',
                message=(
                    f'Ticket #{ticket.ticket_number} '
                    f'has been reassigned to {new_assignee.email}.'
                )
            )

        response_serializer = TicketSerializer(
            ticket,
            context={'request': request}
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )


class TechnicianListView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    # Retrieve available IT technicians.
    def get(self, request):

        if (
            request.user.role != 'IT_ADMIN'
            and not request.user.is_superuser
        ):
            return Response(
                {'error': 'Only IT administrators can view technicians.'},
                status=status.HTTP_403_FORBIDDEN
            )

        technicians = User.objects.filter(
            role='IT_STAFF',
            is_active=True
        ).values(
            'id',
            'first_name',
            'last_name',
            'email'
        )

        return Response(
            list(technicians),
            status=status.HTTP_200_OK
        )




class TicketUpdateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        is_admin = (
            request.user.role == 'IT_ADMIN'
            or request.user.is_superuser
        )

        is_technician = request.user.role == 'IT_STAFF'

        if not is_admin and not is_technician:
            return Response(
                {'error': 'You do not have permission to update tickets.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            if is_admin:
                ticket = Ticket.objects.get(pk=pk)
            else:
                ticket = Ticket.objects.get(
                    pk=pk,
                    assigned_to=request.user
                )

        except Ticket.DoesNotExist:
            return Response(
                {'error': 'Ticket not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND
            )

        previous_status = ticket.status
        previous_resolution_notes = ticket.resolution_notes

        serializer = TicketUpdateSerializer(
            ticket,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Record status change and notify ticket creator
        if previous_status != ticket.status:

            TicketActivity.objects.create(
                ticket=ticket,
                performed_by=request.user,
                action=TicketActivity.Action.STATUS_CHANGED,
                description=(
                    f'Ticket status changed from {previous_status} '
                    f'to {ticket.status} by {request.user.email}.'
                )
            )

            Notification.objects.create(
                recipient=ticket.created_by,
                ticket=ticket,
                title='Ticket status updated',
                message=(
                    f'Your ticket #{ticket.ticket_number} '
                    f'has changed from {previous_status} '
                    f'to {ticket.status}.'
                )
            )

        # Record resolution notes update
        if previous_resolution_notes != ticket.resolution_notes:

            TicketActivity.objects.create(
                ticket=ticket,
                performed_by=request.user,
                action=TicketActivity.Action.RESOLUTION_UPDATED,
                description=(
                    f'Resolution notes updated '
                    f'by {request.user.email}.'
                )
            )

        response_serializer = TicketSerializer(
            ticket,
            context={'request': request}
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )




class TicketHistoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            ticket = Ticket.objects.select_related(
                'created_by',
                'assigned_to'
            ).get(pk=pk)

        except Ticket.DoesNotExist:
            return Response(
                {'error': 'Ticket not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # IT Admin can view every ticket's history
        if user.role == 'IT_ADMIN' or user.is_superuser:
            pass

        # Staff can view history of tickets they created
        elif user.role == 'STAFF':
            if ticket.created_by != user:
                return Response(
                    {
                        'error': 'You do not have permission to view this history.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # IT Staff can view history of tickets assigned to them
        elif user.role == 'IT_STAFF':
            if ticket.assigned_to != user:
                return Response(
                    {
                        'error': 'You do not have permission to view this history.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        else:
            return Response(
                {
                    'error': 'You do not have permission to view this history.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Retrieve ticket activity records
        activities = TicketActivity.objects.filter(
            ticket=ticket
        ).select_related(
            'performed_by'
        )

        serializer = TicketActivitySerializer(
            activities,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class NotificationListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user
        ).select_related('ticket')

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class NotificationMarkReadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(
                pk=pk,
                recipient=request.user
            )
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save(update_fields=['is_read'])

        return Response(
            {'message': 'Notification marked as read.'},
            status=status.HTTP_200_OK
        )

class NotificationMarkAllReadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        return Response(
            {'message': 'All notifications marked as read.'},
            status=status.HTTP_200_OK
        )
