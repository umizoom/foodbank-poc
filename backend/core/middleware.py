import logging
import threading
import time
import uuid

_request_id_store = threading.local()


def get_request_id():
    return getattr(_request_id_store, "request_id", "-")


class RequestIDFilter(logging.Filter):
    def filter(self, record):
        record.request_id = get_request_id()
        return True


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = str(uuid.uuid4())
        request.request_id = request_id
        _request_id_store.request_id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("core")

    def __call__(self, request):
        if request.path == "/api/health/":
            return self.get_response(request)

        start_time = time.time()
        self.logger.info(
            "Request started",
            extra={"method": request.method, "path": request.path},
        )

        response = self.get_response(request)

        duration_ms = (time.time() - start_time) * 1000
        self.logger.info(
            "Request completed",
            extra={
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )
        return response
