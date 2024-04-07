import { gameState } from '../../../lib/state/state.js';
import { sendEmailCode } from '../../pages/game.js';

export function setupGameSettingModal(page) {
  let gameSettingModal = new bootstrap.Modal(
    page.querySelector('#gameSettingModal'),
    {
      keyboard: false,
    }
  );
  let startGameButton = page.querySelector('#startGameButton');
  let gameBox = page.querySelector('#game');

  // 게임 시작 버튼 이벤트
  startGameButton.addEventListener('click', function () {
    gameState.setState({ currentGameStatus: 'playing' });
    gameSettingModal.hide();
  });

  // Escape 키 이벤트
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Escape' &&
      gameState.getState().currentGameStatus === 'idle'
    ) {
      gameSettingModal.hide();
    }
  });

  // 게임 박스 클릭 이벤트
  gameBox.addEventListener('click', function () {
    if (gameState.getState().currentGameStatus === 'idle') {
      updateGameSettingModalMultilingualContent();
      gameSettingModal.show();
    }
  });

  const sendEmailButton = page.querySelector('#send-email-code-button');
  if (sendEmailButton) {
    sendEmailButton.addEventListener('click', sendEmailCode);
  }
}

export function updateGameBoxMultilingualContent() {
  const elementsToUpdate = {
    'pong': i18next.t('pong'),
    'classic': i18next.t('classic'),
    'player1': i18next.t('player1'),
    'player2': i18next.t('player2')
  };

  for (const [id, text] of Object.entries(elementsToUpdate)) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = text;
    }
  }
}

export function updateGameSettingModalMultilingualContent() {
  const elementsToUpdate = {
    'gameSettingModalLabel': i18next.t('gameSettingModalLabel'),
    'player2-label': i18next.t('player2-label'),
    'player-name': i18next.t('player-name'), // placeholder의 경우 추가 처리 필요
    'mode': i18next.t('mode'),
    'normal-label': i18next.t('normal-label'),
    'speed-label': i18next.t('speed-label'),
    'object-label': i18next.t('object-label'),
    'startGameButton': i18next.t('startGameButton')
  };

  for (const [id, text] of Object.entries(elementsToUpdate)) {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'player-name') {
        element.placeholder = text; // placeholder의 경우 별도 처리
      } else {
        element.innerHTML = text;
      }
    }
  }
}

export function updateScoreModalMultilingualContent() {
  const elementsToUpdate = {
    'scoreModalLabel': i18next.t('scoreModalLabel'),
    'win-label': i18next.t('win-label'),
    'lose-label': i18next.t('lose-label'),
    'save-score': i18next.t('save-score'),
    'email2faModalLabel': i18next.t('email2faModalLabel'),
    'emailAddressLabel': i18next.t('emailAddressLabel'),
    'emailInput': i18next.t('emailInput'), // placeholder의 경우 추가 처리 필요
    'send-email-code-button': i18next.t('send-email-code-button'),
    'codeInputLabel': i18next.t('codeInputLabel'),
    'send-verification-code-button': i18next.t('send-verification-code-button')
  };

  for (const [id, text] of Object.entries(elementsToUpdate)) {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'emailInput') {
        element.placeholder = text; // placeholder의 경우 별도 처리
      } else {
        element.innerHTML = text;
      }
    }
  }
}
