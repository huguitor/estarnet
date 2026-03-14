from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/contact/', include('apps.contact.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='healthcheck'),
]
