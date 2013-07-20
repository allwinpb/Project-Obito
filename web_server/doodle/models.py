from django.db import models

class GlobalChatHistory(models.Model):
    id = models.IntegerField(primary_key=True)
    content = models.TextField()
    type = models.BooleanField()
    author = models.ForeignKey('User')
    room = models.ForeignKey('Room')
    timestamp = models.DateTimeField()

class UserChatHistory(models.Model):
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey('User')
    room = models.ForeignKey('Room')
    join_time = models.DateTimeField()
    end_time = models.DateTimeField()

class User(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=30)
    join_date = models.DateTimeField()
    last_visited = models.DateTimeField()

class Room(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=20, blank=True)
    created = models.DateTimeField()
    expired = models.DateTimeField(null=True)

