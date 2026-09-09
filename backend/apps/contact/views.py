from functools import partial
from django.db import transaction
from rest_framework import generics, permissions
from .serializers import ContactSerializer
from .models import ContactMessage
from .notifications import notify_contact


class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        contact = serializer.save()
        # Inmediato con autocommit; diferido si existe una transacción exterior.
        transaction.on_commit(partial(notify_contact, contact))
