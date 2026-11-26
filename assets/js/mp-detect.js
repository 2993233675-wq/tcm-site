/**
 * 小程序环境检测 —— 必须放在 <head> 里同步加载，
 * 这样能在网页渲染前就加上标记，避免顶部导航先闪一下再消失。
 *
 * 判据（任一命中即认为在小程序里）：
 *   1. 微信小程序 web-view 的 UA 里带 miniProgram 标记（跨页面跳转依然有效）
 *   2. 地址带 ?mp=1（电脑浏览器里预览效果用）
 *   3. sessionStorage 里的标记（补 ?mp=1 在相对链接跳转后丢失的情况）
 */
(function () {
    var ua = navigator.userAgent || '';
    var query = location.search || '';
    var FLAG = 'qct-in-mp';

    var inMiniProgram = /miniProgram/i.test(ua) || /[?&]mp=1/.test(query);

    if (!inMiniProgram) {
        try {
            inMiniProgram = sessionStorage.getItem(FLAG) === '1';
        } catch (e) {
            /* 隐私模式下取不到，忽略 */
        }
    }

    if (inMiniProgram) {
        document.documentElement.className += ' in-mp';
        try {
            sessionStorage.setItem(FLAG, '1');
        } catch (e) {
            /* 忽略 */
        }
    }
})();
