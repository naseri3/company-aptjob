/* ======================================================
   게시판 목록 → 팝업 열기
====================================================== */
document.addEventListener("DOMContentLoaded", () => {

  const rows = document.querySelectorAll(".board-row");
  if (!rows.length) return;
  rows.forEach(row => {
    row.addEventListener("click", () => {
      const url = row.dataset.href;
      const popupWidth = 900;
      const popupHeight = 700;

      const left = (screen.width - popupWidth) / 2;
      const top = (screen.height - popupHeight) / 2;

      window.open(
        url,
        "noticePopup",
        `
        width=${popupWidth},
        height=${popupHeight},
        left=${left},
        top=${top},
        scrollbars=yes,
        resizable=yes
        `
      );

    });
  });
});


/* ======================================================
   팝업 자동 height 조절
====================================================== */
window.addEventListener("load", () => {

  const popup = window.opener;
  // 팝업에서만 실행
  if (!popup) return;
  const popupWidth = 900;
  let height = document.body.scrollHeight + 40;
  if (height < 300) height = 300;
  if (height > 1000) height = 1000;

  const left = (screen.width - popupWidth) / 2;
  const top = (screen.height - height) / 2;

  window.resizeTo(popupWidth, height);
  window.moveTo(left, top);

});
