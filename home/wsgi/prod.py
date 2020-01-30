import os

from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "home.settings.prod")

application = get_wsgi_application()
application = WhiteNoise(application)
