import logging
from datetime import timedelta

from django.contrib.auth import authenticate, login as auth_login
from django.utils import timezone

from core.exceptions import AccountLockedError
from core.models import LoginAttempt

logger = logging.getLogger("core.security")

LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION = timedelta(minutes=15)


def check_lockout(username):
    cutoff = timezone.now() - LOCKOUT_DURATION
    failed_count = LoginAttempt.objects.filter(
        username=username,
        attempted_at__gte=cutoff,
        successful=False,
    ).count()
    return failed_count >= LOCKOUT_THRESHOLD


def record_attempt(username, ip_address, successful):
    LoginAttempt.objects.create(
        username=username,
        ip_address=ip_address,
        successful=successful,
    )


def clear_failed_attempts(username):
    cutoff = timezone.now() - LOCKOUT_DURATION
    LoginAttempt.objects.filter(
        username=username,
        attempted_at__gte=cutoff,
        successful=False,
    ).delete()


def login(request, username, password):
    ip_address = _get_client_ip(request)

    if check_lockout(username):
        logger.warning(
            "Login attempt on locked account",
            extra={"username": username, "ip": ip_address},
        )
        raise AccountLockedError(username)

    user = authenticate(request, username=username, password=password)

    if user is None:
        record_attempt(username, ip_address, successful=False)
        failed_count = LoginAttempt.objects.filter(
            username=username,
            attempted_at__gte=timezone.now() - LOCKOUT_DURATION,
            successful=False,
        ).count()
        logger.warning(
            "Failed login attempt",
            extra={
                "username": username,
                "ip": ip_address,
                "attempt_count": failed_count,
            },
        )
        return None

    record_attempt(username, ip_address, successful=True)
    clear_failed_attempts(username)
    auth_login(request, user)
    logger.info(
        "Successful login",
        extra={"username": username, "ip": ip_address},
    )
    return user


def logout(request):
    username = request.user.username if request.user.is_authenticated else "unknown"
    request.session.flush()
    logger.info("User logged out", extra={"username": username})


def _get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "0.0.0.0")
