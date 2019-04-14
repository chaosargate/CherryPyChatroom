function MessageTitle(props) {
    var user = props.user;
    var time = new Date(parseInt(props.time)).toLocaleString();
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
    var updateMsg = props.updateMsg;
    var inputMsg = props.inputMsg;
    var onEnterPress = props.onEnterPress;

    return (
        <textarea
            maxLength="500"
            className="messageBox"
            id="MessageBox"
            onChange={updateMsg}
            onKeyDown={onEnterPress}
            value={inputMsg}
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
    var updateMsg = props.updateMsg;
    var inputMsg = props.inputMsg;
    var onEnterPress = props.onEnterPress;

    return (
        <div className="MessageInput">
            <MessageBox updateMsg={updateMsg} inputMsg={inputMsg} onEnterPress={onEnterPress}/>
            <MessagePost sendMsg={sendMsg}/>
        </div>
    )
}

function LoginInput(props) {

    var loginFn = props.loginFn;
    var registerFn = props.registerFn;

    return (
        <div className="loginDiv">
            <input id="loginUser" placeholder="Username" className="loginInput" />
            <input id="loginPass" placeholder="Password" type="password" className="loginInput" />
            <div className="authenticationButtons">
                <button onClick={loginFn}>LOGIN</button>
                <button onClick={registerFn}>REGISTER</button>
            </div>
        </div>
    )
}

class ChatRoom extends React.Component {

    constructor(props) {
        super(props);

        var roomParam = props.room;
        var messages = props.messages;

        this.state = {
            messages: messages,
            inputMessage: "",
            room: roomParam ? roomParam : "",
            userName: "",
        }
    }

    addMsgsToState(newMessages) {

        var currMessages = this.state.messages;

        var allMessages = currMessages.concat(newMessages);

        this.setState({messages: allMessages});
        updateScroll();
    }

    fetchMsgs() {

        var currTime = null;
        var currMessages = this.state.messages;

        if (currMessages.length > 0) {
            var mostRecentMessage = currMessages[currMessages.length - 1];
            currTime = mostRecentMessage["time"];
        }

        ajaxHelper.fetchMessages(currTime).then((resp) => this.addMsgsToState(resp));
    }

    sendMsg() {

        var inputMsg = this.state.inputMessage;

        if (inputMsg == "") {
            return;
        }

        var data = {
            "msg": inputMsg,
            "user": this.state.userName,
            "time": new Date().getTime(),
            "room": this.state.room ? room : ""
        };

        ajaxHelper.sendMessage(data).then((resp) => this.finishSendingMessage());
    }

    finishSendingMessage() {
        this.setState({inputMessage: ""});
        this.fetchMsgs();
    }

    updateMsg(evt) {
        var msg = evt.target.value;
        this.setState({inputMessage: msg});
    }

    onEnterPress(evt) {
        if (evt.keyCode == 13 && evt.shiftKey == false) {
            evt.preventDefault();
            this.sendMsg();
        }
    }

    getLoginInfo() {
        var loginUser = $("#loginUser").val();
        var loginPass = $("#loginPass").val();
        return {"userName": loginUser, "password": loginPass}
    }

    loginFn(evt) {
        ajaxHelper.loginUser(this.getLoginInfo()).then(resp => this.loginSuccess(resp));
    }

    registerFn(evt) {
        ajaxHelper.registerUser(this.getLoginInfo()).then(resp => this.loginFn(evt));
    }

    loginSuccess(respJson) {
        var status = respJson["status"];
        if (status == "Success") {
            var userName = respJson["name"];
            this.setState({userName: userName});
        } else {
            var errorMsg = respJson["msg"];
            alert(errorMsg);
        }
    }

    renderMessageInput() {
        return (
            <MessageInput
                sendMsg={() => this.sendMsg()}
                updateMsg={(e) => this.updateMsg(e)}
                onEnterPress={(e) => this.onEnterPress(e)}
                inputMsg={this.state.inputMessage}
            ></MessageInput>
        )
    }

    renderLoginInput() {
        return (
            <LoginInput
                loginFn={(e) => this.loginFn(e)}
                registerFn={(e) => this.registerFn(e)}
            >
            </LoginInput>
        )
    }

    render() {
        var bottomInput = this.state.userName == "" ? this.renderLoginInput() : this.renderMessageInput();
        return (
            <div className="messageComponent">
                <div onClick={() => this.fetchMsgs()}>
                    UPDATE
                </div>
                <MessagesHolder
                    messages={this.state.messages}
                ></MessagesHolder>
                {bottomInput}
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

ajaxHelper.fetchMessages().then( messages =>
    ReactDOM.render(<ChatRoom room={$.urlParam("room")} messages={messages}/>, document.getElementById("ReactViewer"))
);

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