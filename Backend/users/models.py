
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags


# Custom User Manager
class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is a required field')

        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


# Custom User Model
class CustomUser(AbstractUser):

    class Role(models.TextChoices):
        STAFF = 'STAFF', 'Staff'
        IT_STAFF = 'IT_STAFF', 'IT Staff'
        IT_ADMIN = 'IT_ADMIN', 'IT Administrator'

    email = models.EmailField(max_length=200, unique=True)
    birthday = models.DateField(null=True, blank=True)
    username = models.CharField(max_length=200, null=True, blank=True)

    # User role distinction
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


# Password Reset Email Signal
@receiver(reset_password_token_created)
def password_reset_token_created(
    sender,
    instance,
    reset_password_token,
    *args,
    **kwargs
):

    # Frontend password reset URL
    sitelink = "http://localhost:5173/"
    token_param = reset_password_token.key

    full_link = f"{sitelink}password-reset/{token_param}"

    # Email template context
    context = {
        'full_link': full_link,
        'reset_password_url': full_link,
        'email_address': reset_password_token.user.email,
    }

    # Render HTML email
    html_message = render_to_string(
        "Backend/email.html",
        context=context
    )

    # Generate plain-text email
    plain_message = strip_tags(html_message)

    # Construct email
    msg = EmailMultiAlternatives(
        subject=f"Request to reset password for {reset_password_token.user.email}",
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[reset_password_token.user.email]
    )

    # Attach HTML version
    msg.attach_alternative(html_message, "text/html")
    print("===== PASSWORD RESET EMAIL DEBUG =====")
    print("DEFAULT_FROM_EMAIL:", repr(settings.DEFAULT_FROM_EMAIL))
    print("EMAIL_HOST_USER:", repr(settings.EMAIL_HOST_USER))
    print("MESSAGE SENDER:", repr(msg.from_email))
    print("MESSAGE RECIPIENT:", msg.to)
    print("======================================")
    # Send email
    msg.send()
