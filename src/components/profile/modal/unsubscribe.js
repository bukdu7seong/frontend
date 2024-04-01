// 필요한 모듈 또는 유틸리티 가져오기
import { globalState, userState } from '../../../../lib/state/state.js';
import { successToast } from '../toast/success.js';
import { failureToast } from '../toast/failure.js';
import { getCookie } from '../../../utils/cookie.js';

// 회원 탈퇴 확인 모달 HTML
function confirmDeletionModalHTML(modalId, finalModalId) {
  return `

<div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="confirmDeletionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmDeletionModalLabel">회원 탈퇴 확인</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id='confirm-deletion-modal-content'>
            정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id='confirm-deletion-modal-cancel'>취소</button>
                <button type="button" class="btn btn-danger" data-bs-target="#${finalModalId}" data-bs-toggle="modal" id=confirm-deletion-modal-confirm>탈퇴하기</button>
            </div>
        </div>
    </div>
  `;
}

// 최종 확인 모달 HTML
function finalConfirmationModalHTML(modalId) {
  return `
<div class="modal fade" id='${modalId}' tabindex="-1" aria-labelledby="passwordConfirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="passwordConfirmModalLabel">비밀번호 확인</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="passwordConfirmForm">
                    <div class="mb-3">
                        <label for='password-confirm-form-input' class="form-label" id='password-confirm-form-content' >비밀번호를 입력하세요</label>
                        <input type="password" class="form-control" id='password-confirm-form-input' placeholder="비밀번호">  
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-danger" id='password-confirm-form-confirm'>탈퇴 확인</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

  `;
}

function popToast(toastType, content) {
  const toast = new toastType(content);
  toast.show();
  setTimeout(() => {
    toast.hide();
  }, 3000);
}

export class deleteUserModal {
  constructor(
    frontModalId = 'confirmDeletionModal',
    backModalId = 'finalConfirmModal'
  ) {
    this.frontModalHTML = confirmDeletionModalHTML(frontModalId, backModalId);
    this.backModalHTML = finalConfirmationModalHTML(backModalId);
    this.frontModalId = frontModalId;
    this.backModalId = backModalId;
    this.frontModalInstance = null;
    this.backModalInstance = null;
    this.status = 'front';
    this.initModal();
  }

  initModal() {
    document.body.insertAdjacentHTML('beforeend', this.frontModalHTML);
    document.body.insertAdjacentHTML('beforeend', this.backModalHTML);

    this.frontModalInstance = new bootstrap.Modal(
      document.getElementById(this.frontModalId)
    );

    this.backModalInstance = new bootstrap.Modal(
      document.getElementById(this.backModalId)
    );

    this.frontModalInstance._element.addEventListener(
      'hidden.bs.modal',
      this.handleFrontHidden.bind(this)
    );

    this.backModalInstance._element.addEventListener(
      'hidden.bs.modal',
      this.handleBackHidden.bind(this)
    );

    this.frontModalInstance._element
      .querySelector('.btn-danger')
      .addEventListener('click', this.confirm.bind(this));

    this.backModalInstance._element
      .querySelector('.btn-danger')
      .addEventListener('click', this.finalizeDeletion.bind(this));

    // document.getElementById('passwordConfirmForm').addEventListener('submit', (event) => {
    //   event.preventDefault();
    //   this.finalizeDeletion();
    // });
  }

  confirm() {
    this.status = 'back';
    this.handleFrontHidden();
    this.backModalInstance.show();
  }



  finalizeDeletion() {
    const password = this.finalModalInstance._element.querySelector('#accountPassword').value;
    if (password) {
      // 여기서 비밀번호 검증 및 탈퇴 처리 로직을 수행합니다.
      deleteUserAccount(password).then(() => {
        // 성공 메시지 및 후속 처리
        popToast(successToast, '계정이 성공적으로 삭제되었습니다.');
      }).catch(error => {
        // 오류 메시지 처리
        popToast(failureToast, error.message);
      });
    } else {
      // 비밀번호 입력 오류 메시지
      popToast(failureToast, '비밀번호를 입력해야 합니다.');
    }
  }

  handleBackHidden() {
    this.backModalInstance._element.remove();
  }

  handleFrontHidden() {
    if (this.status === 'back') {
      this.frontModalInstance._element.remove();
      return;
    }
    // 한 번에 element가 동시에 생기기에, 모두 없애야 한다.
    this.frontModalInstance._element.remove();
    this.backModalInstance._element.remove();
  }

  show() {
    this.updateModalContent();
    this.frontModalInstance.show();
    // userState.setState()
  }

  updateModalContent() {
    document.getElementById("confirmDeletionModalLabel").innerHTML = i18next.t("confirmDeletionModalLabel");
    document.getElementById('confirm-deletion-modal-content').innerHTML = i18next.t('confirm-deletion-modal-content');
    document.getElementById('confirm-deletion-modal-cancel').innerHTML = i18next.t('confirm-deletion-modal-cancel');
    document.getElementById('confirm-deletion-modal-confirm').innerHTML = i18next.t('confirm-deletion-modal-confirm');
    document.getElementById('passwordConfirmModalLabel').innerHTML = i18next.t('passwordConfirmModalLabel');
    document.getElementById('password-confirm-form-content').innerHTML = i18next.t('password-confirm-form-content')
    document.getElementById('password-confirm-form-input').placeholder = i18next.t('password-confirm-form-input');
    document.getElementById('password-confirm-form-confirm').innerHTML = i18next.t('password-confirm-form-confirm');
  }
}

async function deleteUserAccount(password) {
  try {
    const accessToken = getCookie("accessToken"); // 쿠키에서 사용자 토큰 가져오기
    const url = 'http://localhost:8000/api/account/delete-account/'; // 엔드포인트
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ password })
    });

    if (response.status === 204) {
      // 비밀번호가 올바른 경우, 성공 메시지 표시 및 모달 닫기
      popToast(successToast, '계정이 성공적으로 삭제되었습니다.');
      this.backModalInstance.hide();
    } else if (response.status === 403) {
      // 비밀번호가 틀린 경우, 오류 메시지 표시
      throw new Error('비밀번호가 올바르지 않습니다.');
    } else {
      // 기타 HTTP 상태 코드 처리
      throw new Error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    popToast(failureToast, error.message);
  }
}

deleteUserModal.prototype.finalizeDeletion = function () {
  const password = document.getElementById('password-confirm-form-input').value;
  if (password) {
    deleteUserAccount(password).then(() => {
      // 이 부분은 위의 deleteUserAccount 함수 내에서 처리됩니다.
    }).catch(error => {
      // 오류 메시지 처리
      popToast(failureToast, error.message);
    });
  } else {
    // 비밀번호 입력 오류 메시지
    popToast(failureToast, '비밀번호를 입력해야 합니다.');
  }

  if (!this.formInitialized) {
    document.getElementById('passwordConfirmForm').addEventListener('submit', (event) => {
      event.preventDefault(); // 폼 제출에 따른 페이지 새로고침 방지
      this.finalizeDeletion(); // 비밀번호 확인 및 계정 삭제 처리
    });
    this.formInitialized = true; // 폼 이벤트 리스너 초기화 표시
  }

};
