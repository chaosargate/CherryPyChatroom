var ajaxModule = function() {

    var makeGet = function(url, inputData) {
        return new Promise(function(resolve, reject) {
            resolve(makeCall(url, "GET", inputData));
        })
    }

    var makePost = function(url, inputData) {
        return new Promise(function(resolve, reject) {
            resolve(makeCall(url, "POST", inputData));
        })
    }

    var makeCall = function(url, type, inputData) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                dataType: "json",
                type: type,
                data: inputData
            }).done(resp => resolve(resp));
        })
    }

    var fetchMessages = function(asOf, room) {
        return new Promise(function(resolve, reject) {
            var inputData = {
                asOf: asOf,
                room: room
            };

            resolve(makeGet("/getMsgs", inputData));
        })
    }

    var sendMessage = function(inputData) {
        return new Promise(function(resolve, reject) {
            resolve(makePost("/sendMsg", inputData))
        })
    }

    var registerUser = function(inputData) {
        return new Promise(function(resolve, reject0) {
            resolve(makePost("/registerUser", inputData));
        })
    }

    var loginUser = function(inputData) {
        return new Promise(function(resolve, reject0) {
            resolve(makePost("/loginUser", inputData));
        })
    }

    return {
        fetchMessages: fetchMessages,
        sendMessage: sendMessage,
        registerUser: registerUser,
        loginUser: loginUser,
    }
}

var ajaxHelper = ajaxModule();