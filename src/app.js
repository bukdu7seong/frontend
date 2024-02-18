// app.js는 브라우저가 새로고침 될 때마다 실행.
import { getDefaultRoute, route } from '../lib/router/router.js';
import { initComponent } from '../lib/render/component.js';
import { renderPage } from '../lib/render/render.js';
// pages
import { pageLogIn } from './pages/login.js';
import { pageProfile } from './pages/profile.js';
import { pageGame } from './pages/game.js';
import { pageTournament } from './pages/tournament.js';
import { pageSwitch } from './pages/switch.js';
// components
import { sidebar } from './components/common/sidebar.js';
import { userBox } from './components/common/userBox.js';
// state
import { globalState, routeState, userState } from '../lib/state/state.js';
import { updateUserBox } from '../lib/state/update.js';
// game
import PingPong from './components/game/PingPong.js';
import { pageBoard } from './pages/pong.js';
import Tournament from './components/game/Tournament.js';

// { 경로: { 이름, 페이지, 컴포넌트 } } 렌더링 될 component는 여러개일 수 있기에 배열로 설정
const routes = {
  '/login': { name: 'Login', page: pageLogIn, component: [] },
  '/profile': { name: 'Profile', page: pageProfile, component: [] },
  '/game': { name: 'Game', page: pageGame, component: [] },
  '/tournament': { name: 'Tournament', page: pageTournament, component: [] },
  '/logout': { name: 'Logout', page: pageSwitch, component: [] },
};

// 상태 변경을 구독하고, 상태가 변경될 때마다 updateUI 함수를 실행
// 상태가 변경될 때마다 구독자(updateUI 함수를 뜻함)에게 알림을 보내는 역할
// store.subscribe(updateUI); -> access token 체크할 때 쓰면 좋을 듯!!

function checkWindowSize() {
  const gameBox = document.getElementsByClassName('game-box')[0];
  if (!gameBox) {
    return;
  }

  if (window.innerWidth <= 940 || window.innerHeight <= 660) {
    gameBox.style.pointerEvents = 'none';
  } else {
    gameBox.style.pointerEvents = 'auto';
  }

  // 뭔가 보드에서 키 입력을 받지 않도록 해야하는데... 아직 모르겠다.
  const gameBoard = document.getElementsByClassName('board')[0];
  if (!gameBoard) {
    return;
  }

  if (window.innerWidth <= 940 || window.innerHeight <= 660) {
    console.log('small...');
  } else {
    //
  }
}

function init() {
  // 로그인 체크 로직
  // 1. local storage에 토큰이 있는지 확인
  // 2. 토큰이 있다면, 유효한 토큰인지 확인
  // 3. 유효한 토큰일 경우, store에 로그인 상태를 true로 변경
  // 3-1. 유효하지 않은 토큰일 경우, store에 로그인 상태를 false로 변경
  // 4. store의 로그인 상태에 따라 페이지 렌더링
  globalState.setState({ isLoggedIn: false });
  // if is Logged In -> globalState.setState({ isLoggedIn: true });

  /* ****************** 최초 접속 시 설정 *******************************/
  window.onload = function () {
    // userBox에 들어갈 유저의 이름을 설정해야 한다.
    // userBox(login한 유저의 이름) 이런 식으로...
    initComponent(routes['/profile'], sidebar(routes), userBox());
    initComponent(routes['/game'], sidebar(routes), userBox());
    initComponent(routes['/tournament'], sidebar(routes), userBox());

    userState.subscribe(updateUserBox);
    // globasState.subscribe(checkLogin);

    route(routes, getDefaultRoute(window.location.pathname, routes), false);
  };
  /* *************************************************************** */

  /* ****************** 반응형 이벤트 관련 *******************************/
  /* ********************** resize ***********************************/
  // 페이지 리사이즈 시, window 크기가 일정 사이즈 이하라면, 클릭을 비활성화
  window.addEventListener('resize', checkWindowSize);

  // navigation 시, window 크기가 일정 사이즈 이하라면, 클릭을 비활성화
  // 네비게이션 시 발생할 이벤트를 정의하므로, 단순 페이지 리사이즈 말고도 여러 방식으로 사용할 수 있을듯.
  const observer = new MutationObserver(checkWindowSize);
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document.body, config);

  /* *********************** 뒤로가기 **********************************/
  // window.addEventListener() -> 브라우저의 이벤트를 수신하는 함수
  window.addEventListener('popstate', () => {
    route(routes, window.location.pathname, false);
  });
  /* *************************************************************** */

  /* *************** 페이지 내 화면 클릭 시 동작 정의 ***********************/
  window.onclick = function (event) {
    const currentRoute = routeState.getState();
    const clickedElement = event.target;
    const className = clickedElement.className;

    switch (currentRoute.currentRoute.name) {
      case 'Profile':
        console.log('profile');
        break;
      case 'Game':
        if (className === 'player-option') {
          renderPage(pageBoard(), 'game-box');
          // 현재 로그인한 사용자와 모달에서 상대방의 이름을 넘겨줘야 한다.
          const pongGame = new PingPong('object', 'salee2', 'gychoi');
          pongGame.startGame();
        }
        break;
      case 'Tournament':
        if (className === 'player-option') {
          renderPage(pageBoard(), 'game-box');
          const playerNames = ['salee2', 'gychoi', 'jwee', 'junyo'];
          const tournament = new Tournament('object', playerNames);
          tournament.startTournament();
        }
        break;
      default:
        break;
    }
  };
}

init();
