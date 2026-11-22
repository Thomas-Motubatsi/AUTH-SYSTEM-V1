
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
