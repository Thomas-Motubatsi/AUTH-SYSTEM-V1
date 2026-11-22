from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Ticket
from .serializers import (
    TicketCreateSerializer,
    TicketSerializer
)
from  users.permissions import IsITStaff, IsHospitalStaff


class TicketListCreateView(APIView):

    permission_classes = [IsITStaff | IsHospitalStaff]

    def get_queryset(self, user):

        # IT staff and superusers can see all tickets.
        if user.is_superuser or user.role == 'IT_STAFF':
            return Ticket.objects.select_related(
                'created_by',
                'assigned_to'
            ).all()

        # Hospital staff can only see their own tickets.
        return Ticket.objects.select_related(
            'created_by',
            'assigned_to'
        ).filter(created_by=user)

    def get(self, request):

        tickets = self.get_queryset(request.user)

        serializer = TicketSerializer(
            tickets,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):

        serializer = TicketCreateSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            ticket = serializer.save()

            response_serializer = TicketSerializer(ticket)

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# Create your views here.
