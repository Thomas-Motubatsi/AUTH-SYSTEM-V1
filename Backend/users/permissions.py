
from rest_framework.permissions import BasePermission


class IsITStaff(BasePermission):

    message = "You must be an IT staff member to access this resource."

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == 'IT_STAFF'
                or request.user.is_superuser
            )
        )


class IsHospitalStaff(BasePermission):

    message = "You must be a hospital staff member to access this resource."

    def has_permission(self, request, view):

        return (
            
            request.user
            and request.user.is_authenticated
            and request.user.role == 'STAFF'
        )

class IsITAdmin(BasePermission):
    """Allows IT administrators."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.role == 'IT_ADMIN'
                or request.user.is_superuser
            )
        )


class IsITStaffOrAdmin(BasePermission):
    """Allows both IT technicians and administrators."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.role in ['IT_STAFF', 'IT_ADMIN']
                or request.user.is_superuser
            )
        )

