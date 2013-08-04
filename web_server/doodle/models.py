from django.db import models

class GlobalChatHistory(models.Model):
    msg_id = models.AutoField(primary_key=True)
    content = models.TextField()
    msg_type = models.CharField(max_length=10)
    author = models.CharField(max_length=30)    
    room = models.ForeignKey('Room')
    timestamp = models.DateTimeField()

class UserChatHistory(models.Model):
    history_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('User')
    room = models.ForeignKey('Room')
    join_time = models.DateTimeField()
    end_time = models.DateTimeField()

class User(models.Model):
    user_id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=30)
    join_date = models.DateTimeField()
    last_visited = models.DateTimeField()

class Room(models.Model):
    room_id = models.AutoField(primary_key=True)
    title = models.TextField()
    created = models.DateTimeField()
    expired = models.DateTimeField(null=True)

