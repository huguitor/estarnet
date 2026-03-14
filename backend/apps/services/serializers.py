from rest_framework import serializers
from .models import Service


class ServicePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'category', 'image')


class ServicePrivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'price', 'category', 'image', 'created_at')
