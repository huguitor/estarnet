from rest_framework import generics, permissions
from .models import Service
from .serializers import ServicePublicSerializer, ServicePrivateSerializer


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServicePublicSerializer
    permission_classes = [permissions.AllowAny]


class ServicePrivateListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServicePrivateSerializer
    permission_classes = [permissions.IsAuthenticated]
