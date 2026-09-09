import json
from rest_framework import serializers
from .models import ContactMessage


class ContactSerializer(serializers.ModelSerializer):
    message = serializers.CharField(max_length=8000)

    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'phone', 'message', 'created_at')

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('El mensaje debe tener al menos 10 caracteres.')
        return value

    def validate(self, attrs):
        # El contrato limita además las variables a 16 KiB de JSON UTF-8.
        # Reservar los 25 caracteres del ISO local con offset generado al guardar.
        variables = {
            'nombre': attrs['name'], 'email': attrs['email'],
            'telefono': attrs.get('phone', ''), 'mensaje': attrs['message'],
            'fecha': '2000-01-01T00:00:00-03:00',
        }
        if len(json.dumps(variables, ensure_ascii=False).encode('utf-8')) > 16384:
            raise serializers.ValidationError({
                'message': 'La consulta supera el tamaño máximo permitido.',
            })
        return attrs
