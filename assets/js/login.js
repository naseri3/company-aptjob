/** 구글 로그인 API */
const GOOGLE_CLIENT_ID = "24355175704-aviumsce0orbnutandgjjsruphqca8g5.apps.googleusercontent.com";
const REDIRECT_URI = "https://portfolio-aptjob.netlify.app/subpage/login.html";

const GOOGLE_AUTH_URL =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" + GOOGLE_CLIENT_ID +
    "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
    "&response_type=code" +
    "&scope=openid email profile";

const googleBtn = document.querySelector(".google_login");

googleBtn.addEventListener("click", () => {
    window.location.href = GOOGLE_AUTH_URL;
});
const params = new URLSearchParams(window.location.search);
const authCode = params.get("code");

if (authCode) {
    console.log("로그인 성공, code:", authCode);
    alert("로그인 성공!");
}


/** 네이버 로그인 API */
document.addEventListener("DOMContentLoaded", function () {
  var naver_id_login = new naver_id_login(
    "hLO6jennO8FmeKMz2ntZ",
    "https://portfolio-aptjob.netlify.app/subpage/login.html"
  );

  var state = naver_id_login.getUniqState();
  naver_id_login.setButton("white", 2, 40);
  naver_id_login.setState(state);
  naver_id_login.setPopup();
  naver_id_login.init_naver_id_login();
});
var naver_id_login = new naver_id_login("hLO6jennO8FmeKMz2ntZ", "https://portfolio-aptjob.netlify.app/subpage/login.html");
        var state = naver_id_login.getUniqState();
        naver_id_login.setButton("white", 2,40);
        naver_id_login.setDomain("https://portfolio-aptjob.netlify.app");
        naver_id_login.setState(state);
        naver_id_login.setPopup();
        naver_id_login.init_naver_id_login();


/** 카카오 로그인 API */
function loginWithKakao() {
    Kakao.Auth.authorize({
      redirectUri: 'http://127.0.0.1:5500/subpage/login.html',  // 앱에 등록된 카카오 로그인에서 사용할 Redirect URI 입력
    });
  }

  // 아래는 데모를 위한 UI 코드입니다.
  displayToken()
  function displayToken() {
    var token = getCookie('authorize-access-token');

    if(token) {
      Kakao.Auth.setAccessToken(token);
      Kakao.Auth.getStatusInfo()
        .then(function(res) {
          if (res.status === 'connected') {
            document.getElementById('token-result').innerText
              = 'login success, token: ' + Kakao.Auth.getAccessToken();
          }
        })
        .catch(function(err) {
          Kakao.Auth.setAccessToken(null);
        });
    }
  }

  function getCookie(name) {
    var parts = document.cookie.split(name + '=');
    if (parts.length === 2) { return parts[1].split(';')[0]; }
  }