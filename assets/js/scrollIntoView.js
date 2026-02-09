const tabs = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('section[id]');
/* =========================
   1) 탭 클릭 스크롤
========================= */
tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        const headerOffset = 320;
        const elementPosition = targetEl.offsetTop;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});


/* =========================
   2️) 스크롤 시 active 변경
========================= */
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 330;
    // ↑ headerOffset + 여유값
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        if (scrollPosition >= sectionTop) {
            tabs.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.target === sectionId) {
                    btn.classList.add('active');
                }
            });
        }
    });
});
