import cherrypy
import json
import hashlib
from os.path import abspath
from utils import read_file


class ChatRoom:
    """
    Chatroom made in CherryPy with a ReactJS frontend.
    """

    def __init__(self):
        """
        Init method. Instantiates the messages queue and user info in RAM.
        """
        self.messages = {}
        self.users = {}

    @cherrypy.expose()
    def index(self, room=""):
        """
        Index endpoint to connect to.
        :param room: The room to connect to. Initializes the room if it doesn't yet exist.
        :return: index.html
        """
        self.initRoom(room)
        return open("../bin/html/index.html")

    @cherrypy.expose()
    def getMsgs(self, asOf=None, evt=False, room="", limit=20):
        """
        Endpoint to get messages for the given room.
        :param asOf: Filter out all messages from before this timestamp.
        :param evt: Is this being called from an EventSource? If yes, then return as an event stream.
        :param room: The room to access.
        :param limit: The number of messages to retrieve.
        :return: A JSON Array of messages for the requested room.
        """

        cherrypy.response.headers["Content-Type"] = "text/event-stream;charset=utf-8"
        msgs = self.getRoomMsg(room)[-1 * limit:]

        if asOf:
            msgs = list(filter(lambda x: x["time"] > str(asOf), msgs))

        jsonMsgs = json.dumps(msgs)
        return 'retry: 1200\ndata: {0}\n\n'.format(jsonMsgs) if evt else jsonMsgs

    @cherrypy.expose()
    def sendMsg(self, msg, user, time=0, room=""):
        """
        Endpoint to send messages to the given room.
        :param msg: The message to send.
        :param user: The name of the user sending this message.
        :param time: The timestamp of this message.
        :param room: The room to send to.
        :return: A JSON confirming successful submission.
        """

        returnObj = {}
        self.addMsg(msg, user, time, room)
        returnObj["status"] = "success"
        return json.dumps(returnObj)

    @cherrypy.expose()
    def registerUser(self, userName, password):
        """
        Registers this user in the server memory.
        :param userName: The user to register.
        :param password: The user's password.
        :return: A JSON with the request status.
        """
        returnObj = {}

        lowerUserName = userName.lower()

        if lowerUserName in self.users:
            returnObj["status"] = "Error"
            returnObj["msg"] = "User is already registered!"
        else:
            self.users[lowerUserName] = hashlib.sha256(password.encode("utf-8"))
            returnObj["status"] = "Success"

        return json.dumps(returnObj)

    @cherrypy.expose()
    def loginUser(self, userName, password):
        """
        Attempts to validate the user credentials.
        :param userName: The user to log in.
        :param password: The user's password.
        :return: A JSON with the request status.
        """
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
        :param user: The name of the user sending this message.
        :param time: The timestamp of this message.
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

    def initRoom(self, room):
        """
        Initializes the chatroom in memory.
        :param room: The room to initialize.
        """
        lowerRoom = room.lower()
        if lowerRoom not in self.messages:
            self.messages[lowerRoom] = []


    def getRoomMsg(self, room):
        """
        Helper method to get the correct message array.
        :param room: The room to look up.
        :return: A list of messages from room.
        """
        lowerRoom = room.lower()
        return self.messages[lowerRoom]


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
