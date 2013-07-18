Project-Obito
=============

This is a practice project to implement a chat service with two major features:

Doodle messages
-----------------
The ability to send 2D drawings as messages instead of plain text, ie to emulate the functionality seen in Yahoo! Messenger
and the now discontinued MSN Messenger in a purely web based setting.

Optional User Account
---------------------
Anyone should be able to start a chat with any other person or a group of people, without signing up for an account.
Though creating a user account will enable the end user to keep a chat history, this is strictly optional.


Dependencies
============
python > tornado
node.js > socket.io
redis

File Structure
==============
chat_server : node.js application to run the socket.io based chat backend
web_server_prototype: tornado based python server to serve pages as required (no user accounts)
