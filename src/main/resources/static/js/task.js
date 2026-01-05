document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("change", onFixedChange);
    initCustomExtension();
});
/* -----------------------------
           고정 확장자
------------------------------ */
function onFixedChange(event) {
    var checkbox = event.target;
    if (!checkbox || !checkbox.classList.contains("fixedChk")) return;

    var ext = checkbox.getAttribute("data-ext");
    var enabled = checkbox.checked;

    fetchJson("/api/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext: ext, enabled: enabled })
    }).catch(function (err) {
        checkbox.checked = !enabled;
        alert("에러");
    });
}

/* -----------------------------
           커스텀 확장자
------------------------------ */
var customExtensions = [];
var visibleCount = 20;  // 처음 보여줄 개수
var pageSize = 20;      // 더보기 클릭 시 증가량

function normalizeExtension(value) {
    if (!value) return "";
    var v = String(value).trim().toLowerCase().replace(/^\./, "");
    if (v.indexOf(".") === 0) v = v.substring(1);
    return v;
}
function renderCustomExtensions() {
    var area = document.getElementById("customTagArea");
    if (!area) return;

    area.innerHTML = "";

    var limit = visibleCount;
    if (limit > customExtensions.length) limit = customExtensions.length;

    for (var i = 0; i < limit; i++) {
        var item = customExtensions[i];

        var tag = document.createElement("div");
        tag.className = "tag";

        var text = document.createElement("span");
        text.className = "tag-text";
        text.innerText = item.ext;

        var del = document.createElement("span");
        del.className = "tag-del";
        del.innerText = "X";
        del.setAttribute("data-ext", item.ext);
        del.onclick = handleCustomDeleteClick;

        tag.appendChild(text);
        tag.appendChild(del);
        area.appendChild(tag);
    }

    updateCustomCounter();
    updateMoreButton();
    updateMoreUi();
}

function loadCustomExtensions() {
    fetch("/api/custom")
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error(text || "목록 조회 실패");
                });
            }
            return response.json();
        })
        .then(function (data) {
            customExtensions = Array.isArray(data) ? data : [];

            //  새로 로딩 시 처음 pageSize만 보여주기
            visibleCount = pageSize;
            if (visibleCount > customExtensions.length) visibleCount = customExtensions.length;

            renderCustomExtensions();
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function addCustomExtension() {
    var input = document.getElementById("customExtInput");
    if (!input) return;

    var ext = normalizeExtension(input.value);
    //유효성 검사 일부 뒷단에서도 함
    if (!ext) return alert("확장자를 입력하세요.");
    if (ext.length > 20) return alert("확장자는 최대 20자리입니다.");
    if (customExtensions.length >= 200) {
        alert("커스텀 확장자는 최대 200개까지 등록할 수 있습니다.");
        return;
    }
   if (!/^[a-z0-9]{1,20}$/.test(ext)){
       return alert("확장자는 영문/숫자만 입력 가능합니다.");
   }
    fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext: ext })
    })
    .then(function (response) {
        if (!response.ok) {
            return response.json().then(function (err) {
                throw new Error(err.message || "추가 실패");
            });
        }
        input.value = "";
        loadCustomExtensions();
    })
    .catch(function (error) {
        alert(error.message);
    });
}

function handleCustomDeleteClick(event) {
    var target = event.target;
    var ext = target.getAttribute("data-ext");

    fetch("/api/custom/" + encodeURIComponent(ext), {
        method: "DELETE"
    })
    .then(function (response) {
        if (!response.ok) {
            return response.json().then(function (err) {
                throw new Error(err.message || "삭제 실패");
            });
        }
        loadCustomExtensions();
    })
    .catch(function (error) {
        alert(error.message);
    });
}

function initCustomExtension() {
    var addButton = document.getElementById("customAddBtn");
    var input = document.getElementById("customExtInput");
     var moreBtn = document.getElementById("customMoreBtn");

    if (addButton) addButton.onclick = addCustomExtension;

    if (input) {
        input.onkeydown = function (event) {
            if (event.key === "Enter") addCustomExtension();
        };
    }
    if (moreBtn) {
            moreBtn.onclick = showMoreCustomExtensions;
        }

    loadCustomExtensions();
}

function updateCustomCounter() {
    var countEl = document.getElementById("customCount");
    if (!countEl) return;
    countEl.innerText = customExtensions.length;
}
//더보기 버튼 보이기/숨기기 함수 추가
function updateMoreButton() {
  var moreBtn = document.getElementById("customMoreBtn");
  if (!moreBtn) return;

  var len = Array.isArray(customExtensions) ? customExtensions.length : 0;
  var remain = len - visibleCount;

  // 남은게 있으면 무조건 보이게
  if (remain > 0) {
    moreBtn.style.display = "inline-block";
  } else {
    moreBtn.style.display = "none";
  }
}

// 더보기 클릭 함수 추가
function showMoreCustomExtensions() {
    visibleCount = visibleCount + pageSize;
    if (visibleCount > customExtensions.length) {
        visibleCount = customExtensions.length;
    }
    renderCustomExtensions();
}

function updateMoreUi() {
    var fade = document.getElementById("customFade");
    var remainText = document.getElementById("customRemainText");

    var remain = customExtensions.length - visibleCount;
    if (remain < 0) remain = 0;


    if (remainText) {
        remainText.innerText = remain > 0 ? "(" + remain + "개 남음)" : "";
    }

    //더 남아있을 때만 표시
    if (fade) {
        fade.style.display = (remain > 0) ? "block" : "none";
    }
}
/* 유틸 */
function fetchJson(url, opt) {
    return fetch(url, opt).then(function (res) {
        if (!res.ok) {
            return res.json()
                .catch(function () { return { message: "요청 실패" }; })
                .then(function (e) { throw new Error(e.message || "요청 실패"); });
        }
        return res.json();
    });
}
