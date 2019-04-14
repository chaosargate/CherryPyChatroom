import cherrypy
import json
import hashlib
from os.path import abspath
from utils import read_file


class ChatRoom:
    """
    Chatroom made in CherryPy.
    """

    def __init__(self):
        """
        Init method. Instantiates the messages queue in RAM.
        """
        self.messages = {}
        self.users = {}

    @cherrypy.expose()
    def index(self):
        """
        Index endpoint to connect to.
        :return: index.html
        """
        return open("../bin/html/index.html")

    @cherrypy.expose()
    def getMsgs(self, asOf=None, room="", limit=20):
        """
        Endpoint to get messages for the given room.
        :param room: The room to access.
        :param limit: The number of messages to retrieve.
        :return: A JSON Array of messages for the requested room.
        """

        cherrypy.response.headers["Content-Type"] = "text/event-stream;charset=utf-8"
        msgs = self.getRoomMsg(room)[-1 * limit:]

        if asOf:
            msgs = list(filter(lambda x: x["time"] > str(asOf), msgs))

        return 'retry: 1200\ndata: {0}\n\n'.format(json.dumps(msgs))

    @cherrypy.expose()
    def sendMsg(self, msg, user, time=0, room=""):
        """
        Endpoint to send messages to the given room.
        :param msg: The message to send.
        :param room: The room to send to.
        :return: A JSON confirming successful submission.
        """

        returnObj = {}
        self.addMsg(msg, user, time, room)
        returnObj["status"] = "success"
        return json.dumps(returnObj)

    @cherrypy.expose()
    def registerUser(self, userName, password):
        returnObj = {}

        lowerUserName = userName.lower()

        if lowerUserName in self.users:
            returnObj["status"] = "Error"
            returnObj["msg"] = "User is already registered!"
        else:
            self.users[lowerUserName] = hashlib.sha256(password.encode("utf-8"))

        return json.dumps(returnObj)

    @cherrypy.expose()
    def loginUser(self, userName, password):
        returnObj = {}

        lowerUserName = userName.lower()

        if lowerUserName not in self.users:
            returnObj["status"] = "Error"
            returnObj["msg"] = "User is not registered!"
        else:
            validPass = hashlib.sha256(password.encode("utf-8")).hexdigest() == self.users[lowerUserName].hexdigest()

            if validPass:
                returnObj["status"] = "Success"
                returnObj["name"] = userName
            else:
                returnObj["status"] = "Error"
                returnObj["msg"] = "Invalid password!"

        return json.dumps(returnObj)

    def addMsg(self, msg, user, time, room):
        """
        Private method to add the given msg to the room.
        :param msg: The message to send.
        :param room: The room to send to.
        """
        roomMsgs = self.getRoomMsg(room)

        newMsg = {
            "msg": msg,
            "time": time,
            "user": user,
            "id": len(roomMsgs)
        }

        roomMsgs.append(newMsg)

    def getRoomMsg(self, room):
        """
        Helper method to get the correct message array.
        :param room: The room to look up.
        :return: A list of messages from room.
        """
        if room not in self.messages:
            self.messages[room] = []

        return self.messages[room]


if __name__ == "__main__":

    host = read_file("host.txt")

    cherrypy.config.update({
        "server.socket_port": 8082,
        "server.socket_host": host,
        "response.timeout": 1600000
    })

    conf = {
        "/bin": {
            "tools.staticdir.on": True,
            "tools.staticdir.dir": abspath("../bin")
        }
    }

    cherrypy.quickstart(ChatRoom(), config=conf)
