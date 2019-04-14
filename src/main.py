import cherrypy
import json
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
        self.messages = {
            "": [
                {
                    "id": 0,
                    "user": "Test User 1",
                    "time": 0,
                    "msg": "This is a test."
                },
                {
                    "id": 1,
                    "user": "Test User 2",
                    "time": 0,
                    "msg": "User 1 smells!"},
                {
                    "id": 2,
                    "user": "Test User 3",
                    "time": 0,
                    "msg": "User 3 is da man!"
                }
            ]
        }

    @cherrypy.expose()
    def index(self):
        """
        Index endpoint to connect to.
        :return: index.html
        """
        return open("../bin/html/index.html")

    @cherrypy.expose()
    def getMsgs(self, room="", limit=20):
        """
        Endpoint to get messages for the given room.
        :param room: The room to access.
        :param limit: The number of messages to retrieve.
        :return: A JSON Array of messages for the requested room.
        """
        msgs = self.getRoomMsg(room)[-1 * limit:]
        return json.dumps(msgs)

    @cherrypy.expose()
    def sendMsg(self, msg, room=""):
        """
        Endpoint to send messages to the given room.
        :param msg: The message to send.
        :param room: The room to send to.
        :return: A JSON confirming successful submission.
        """

        returnObj = {}
        self.addMsg(msg, room)
        returnObj["status"] = "success"
        return json.dumps(returnObj)

    def addMsg(self, msg, room):
        """
        Private method to add the given msg to the room.
        :param msg: The message to send.
        :param room: The room to send to.
        """
        roomMsgs = self.getRoomMsg(room)

        newMsg = {
            "msg": msg,
            "time": 0,
            "user": "Test User",
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
