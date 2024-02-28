import { globalState, userState } from '../../lib/state/state.js';

// API를 통해 받아와야 하지만 일단은 임시적인 부분.
const tempImages = [
  '../../images/profile/profile_01.jpg',
  '../../images/profile/profile_02.jpg',
  '../../images/profile/profile_03.jpg',
  '../../images/profile/profile_04.jpg',
];
const tempData = {
  userImageUrl: tempImages[Math.floor(Math.random() * tempImages.length)],
  userName: 'Guest',
}; // getUserData() 로 대체해야 함

export function initUserInfo() {
  const loginState = globalState.getState().isLoggedIn;
  if (!loginState) {
    return;
  }

  // API로 변경해야 한다.
  // const userData = getUserData();
  const userData = tempData;

  // 음... API 호출이 너무 빈번하지만 일단은 이렇게 처리.

  userState.setState(
    {
      userImageUrl: userData.userImageUrl,
      userName: userData.userName,
      userSocket: new WebSocket('ws://localhost:8080'),
    },
    false
  );
}
