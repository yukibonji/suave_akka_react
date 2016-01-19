// Action types
const LOGIN = "LOGIN";
const LOGIN_RESULT = "LOGIN_RESULT";
const CREATE_ROOM = "CREATE_ROOM";
const ROOM_CREATED = "ROOM_CREATED";
const JOIN_ROOM = "JOIN_ROOM";
const USER_JOINED = "USER_JOINED";
const SEND_MESSAGE = "SEND_MESSAGE";
const MESSAGE_RECIEVED = "MESSAGE_RECIEVED";

// Login status
const FAILED = "FAILED";
const IN_PROGRESS = "IN_PROGRESS";
const OK = "OK";
const NOT_STARTED = "NOT_STARTED";

// Action creators
const loginRequested = (userName) => {
    return {
        type: LOGIN,
        status: IN_PROGRESS,
        userName        
    }
}

const loginSuccess = (userName) => {
    return {
        type: LOGIN_RESULT,
        status: OK,
        userName
    }
}

const login = (userName) => {
    return dispatch => {
        dispatch(loginRequested(userName))
        dispatch(loginSuccess(userName))
    };
};

const createRoom = (userName, roomName) => {
    return {
        type: CREATE_ROOM,
        userName,
        roomName
    };
};

const joinRoom = (userName, roomName) => {
    return {
        type: JOIN_ROOM,
        userName,
        roomName
    }
}

const sendMessage = (message) => {
    return {
        type: SEND_MESSAGE,
        message
    };
};

const messageReceived = (userName, message) => {
    return {
        type: MESSAGE_RECIEVED,
        userName,
        message
    }
}

const doStuff = (ds, userName) => {
    if(ds) {
        ds(userName);
    }
    console.log("Clicked: " + userName);
    const something = (name) => {console.log("From action something " + userName + " " + name)};
    return {
        type: "DO_STUFF",
        userName,
        doStuff: something
    }
}

// Reducers
const header = (state = {
    login: NOT_STARTED,
    userName: undefined
},action) => {
    console.log("In header action: ");
    console.log(action);
    console.log("In header state: ");
    console.log(state);
    switch(action.type) {
        case LOGIN: 
            return Object.assign({}, state, {
                login: IN_PROGRESS
            });
        case LOGIN_RESULT: 
            if(action.status == OK) {
                return Object.assign({}, state, {
                    userName: action.userName,
                    login: OK
                });
            }
        default:
            return state;
    }
};


const connection = (state = {
    doStuff: undefined
}, action) => {
    switch(action.type) {
        case "DO_STUFF": 
            return Object.assign({}, state, {
                doStuff: action.doStuff
            });
        default:
            return state;
    }
};


const roomList = (state = {
    roomList: []
}, action) => {
    switch(action.type) {
        case ROOM_CREATED:
            return Object.assign({}, state, {
                roomList: [...state.roomList, action.roomName]
            });
        default:
            return state;
    }    
};

const {combineReducers} = Redux;

const chatApp = combineReducers({
    header,
    roomList,
    connection
});

const {Component} = React;
const {createStore} = Redux;
const {connect,Provider} = ReactRedux;
const {render} = ReactDOM;

// Components
class HeaderView extends Component {
    render() {
        const {loginClick, userName, doStuff, login} = this.props;
        
        console.log("Headerview props: ");
        console.log( this.props);

        this.handleClick = function(e) {
            loginClick(this.refs.userName.value);
        }

        var loginBar;
        if(userName) {
            loginBar = <span>Welcome {userName}</span>
        } else if(login == IN_PROGRESS) {
            loginBar = <span>Please hold on</span>
        }
        else {
            loginBar = <span>Please login <input type="text" ref="userName"/><button onClick={(e) => this.handleClick(e)} >Please login</button></span>
        }
        
        return (
            <div>
                {loginBar}
            </div>
        )
    }
}

const mapStateToHeaderProps = (state) => {
    console.log("In props");
    console.log(state);
    return {
        userName: state.header.userName,
        login: state.header.login,
        doStuff: state.connection.doStuff
    }
}

const join = (dispatch, userName) => {
    var createRoom = function(){
    var request = new XMLHttpRequest();
    request.open('POST', '/api/room/test', true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send();
    };
    var joinRoom = function(){
        var root = "ws://" + window.location.hostname;
        if (window.location.port != "") root = root + ":" + window.location.port;
        root = root + "/";
        var websocket = new WebSocket(root + "api/room/test/join/tomas");
        websocket.onmessage = function(evt) {
            console.log(evt.data);
        }
        websocket.onopen = function() {
            websocket.send("This is from the web");            
            dispatch(loginSuccess(userName));
        };
    };
    createRoom();
    joinRoom();
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginClick: (userName) => {
            dispatch(loginRequested(userName));
            join(dispatch, userName);
//            dispatch(login(userName));
        }
    }
}

const Header = connect(
    mapStateToHeaderProps,
    mapDispatchToProps
)(HeaderView)

class ChatApp extends Component {
    render() {
        const { dispatch, roomList, userInfo } = this.props;
        return (
            <div>
                <Header />
            </div>
        )
    }
}
                    // userInfo={userInfo}
                    // onLoginClick={dispatch(userName => dispatch(login(userName)))}
                    // ></Header>
                // <RoomList 
                //     roomList={roomList} />

const store = createStore(chatApp)

const rootElement = document.getElementById('app')
render(
  <Provider store={store}>
    <ChatApp />
  </Provider>,
  rootElement
)

// const room = (state  = [], action) => {
//     switch(action.type) {
//         case ROOM_CREATED:
//                         
//     }
// };

// var Header = React.createClass({
//   render: function() {
//     return (
//       <div className="header">
//         This is the header
//       </div>
//     );
//   }
// });

var RoomList = React.createClass({
    render: function() {
        return (
            <div className="room-list">
                List of rooms
            </div>  
        );
    }
});

var Chat = React.createClass({
    render: function() {
        return(
            <div className="chat-window">
            This is a chat window
            </div>
        );
    }    
})

var UserList = React.createClass({
    render: function() {
        return(
            <div className="user-list">
            This is the user list
            </div>
        );
    }    
})

var ChatRoom = React.createClass({
    render: function() {
        return(
            <div className="chat-room">
                <Chat />
                <UserList />
            </div>
        );
    }
})

var ChatContainer = React.createClass({
    render: function() {
        return (
            <div className="chat-container">
                <aside>
                    <RoomList />
                </aside>
                <Chat />
            </div>
        );
    }
})

var App = React.createClass({
    render: function() {
        return (
            <div className="main">
                <Header/>
                <ChatContainer />
            </div>
        );
    }
})

// ReactDOM.render(
//     <App />,
//     document.getElementById('app')
// );
