function MessageTitle(props) {
    var user = props.user;
    var time = props.time;
    return(
        <div>
            <h4 className="messageUser">{user}</h4>
            <span className="messageTime">{time}</span>
        </div>
    )
}

function MessageBody(props) {
    var msg = props.msg;
    return (
        <span className="messageBody">{msg}</span>
    )
}

function Message(props) {
    var user = props.user;
    var time = props.time;
    var msg = props.msg;
    return (
        <div className="message">
            <MessageTitle user={user} time={time} />
            <MessageBody msg={msg} />
        </div>
    )
}

function MessagesHolder(props) {
    var messages = props.messages;
    
    return (
        <div id="messagesHolder" className="messagesHolder">
            {messages.map(x => <Message user={x.user} time={x.time} msg={x.msg} key={x.id} ></Message>)}
        </div>
    )
}

function MessageBox(props) {
    return (
        <textarea
            maxLength="500"
            className="messageBox"
            id="MessageBox"
        />
    )
}

function MessagePost(props) {
    var sendMsg = props.sendMsg;
    return (
        <button className="messagePost" onClick={sendMsg}>
            POST
        </button>
    )
}

function MessageInput(props) {
    var sendMsg = props.sendMsg;

    return (
        <div className="MessageInput">
            <MessageBox />
            <MessagePost sendMsg={sendMsg}/>
        </div>
    )
}

class ChatRoom extends React.Component {

    constructor(props) {
        super(props);

        var roomParam = props.room;

        this.state = {
            messages: [],
            room: roomParam ? roomParam : "",
        }
    }

    addMsgsToState(messages) {
        this.setState({messages: messages});
        updateScroll();
    }

    fetchMsgs() {
        $.ajax({
            url: "/getMsgs",
            dataType: "json",
            data: {room: this.state.room}
        }).done((resp) => this.addMsgsToState(resp));
    }

    sendMsg() {

        var inputMsg = $("#MessageBox").val();

        if (inputMsg == "") {
            return;
        }

        var data = {
            "msg": inputMsg,
            "room": this.state.room
        };

        $.ajax({
            url: "/sendMsg",
            type: "POST",
            dataType: "json",
            data: data
        }).done((resp) => this.fetchMsgs());
    }

    render() {
        return (
            <div className="messageComponent">
                <div onClick={() => this.fetchMsgs()}>
                    UPDATE
                </div>
                <MessagesHolder
                    messages={this.state.messages}
                ></MessagesHolder>
                <MessageInput
                    sendMsg={() => this.sendMsg()}
                ></MessageInput>
            </div>
        )
    }

}

// taken from https://stackoverflow.com/questions/7731778/get-query-string-parameters-url-values-with-jquery-javascript
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

ReactDOM.render(<ChatRoom room={$.urlParam("room")}/>, document.getElementById("ReactViewer"))

var scrolled = false;
function updateScroll(){
    if(!scrolled){
        var element = document.getElementById("messagesHolder");
        element.scrollTop = element.scrollHeight;
    }
}

$("#messagesHolder").on('scroll', function(){
    var element = document.getElementById("messagesHolder");
    scrolled = element.scrollTop == element.scrollHeight;
});