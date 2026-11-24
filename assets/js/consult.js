/* =========================================================
   沁春堂国医馆 · 在线问诊表单脚本
   流程：校验 → 生成问诊单号 → 渲染回执 → 支持打印 / 复制
   注意：当前为纯前端演示，数据仅保存在本机浏览器，不会上传到服务器。
   ========================================================= */

var form = document.getElementById('consult-form');
var successPanel = document.getElementById('submit-success');

/* ---------- 1. 校验规则 ---------- */
var RULES = [
    {
        name: 'name',
        test: function (v) { return v.trim().length > 0; },
        message: '请填写姓名'
    },
    {
        name: 'gender',
        test: function (v) { return v !== ''; },
        message: '请选择性别'
    },
    {
        name: 'age',
        test: function (v) {
            if (v === '') return false;
            var n = parseInt(v, 10);
            return !isNaN(n) && n >= 0 && n <= 120;
        },
        message: '请填写 0–120 之间的年龄'
    },
    {
        name: 'phone',
        test: function (v) { return /^1[3-9]\d{9}$/.test(v.trim()); },
        message: '请填写 11 位手机号'
    },
    {
        name: 'chief',
        test: function (v) { return v.trim().length >= 5; },
        message: '请描述您的主要不适（至少 5 个字）'
    },
    {
        name: 'duration',
        test: function (v) { return v !== ''; },
        message: '请选择病程'
    },
    {
        name: 'consent',
        test: function (v) { return v === true; },
        message: '请勾选同意后再提交'
    }
];

/* ---------- 2. 读取表单值 ---------- */
/* 同名的一组单选框，用 namedItem 拿到的是一个"组"（RadioNodeList）。
   注意：RadioNodeList 上没有 .type，也没有 .name（都是 undefined），
   所以字段名必须由调用方单独传进来，不能从 field 上取。 */
function getValue(field, fieldName) {
    var type = field.type;

    /* RadioNodeList —— 没有 .type，但有 .length */
    if (type === undefined) {
        var checkedInGroup = form.querySelector('input[name="' + fieldName + '"]:checked');
        return checkedInGroup ? checkedInGroup.value : '';
    }

    if (type === 'radio') {
        var checkedRadio = form.querySelector('input[name="' + fieldName + '"]:checked');
        return checkedRadio ? checkedRadio.value : '';
    }

    if (type === 'checkbox') {
        return field.checked;
    }

    return field.value;
}

/* 找到某个字段对应的、可以聚焦的第一个真实 input 元素 */
function getFocusTarget(name) {
    var group = form.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < group.length; i++) {
        if (group[i].type === 'radio' || group[i].type === 'checkbox') {
            return group[i];
        }
    }
    return form.elements.namedItem(name);
}

function getCheckedList(name) {
    var boxes = form.querySelectorAll('input[name="' + name + '"]:checked');
    var list = [];
    Array.prototype.forEach.call(boxes, function (b) { list.push(b.value); });
    return list;
}

/* 读取单个文本框 / 下拉框的值 */
function getText(name) {
    var field = form.elements.namedItem(name);
    return field ? field.value.trim() : '';
}

/* ---------- 3. 显示 / 隐藏错误 ---------- */
function showError(name, message) {
    var errorEl = document.querySelector('[data-error-for="' + name + '"]');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-shown');
    }

    var field = getFocusTarget(name);
    if (field && field.classList) field.classList.add('has-error');

    /* 单选/复选框的 input 是隐藏的，错误样式要加在可见的元素上 */
    if (name === 'consent') {
        var consentLabel = form.querySelector('.form-consent');
        if (consentLabel) consentLabel.classList.add('has-error');
    } else {
        var radios = form.querySelectorAll('input[name="' + name + '"]');
        if (radios.length && radios[0].closest('.choice-row')) {
            radios[0].closest('.choice-row').classList.add('has-error');
        }
    }
}

function clearErrors() {
    var errors = form.querySelectorAll('.form-error');
    Array.prototype.forEach.call(errors, function (el) {
        el.classList.remove('is-shown');
    });

    var controls = form.querySelectorAll('.has-error');
    Array.prototype.forEach.call(controls, function (el) {
        el.classList.remove('has-error');
    });
}

/* ---------- 4. 整体校验 ---------- */
function validate() {
    clearErrors();
    var firstBad = null;

    RULES.forEach(function (rule) {
        var field = form.elements.namedItem(rule.name);
        if (!field) return;

        var value = getValue(field, rule.name);
        if (!rule.test(value)) {
            showError(rule.name, rule.message);
            if (!firstBad) firstBad = getFocusTarget(rule.name);
        }
    });

    if (firstBad) {
        firstBad.focus();
        if (firstBad.scrollIntoView) {
            firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }
    return true;
}

/* ---------- 5. 生成问诊单号 ---------- */
function makeOrderNo() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var rand = String(Math.floor(Math.random() * 9000) + 1000);
    return 'QCT-' + y + m + d + '-' + rand;
}

/* ---------- 6. 收集提交数据 ---------- */
function collectData() {
    return {
        orderNo: makeOrderNo(),
        submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
        name: getText('name'),
        gender: getValue(form.elements.namedItem('gender'), 'gender'),
        age: getText('age'),
        phone: getText('phone'),
        dept: getText('dept') || '由分诊台推荐',
        visit: getValue(form.elements.namedItem('visit'), 'visit'),
        chief: getText('chief'),
        duration: getText('duration'),
        tongue: getText('tongue') || '未填',
        history: getText('history') || '未填',
        symptoms: getCheckedList('symptom'),
        doctor: getText('doctor') || '暂无偏好，由分诊台安排',
        date: getText('date') || '待确认',
        remark: getText('remark') || '无'
    };
}

/* ---------- 7. 渲染回执 ---------- */
function renderReceipt(data) {
    var rows = [
        ['问诊单号', data.orderNo, true],
        ['提交时间', data.submitTime],
        ['姓名', data.name],
        ['性别 / 年龄', data.gender + ' / ' + data.age + ' 岁'],
        ['联系电话', data.phone],
        ['希望科室', data.dept],
        ['就诊方式', data.visit],
        ['主诉', data.chief],
        ['病程', data.duration],
        ['伴随症状', data.symptoms.length ? data.symptoms.join('、') : '无'],
        ['舌象', data.tongue],
        ['既往史与用药', data.history],
        ['希望医师', data.doctor],
        ['期望日期', data.date],
        ['其他说明', data.remark]
    ];

    var receipt = document.getElementById('receipt');
    receipt.innerHTML = '';

    rows.forEach(function (row) {
        var wrap = document.createElement('div');
        wrap.className = 'receipt__row';

        var dt = document.createElement('dt');
        dt.textContent = row[0];

        var dd = document.createElement('dd');
        dd.textContent = row[1];
        if (row[2]) dd.className = 'receipt__no';

        wrap.appendChild(dt);
        wrap.appendChild(dd);
        receipt.appendChild(wrap);
    });

    // 保存到本机，方便刷新后查看（仅本地存储，不上传）
    try {
        localStorage.setItem('jh_last_consult', JSON.stringify(data));
    } catch (e) { /* 隐私模式等场景下写入失败可忽略 */ }
}

/* ---------- 8. 生成纯文本版问诊单（用于复制 / 打印） ---------- */
function buildPlainText(data) {
    var lines = [
        '沁春堂国医馆 · 在线问诊单',
        '------------------------------',
        '问诊单号：' + data.orderNo,
        '提交时间：' + data.submitTime,
        '姓名：' + data.name + '    性别：' + data.gender + '    年龄：' + data.age + ' 岁',
        '联系电话：' + data.phone,
        '希望科室：' + data.dept + '    就诊方式：' + data.visit,
        '',
        '【主诉】' + data.chief,
        '【病程】' + data.duration,
        '【伴随症状】' + (data.symptoms.length ? data.symptoms.join('、') : '无'),
        '【舌象】' + data.tongue,
        '【既往史与用药】' + data.history,
        '【希望医师】' + data.doctor,
        '【期望就诊日期】' + data.date,
        '【其他说明】' + data.remark,
        '------------------------------',
        '本问诊单仅用于预约与信息采集，不构成诊断与处方。'
    ];
    return lines.join('\n');
}

/* ---------- 9. 提交处理 ---------- */
form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validate()) return;

    var data = collectData();
    renderReceipt(data);

    form.style.display = 'none';
    successPanel.classList.add('is-shown');

    successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ---------- 10. 复制问诊单文字 ---------- */
function fallbackCopy(text, btn, original) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        btn.textContent = '已复制到剪贴板';
    } catch (e) {
        btn.textContent = '复制失败，请手动选择';
    }

    document.body.removeChild(textarea);
    setTimeout(function () { btn.textContent = original; }, 2000);
}

document.addEventListener('DOMContentLoaded', function () {
    var copyBtn = document.getElementById('copy-btn');

    copyBtn.addEventListener('click', function () {
        var raw = null;
        try {
            raw = localStorage.getItem('jh_last_consult');
        } catch (e) { raw = null; }
        if (!raw) return;

        var text = buildPlainText(JSON.parse(raw));
        var original = copyBtn.textContent;

        // 优先用剪贴板 API，不支持时退回选中提示
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                copyBtn.textContent = '已复制到剪贴板';
                setTimeout(function () { copyBtn.textContent = original; }, 2000);
            }).catch(function () {
                fallbackCopy(text, copyBtn, original);
            });
        } else {
            fallbackCopy(text, copyBtn, original);
        }
    });

    // 再填一份
    document.getElementById('again-btn').addEventListener('click', function () {
        form.reset();
        clearErrors();
        successPanel.classList.remove('is-shown');
        form.style.display = '';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
