import tornado.ioloop
import tornado.web
import redis

r = redis.StrictRedis(host="localhost",port=6379,db=0)

ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def base62_encode(num, alphabet=ALPHABET):
    """Encode a number in Base X

    `num`: The number to encode
    `alphabet`: The alphabet to use for encoding
    """
    if (num == 0):
        return alphabet[0]
    arr = []
    base = len(alphabet)
    while num:
        rem = num % base
        num = num // base
        arr.append(alphabet[rem])
    arr.reverse()
    return ''.join(arr)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('main.html')

class RoomHandler(tornado.web.RequestHandler):
    def get(self,room_key):
        # Check if room is valid
        if room_key == "new":
            newID = base62_encode(r.scard('rooms')+1000)
            r.sadd('rooms',newID);
            self.redirect(newID,permanent=False)
        elif room_key in r.smembers('rooms'):
            self.render('room.html',roomID=room_key)
        else:
            self.write('505: NO SUCH ROOM')

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/rooms/([^/]+)",RoomHandler),
    (r"/static/(.*)",tornado.web.StaticFileHandler,{"path":"/root/web_server_prototype/static"}),
])

if __name__ == "__main__":
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()