from rest_framework import generics, permissions
from .serializers import ContactSerializer
from .models import ContactMessage


class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]
