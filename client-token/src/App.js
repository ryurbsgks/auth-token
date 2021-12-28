import React, { Component } from "react";

import Login from "./components/Login";
import Mypage from "./components/Mypage";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      accessToken: "",
    };

    this.loginHandler = this.loginHandler.bind(this);
    this.issueAccessToken = this.issueAccessToken.bind(this);
  }

  
  loginHandler(data) {
    this.setState({
      isLogin: true,
      accessToken: data.data.accessToken
    });
  }

  issueAccessToken(token) {
    this.setState({ accessToken: token });
  }

  render() {
    const { isLogin } = this.state;
    return (
      <div className='App'>
        {/* 
        TODO: isLogin 상태에 따라 Mypage 혹은 Login 컴포넌트를 렌더해야합니다.
        알맞은 컴포넌트를 렌더링하는것은 물론, 올바른 props전달하도록 작성하세요.
        */
        isLogin ? (
          <Mypage 
          accessToken={this.state.accessToken} 
          issueAccessToken={this.issueAccessToken} 
          />
        ) : (
          <Login 
          loginHandler={this.loginHandler} 
          />
        )
        }

      </div>
    );
  }
}

export default App;
