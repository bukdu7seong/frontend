import { setCookie } from '../../utils/cookie.js';
import {
  firstRoute,
  redirectRoute,
  route,
} from '../../../lib/router/router.js';
import { userState } from '../../../lib/state/state.js';
import { requestUserInfo } from './sign_in.js';


async function requestResend() {
  try {
    const response = await fetch('http://localhost:8000/api/account/2fa/re/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userState.getState().userEmail })
    });

    if (response.status === 200) {
      // 응답 본문을 JSON으로 파싱
      const data = await response.json();
      console.log(data); // JSON 응답 본문을 로깅
      alert('인증 코드가 다시 발송되었습니다.');
    } else {
      console.log(response.status.toString());
      throw new Error(response.status.toString());
    }
  } catch (e) {
    console.log(e); // 실제 오류 객체를 로깅
    switch (e.message) {
      case '400':
        alert('400: 잘못된 요청입니다.');
        break;
      default:
        alert(`회원가입 절차를 진행할 수 없습니다. 다시 시도해 주세요. 오류: ${e.message}`);
    }
  }
}


// [2FA 코드 인증 요청]
async function requestTwoFACode(code) {
  //   console.log(code);
  try {
    const response = await fetch('http://localhost:8000/api/account/2fa/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        email: userState.getState().userEmail,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      setCookie(responseData);
      requestUserInfo();
      userState.setState({
        isLoggedIn: true,
      });

      firstRoute('/profile');
    } else {
      throw Error(response.status);
    }
  } catch (e) {
    switch (e.message) {
      case '400':
        alert('400: Bad Request');
        break;
      case '404':
        alert('404: Not Found');
        route('/404', true, false);
        break;
      case '409':
        alert('409: Conflict');
        break;
      default:
        alert('Failed to proceed sign up process. Please login again. /api/account/2fa/');
    }
    redirectRoute('/login');
  }
}

// [2FA 코드 재전송]
function resendEmail() {
  document
    .getElementById('resendEmailButton')
    .addEventListener('click', function () {
      requestResend();
    });
  //
}

// [2FA 코드 입력]
function verifyCode() {
  const code = document.getElementById('two-f-a-code');
  code.addEventListener('keyup', function (e) {
    if (e.key == 'Enter') {
      alert(
        'Two-factor authentication completed successfully. You are now logged in.'
      );
      requestTwoFACode(code.value);
    }
  });
}

// [2FA 타이머]
function timer() {
  let time = 300;
  const timerId = setInterval(() => {
    const timerElement = document.getElementById('timer');
    if (!timerElement) {
      clearInterval(timerId);
      return;
    }

    // setInterval로 초마다 시간 감소
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerElement.textContent = `${minutes}:${
      seconds < 10 ? '0' + seconds : seconds
    }`;
    time--;

    if (time < 0) {
      clearInterval(timerId);
      timerElement.textContent =
        'Authentication time has expired. Please press the resend button.';
      timerElement.style.color = 'red';
      alert('Authentication time has expired. Please press the resend button.');
    }
  }, 1000);
}

// [2FA]
export function twoFA() {
  resendEmail();
  verifyCode();
  timer();
}
