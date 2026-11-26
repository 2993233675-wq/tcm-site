/* =========================================================
   沁春堂国医馆 · 全站共享脚本
   功能：
   1. 手机端导航展开/收起
   2. 当前页面导航高亮
   3. 年份自动更新
   4. 打印按钮
   ========================================================= */

/* ---------- 1. 手机端导航 ---------- */
function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // 点击导航项后自动收起菜单
    nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ---------- 2. 当前页面导航高亮 ---------- */
function initActiveNav() {
    var current = window.location.pathname.split('/').pop();
    if (!current) current = 'index.html';

    var links = document.querySelectorAll('.site-nav a[href]');
    Array.prototype.forEach.call(links, function (link) {
        var href = link.getAttribute('href');
        if (href === current) {
            link.classList.add('is-active');
        }
    });
}

/* ---------- 3. 页脚年份 ---------- */
function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

/* ---------- 4. 打印 ---------- */
function initPrint() {
    var btn = document.getElementById('print-btn');
    if (btn) {
        btn.addEventListener('click', function () {
            window.print();
        });
    }
}

/* ---------- 5. 小程序环境下的链接修正 ---------- */
function initMpLinks() {
    if (!document.documentElement.classList.contains('in-mp')) return;

    // web-view 里没有新窗口的概念，target="_blank" 会导致点不动
    var links = document.querySelectorAll('a[target="_blank"]');
    Array.prototype.forEach.call(links, function (link) {
        link.removeAttribute('target');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initActiveNav();
    initYear();
    initPrint();
    initMpLinks();
});
