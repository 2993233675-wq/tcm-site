/* =========================================================
   沁春堂国医馆 · 体质自测交互脚本
   逻辑：逐题作答 → 每种体质累计得分 → 得分最高的体质即为结果
   ========================================================= */

/* ---------- 1. 题目数据 ---------- */
/* 每道题的每个选项，给哪些体质各加几分 */
var QUESTIONS = [
    {
        title: '你的精神状态如何？',
        options: [
            { text: '精力充沛，白天很少觉得累', scores: { pinghe: 2 } },
            { text: '容易疲乏，稍微动一下就累', scores: { qixu: 2 } },
            { text: '午后明显犯困，总想打盹', scores: { tanshi: 2 } },
            { text: '情绪起伏大，心里常烦躁', scores: { qiyu: 2 } }
        ]
    },
    {
        title: '你的怕冷与耐热情况是？',
        options: [
            { text: '都不太明显，冷热适应良好', scores: { pinghe: 2 } },
            { text: '特别怕冷，手脚常年冰凉', scores: { yangxu: 2 } },
            { text: '怕热，手心脚心发热、身上发热', scores: { yinxu: 2 } },
            { text: '身体沉重闷热，头上爱出汗', scores: { shire: 2 } }
        ]
    },
    {
        title: '你的大便情况是？',
        options: [
            { text: '成形、每日一行', scores: { pinghe: 2 } },
            { text: '偏稀，一天两次以上', scores: { yangxu: 2 } },
            { text: '干硬难出，两三天才一次', scores: { yinxu: 2 } },
            { text: '黏腻不爽，冲不干净', scores: { shire: 2 } }
        ]
    },
    {
        title: '你的面部特征更接近？',
        options: [
            { text: '面色红润有光泽', scores: { pinghe: 2 } },
            { text: '面色淡白，少血色', scores: { qixu: 2 } },
            { text: '面部油腻，易出油长痘', scores: { shire: 2 } },
            { text: '面色晦暗，色素沉着较多', scores: { xueyu: 2 } }
        ]
    },
    {
        title: '你的睡眠与情绪状况是？',
        options: [
            { text: '入睡快，一觉到天亮', scores: { pinghe: 2 } },
            { text: '入睡困难，多梦易醒', scores: { qiyu: 2 } },
            { text: '盗汗，睡觉时身上出汗', scores: { yinxu: 2 } },
            { text: '睡眠浅，容易被一点动静惊醒', scores: { qixu: 2 } }
        ]
    },
    {
        title: '你的出汗情况是？',
        options: [
            { text: '出汗正常，不多不少', scores: { pinghe: 2 } },
            { text: '稍微活动就出汗，气短乏力', scores: { qixu: 2 } },
            { text: '夜间入睡后汗出，醒来自止', scores: { yinxu: 2 } },
            { text: '头面油汗多，午后尤甚', scores: { tanshi: 2 } }
        ]
    },
    {
        title: '你的口味与饮食偏好是？',
        options: [
            { text: '口味正常，什么都能吃', scores: { pinghe: 2 } },
            { text: '喜热饮喜热食，越热越舒服', scores: { yangxu: 2 } },
            { text: '口苦，喜食辛辣重口', scores: { shire: 2 } },
            { text: '口淡无味，胃口差，吃什么都不香', scores: { qixu: 2 } }
        ]
    },
    {
        title: '你平时的身体感受偏向？',
        options: [
            { text: '身体轻松，无明显不适', scores: { pinghe: 2 } },
            { text: '关节酸痛固定，碰到阴雨天加重', scores: { xueyu: 2 } },
            { text: '容易过敏，打喷嚏、起风团', scores: { tebing: 2 } },
            { text: '胸胁胀满，爱叹气，咽中如有异物', scores: { qiyu: 2 } }
        ]
    },
    {
        title: '你的体形与腹部状况是？',
        options: [
            { text: '体型匀称，腹部平坦紧实', scores: { pinghe: 2 } },
            { text: '腹部松软肥满，肥胖倾向明显', scores: { tanshi: 2 } },
            { text: '形体偏瘦，锁骨明显', scores: { yinxu: 2 } },
            { text: '体重偏轻，容易疲乏消瘦', scores: { qixu: 2 } }
        ]
    }
];

/* ---------- 2. 九种体质的结果说明 ---------- */
var CONSTITUTIONS = {
    pinghe: {
        name: '平和质',
        tagline: '阴阳气血调和，体质基础较好',
        sign: '表现：面色红润、精力充沛、睡眠饮食俱佳，对季节与气候变化适应力强，患病较少。',
        advice: [
            '保持饮食有节、饥饱适度，不暴饮暴食',
            '起居规律，保证充足睡眠，避免熬夜',
            '适度运动，如八段锦、太极拳、慢跑',
            '季节变换时略作饮食调整即可，无需刻意进补'
        ]
    },
    qixu: {
        name: '气虚质',
        tagline: '元气不足，以疲乏、气短、自汗为主要特征',
        sign: '表现：容易疲乏、气短懒言、声音低微、易出汗、抵抗力差、容易感冒、大便偏溏。',
        advice: [
            '益气健脾，日常可用山药、黄芪、大枣、粳米等',
            '避免过劳与剧烈出汗运动，忌大汗淋漓的锻炼方式',
            '起居避风寒，注意保暖，尤其腹部与足部',
            '运动宜柔缓，如八段锦、五禽戏、散步'
        ]
    },
    yangxu: {
        name: '阳虚质',
        tagline: '阳气不足，以怕冷、手脚不温为主要特征',
        sign: '表现：怕冷、手脚不温、喜热饮喜热食、大便偏溏、精神不振、易患感冒、痰饮聚停。',
        advice: [
            '温补脾肾，可用生姜、羊肉、桂圆、韭菜等温性食物',
            '忌生冷冰饮、寒凉瓜果，避免长时间待在空调房',
            '重在保暖，可每日温水泡脚 15–20 分钟',
            '适当进行户外运动，晒太阳有助于助阳'
        ]
    },
    yinxu: {
        name: '阴虚质',
        tagline: '阴液亏少，以口干、手足心热为主要特征',
        sign: '表现：手足心热、口干咽燥、易失眠、大便干结、皮肤偏干、易潮热盗汗、舌红少苔。',
        advice: [
            '滋阴润燥，可用银耳、百合、桑葚、梨、鸭肉等',
            '忌辛辣煎炸、烧烤、酒精等耗伤阴液之物',
            '保证睡眠，避免熬夜耗伤阴血',
            '运动宜静缓，避免大汗淋漓与桑拿汗蒸'
        ]
    },
    tanshi: {
        name: '痰湿质',
        tagline: '水湿内停，以体形偏胖、胸闷多痰为主要特征',
        sign: '表现：体形偏胖、腹部松软肥满、胸闷、多痰、易困倦、口黏不渴、喜食肥甘。',
        advice: [
            '健脾利湿，可用薏苡仁、赤小豆、陈皮、荷叶等',
            '控制甜腻、油炸、肥厚食物，减少宵夜',
            '加强运动出汗是改善痰湿的关键，如快走、慢跑、游泳',
            '居住环境宜干燥通风，避免久居湿地'
        ]
    },
    shire: {
        name: '湿热质',
        tagline: '湿热内蕴，以面部油腻、口苦、大便黏滞为主要特征',
        sign: '表现：面部油腻、易生痤疮、口苦、大便黏滞不爽、肢体困重、易倦怠、低热、尿黄。',
        advice: [
            '清热利湿，可用绿豆、苦瓜、冬瓜、薏苡仁等',
            '忌酒、辛辣、油炸，饮食宜清淡',
            '规律作息，避免熬夜，熬夜助生内热',
            '保持居室通风干燥，可适当增加运动量'
        ]
    },
    xueyu: {
        name: '血瘀质',
        tagline: '血行不畅，以面色晦暗、痛处固定为主要特征',
        sign: '表现：面色晦暗、易有瘀斑、肤色偏暗、唇色偏暗、痛处固定不移、夜间加重、肌肤干燥。',
        advice: [
            '活血化瘀、养血润燥，可用山楂、玫瑰花、黑木耳',
            '保持适度运动，气行则血行，可练五禽戏、八段锦',
            '可少量饮用米醋或山楂水',
            '注意情志舒畅，气滞则血瘀'
        ]
    },
    qiyu: {
        name: '气郁质',
        tagline: '气机郁滞，以情绪低落、胸胁胀闷为主要特征',
        sign: '表现：情绪低落、胸胁胀满、易叹气、咽中异物感、失眠多梦、健忘、痰多。',
        advice: [
            '疏肝解郁，可用玫瑰花、合欢花、陈皮、佛手',
            '重视情志疏解，多与家人朋友倾诉，必要时寻求专业心理支持',
            '规律运动是改善气郁最有效的方式，如快走、瑜伽、登山',
            '饮食忌收敛酸涩之品，晚餐不宜过饱'
        ]
    },
    tebing: {
        name: '特禀质',
        tagline: '先天禀赋特殊，以过敏反应为主要特征',
        sign: '表现：易过敏、打喷嚏、起风团、对药物或食物反应明显，常伴哮喘、鼻痒、皮肤划痕症。',
        advice: [
            '避免接触已知过敏原，饮食上留意"发物"',
            '益气固表、养血消风，需由医师辨证后开具方药',
            '常年可用玉屏风散类方在医师指导下调护',
            '注意居室通风除尘、避免养宠物，保持居住环境清洁'
        ]
    }
};

/* ---------- 3. 运行状态 ---------- */
var currentIndex = 0;      // 当前第几题（从 0 开始）
var answers = [];          // 每题选中的选项下标，-1 表示未选
var scores = {};           // 各体质的累计得分

/* ---------- 4. 初始化 ---------- */
function initScores() {
    scores = {};
    Object.keys(CONSTITUTIONS).forEach(function (key) {
        scores[key] = 0;
    });
}

function getElement(id) {
    return document.getElementById(id);
}

/* ---------- 5. 渲染当前题目 ---------- */
function renderQuestion() {
    var q = QUESTIONS[currentIndex];

    getElement('question-title').textContent = q.title;

    // 更新进度条
    var percent = Math.round((currentIndex / QUESTIONS.length) * 100);
    getElement('progress-fill').style.width = percent + '%';
    getElement('progress-label').textContent =
        '第 ' + (currentIndex + 1) + ' 题 / 共 ' + QUESTIONS.length + ' 题';
    getElement('progress-percent').textContent = percent + '%';

    // 渲染选项
    var box = getElement('quiz-options');
    box.innerHTML = '';

    q.options.forEach(function (option, index) {
        var label = document.createElement('label');
        label.className = 'quiz-option';

        if (answers[currentIndex] === index) {
            label.classList.add('is-checked');
        }

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'quiz-option';
        radio.value = index;
        radio.checked = (answers[currentIndex] === index);

        var text = document.createElement('span');
        text.textContent = option.text;

        label.appendChild(radio);
        label.appendChild(text);
        box.appendChild(label);

        // 选中即记录答案
        radio.addEventListener('change', function () {
            answers[currentIndex] = index;
            var all = box.querySelectorAll('.quiz-option');
            Array.prototype.forEach.call(all, function (el) {
                el.classList.remove('is-checked');
            });
            label.classList.add('is-checked');
            updateNextButton();
        });
    });

    // 上一题按钮：第 1 题时禁用
    getElement('prev-btn').disabled = (currentIndex === 0);
    getElement('prev-btn').style.opacity = (currentIndex === 0) ? '.4' : '1';

    updateNextButton();
}

/* ---------- 6. 下一题按钮的可用状态 ---------- */
function updateNextButton() {
    var btn = getElement('next-btn');
    if (answers[currentIndex] === undefined || answers[currentIndex] === -1) {
        btn.disabled = true;
        btn.style.opacity = '.45';
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
    }
    btn.textContent = (currentIndex === QUESTIONS.length - 1) ? '查看结果' : '下一题';
}

/* ---------- 7. 下一题 ---------- */
function goNext() {
    if (currentIndex < QUESTIONS.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        showResult();
    }
}

/* ---------- 8. 上一题 ---------- */
function goPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

/* ---------- 9. 计算并展示结果 ---------- */
function showResult() {
    initScores();

    // 把每题选中选项的分数累加
    answers.forEach(function (choice, qIndex) {
        if (choice === undefined || choice === -1) return;
        var option = QUESTIONS[qIndex].options[choice];
        Object.keys(option.scores).forEach(function (key) {
            scores[key] += option.scores[key];
        });
    });

    // 找出最高分的体质
    var topKey = 'pinghe';
    var topScore = -1;
    Object.keys(scores).forEach(function (key) {
        if (scores[key] > topScore) {
            topScore = scores[key];
            topKey = key;
        }
    });

    // 找出并列第二的体质，作为"兼夹体质"提示
    var sorted = Object.keys(scores).sort(function (a, b) {
        return scores[b] - scores[a];
    });
    var secondKey = sorted[1];
    var isCombined = (secondKey && scores[secondKey] > 0 && scores[secondKey] >= topScore * 0.6);

    var result = CONSTITUTIONS[topKey];

    getElement('result-name').textContent = result.name;
    getElement('result-tagline').textContent = result.tagline;

    var body = getElement('result-body');
    body.innerHTML = '';

    var h4 = document.createElement('h4');
    h4.textContent = '典型表现';
    body.appendChild(h4);

    var p = document.createElement('p');
    p.textContent = result.sign;
    body.appendChild(p);

    var h4b = document.createElement('h4');
    h4b.textContent = '日常调养方向';
    body.appendChild(h4b);

    var ul = document.createElement('ul');
    result.advice.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
    body.appendChild(ul);

    if (isCombined) {
        var h4c = document.createElement('h4');
        h4c.textContent = '兼夹倾向';
        body.appendChild(h4c);

        var p2 = document.createElement('p');
        p2.textContent = '本次测评中你的「' + CONSTITUTIONS[secondKey].name +
            '」特征也较为明显，中医称为兼夹体质。实际调理需要医师综合判断主次，' +
            '通常先调主证、兼顾兼证，切忌自行同时进补。';
        body.appendChild(p2);
    }

    // 切换显示
    getElement('quiz-stage').style.display = 'none';
    var resultBox = getElement('quiz-result');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- 10. 重新测评 ---------- */
function restart() {
    currentIndex = 0;
    answers = [];
    initScores();

    getElement('quiz-result').style.display = 'none';
    getElement('quiz-stage').style.display = 'block';

    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- 启动 ---------- */
document.addEventListener('DOMContentLoaded', function () {
    initScores();

    getElement('next-btn').addEventListener('click', goNext);
    getElement('prev-btn').addEventListener('click', goPrev);
    getElement('restart-btn').addEventListener('click', restart);

    renderQuestion();
});
