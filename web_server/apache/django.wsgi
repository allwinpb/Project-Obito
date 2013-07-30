import os, sys

path = '/path/to/web_server/web_server'
if path not in sys.path:
    sys.path.append(path)
os.environ['DJANGO_SETTINGS_MODULE'] = 'web_server.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()