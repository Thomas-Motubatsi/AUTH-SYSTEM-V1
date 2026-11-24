from django.urls import path

from .views import (
    TicketListCreateView,
    TicketAssignView,
    TicketUpdateView,
    TechnicianListView,
    TicketHistoryView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
)

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/assign/',TicketAssignView.as_view(),name='ticket-assign'),
    path('<int:pk>/update/', TicketUpdateView.as_view(), name='ticket-update'),
    path('technicians/', TechnicianListView.as_view(), name='technician-list'),
    path('<int:pk>/history/', TicketHistoryView.as_view(), name='ticket-history'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
        
    

]