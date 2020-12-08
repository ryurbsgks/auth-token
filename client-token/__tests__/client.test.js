/* eslint-disable no-unused-expressions */
import axios from "axios";
import { expect } from "chai";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import nock from "nock";
import React from "react";
import sinon, { mock } from "sinon";

import App from "../src/App";
import Login from "../src/components/Login";
import Mypage from "../src/components/Mypage";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!doctype html><html><body><p>paragraph</p></body></html>`);

global.window = dom.window;
global.document = dom.window.document;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
Enzyme.configure({ adapter: new Adapter() });

describe("Authentication - Client", () => {
  const mockUser = {
    userId: "kimcoding",
    password: "1234",
  };

  describe("Login Component", () => {
    it("should have userId and password key in state", (done) => {
      const wrapper = mount(<Login />);
      const state = wrapper.state();
      expect(state.userId).to.exist;
      expect(state.password).to.exist;
      done();
    });

    it('should send POST request to "https://localhost:4000/login" when JWT Login button is clicked', (done) => {
      const scope = nock("https://localhost:4000")
        .post("/login")
        .reply(200, { data: { accessToken: "fakeAccessToken" } });
      const wrapper = mount(<App />);
      const loginInWrapper = wrapper.children().childAt(0);
      loginInWrapper.setState(mockUser);
      wrapper.find(".loginBtn").simulate("click");

      setTimeout(() => {
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).to.eql(1); // ajax call이 1회 발생
        expect(scope.interceptors[0].statusCode).to.eql(200);

        scope.done();
        done();
      });
    });

    it("should include userId and password in the body of POST /login request", (done) => {
      const scope = nock("https://localhost:4000")
        .post("/login", mockUser)
        .reply(200, { data: { accessToken: "fakeAccessToken" } });
      const wrapper = mount(<App />);
      const loginInWrapper = wrapper.children().childAt(0);
      loginInWrapper.setState(mockUser);
      wrapper.find(".loginBtn").simulate("click");

      setTimeout(() => {
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).to.eql(1); // ajax call이 1회 발생
        expect(scope.interceptors[0].statusCode).to.eql(200);

        scope.done();
        done();
      });
    });

    it("successful login should change isLogin and accessToken state in App component", (done) => {
      const scope = nock("https://localhost:4000")
        .post("/login", mockUser)
        .reply(200, { data: { accessToken: "fakeAccessToken" } });
      const wrapper = mount(<App />);
      const loginInWrapper = wrapper.children().childAt(0);
      loginInWrapper.setState(mockUser);
      wrapper.find(".loginBtn").simulate("click");

      setTimeout(() => {
        expect(wrapper.state().isLogin).to.eql(true);
        expect(wrapper.state().accessToken).to.not.eql("");
        scope.done();
        done();
      }, 500);
    });
  });

  describe("Mypage Component", () => {
    it("should have userId, email, and createdAt key in state", (done) => {
      const wrapper = mount(<Mypage />);
      const state = wrapper.state();
      expect(state.userId).to.exist;
      expect(state.email).to.exist;
      expect(state.createdAt).to.exist;
      done();
    });

    it("should receive accessToken props from App component", (done) => {
      const wrapper = mount(<App />);
      wrapper.setState({ isLogin: true });
      wrapper.update();
      const mypageWrapper = wrapper.children().childAt(0);
      expect(mypageWrapper.props().accessToken).to.exist;
      done();
    });

    it('should send GET request to "https://localhost:4000/accesstokenrequest" when access token request button is clicked', (done) => {
      const scope = nock("https://localhost:4000").get("/accesstokenrequest").reply(200);
      const wrapper = mount(<Mypage />);
      wrapper.find(".btnContainer").children().at(0).simulate("click");

      setTimeout(() => {
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).to.eql(1); // ajax call이 1회 발생
        expect(scope.interceptors[0].statusCode).to.eql(200);

        scope.done();
        done();
      });
    });

    it('GET request to "https://localhost:4000/accesstokenrequest" should include header Authorization with value "Bearer YOUR_RECEIVED_ACCESS_TOKEN"', (done) => {
      const scope = nock("https://localhost:4000", {
        reqheaders: { authorization: "Bearer fakeAccessToken" },
      })
        .get("/accesstokenrequest")
        .reply(200);

      const wrapper = mount(<Mypage accessToken='fakeAccessToken' />);
      wrapper.find(".btnContainer").children().at(0).simulate("click");

      setTimeout(() => {
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).to.eql(1); // ajax call이 1회 발생
        expect(scope.interceptors[0].statusCode).to.eql(200);

        scope.done();
        done();
      });
    });

    it('successful GET request to "https://localhost:4000/accesstokenrequest" should change userId, email, and createdAt state in Mypage', (done) => {
      const scope = nock("https://localhost:4000")
        .get("/accesstokenrequest")
        .reply(200, {
          data: { userInfo: { createdAt: "2020", userId: "1", email: "2" } },
          message: "ok",
        });

      const wrapper = mount(<Mypage />);
      wrapper.find(".btnContainer").children().at(0).simulate("click");

      setTimeout(() => {
        expect(wrapper.state().createdAt).to.eql("2020");
        expect(wrapper.state().userId).to.eql("1");
        expect(wrapper.state().email).to.eql("2");

        scope.done();
        done();
      }, 500);
    });

    it('should send GET request to "https://localhost:4000/refreshtokenrequest" when refresh token request button is clicked', (done) => {
      const scope = nock("https://localhost:4000").get("/refreshtokenrequest").reply(200);
      const wrapper = mount(<Mypage />);
      wrapper.find(".btnContainer").children().at(1).simulate("click");

      setTimeout(() => {
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).to.eql(1); // ajax call이 1회 발생
        expect(scope.interceptors[0].statusCode).to.eql(200);

        scope.done();
        done();
      });
    });

    it('successful GET request to "https://localhost:4000/refreshtokenrequest" should change userId, email, and createdAt state in Mypage', (done) => {
      const scope = nock("https://localhost:4000")
        .get("/refreshtokenrequest")
        .reply(200, {
          data: { userInfo: { createdAt: "2020", userId: "1", email: "2" } },
          message: "ok",
        });

      const wrapper = mount(<Mypage />);
      wrapper.find(".btnContainer").children().at(1).simulate("click");

      setTimeout(() => {
        expect(wrapper.state().createdAt).to.eql("2020");
        expect(wrapper.state().userId).to.eql("1");
        expect(wrapper.state().email).to.eql("2");

        scope.done();
        done();
      }, 500);
    });

    it('successful GET request to "https://localhost:4000/refreshtokenrequest" should update access token state in App component', (done) => {
      const scope = nock("https://localhost:4000")
        .get("/refreshtokenrequest")
        .reply(200, {
          data: {
            userInfo: { createdAt: "2020", userId: "1", email: "2" },
            accessToken: "new access token",
          },
          message: "ok",
        });

      const wrapper = mount(<App />);
      wrapper.setState({ isLogin: true });
      wrapper.update();
      const mypageWrapper = wrapper.children().childAt(0);
      mypageWrapper.find(".btnContainer").children().at(1).simulate("click");

      setTimeout(() => {
        expect(wrapper.state().accessToken).to.eql("new access token");

        scope.done();
        done();
      }, 500);
    });
  });
});
