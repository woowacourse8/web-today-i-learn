// 1. 폼 요소와 목록 요소를 querySelector로 선택합니다.
const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");

// 2. 폼의 submit 이벤트를 감지하여 새 TIL 항목을 목록에 추가합니다.
tilForm.addEventListener("submit", function (event) {
    event.preventDefault();


    const dateValue = document.querySelector("#til-date").value;
    const titleValue = document.querySelector("#til-title").value;
    const contentValue = document.querySelector("#til-content").value;

    const newTilItem = document.createElement("article");
    newTilItem.classList.add("til-item");

    newTilItem.innerHTML = `
  <time>${dateValue}</time>
  <h3>${titleValue}</h3>
  <p>${contentValue}</p>
`;

    tilList.prepend(newTilItem);

    tilForm.reset();
});

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 링크 훅 점프 동작 방지

        // 클릭한 a 태그의 href 값 (예: "#about", "#gallery")을 가져옵니다.
        const targetId = this.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        // 해당 섹션으로 부드럽게 스크롤 이동합니다.
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});
