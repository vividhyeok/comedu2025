document.addEventListener('DOMContentLoaded', () => {
    checkURLParams();
});

const questions = [
    // 1. 이론(CS)
    { text: "문제 해결을 위해 규칙을 찾고 논리적으로 생각하는 것을 즐긴다.", category: "cs" },
    { text: "컴퓨터나 스마트폰이 어떤 원리로 작동하는지 궁금했던 적이 있다.", category: "cs" },
    { text: "복잡한 문제를 단계별로 나누어 분석하는 것을 선호한다.", category: "cs" },
    { text: "원리를 이해하기보다는, 주어진 공식을 그대로 암기하는 것이 편하다.", category: "cs", isNegative: true },
    // 2. 개발
    { text: "새로운 아이디어를 직접 만들어보고, 결과물이 눈에 보이는 것을 좋아한다.", category: "dev" },
    { text: "레고나 블록 코딩처럼, 조각을 조립해 새로운 것을 만드는 활동을 즐긴다.", category: "dev" },
    { text: "오류가 발생했을 때, 원인을 끈질기게 찾아 해결하는 과정에서 성취감을 느낀다.", category: "dev" },
    { text: "정해진 절차나 설명서 없이, 스스로 무언가를 만드는 것은 부담스럽다.", category: "dev", isNegative: true },
    // 3. 교육
    { text: "내가 아는 것을 다른 사람에게 쉽고 재미있게 설명해주는 것을 좋아한다.", category: "edu" },
    { text: "다른 사람이 어려움을 겪을 때, 먼저 다가가 도와주고 싶다는 생각이 든다.", category: "edu" },
    { text: "어떻게 하면 더 효과적으로 정보를 전달할 수 있을지 고민하는 편이다.", category: "edu" },
    { text: "내가 아는 것을 다른 사람에게 설명하는 것은 귀찮고 번거롭다.", category: "edu", isNegative: true },
    // 4. 응용
    { text: "인공지능(AI), 가상현실(VR) 등 최신 기술을 일상생활에 어떻게 활용할 수 있을지 상상해본다.", category: "app" },
    { text: "게임, 영상, 음악 등 미디어 콘텐츠를 즐길 뿐만 아니라, 직접 만들어보고 싶다는 생각을 해본 적이 있다.", category: "app" },
    { text: "손동작이나 목소리로 컴퓨터를 제어하는 것처럼, 새로운 방식의 상호작용에 흥미를 느낀다.", category: "app" },
    { text: "새로운 기술이나 앱이 나와도, 익숙한 것만 계속 사용하는 것을 선호한다.", category: "app", isNegative: true }
];

let shuffledQuestions = [];
let currentQuestionIndex = 0;
const scores = { cs: 0, dev: 0, edu: 0, app: 0 };
const MAX_SCORE_PER_CATEGORY = 4;
let userName = '';

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const nameInput = document.getElementById('name-input');
const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const progressEl = document.getElementById('progress');

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startQuiz() {
    userName = nameInput.value.trim();
    if (!userName) {
        alert('이름을 입력해주세요!');
        return;
    }

    currentQuestionIndex = 0;
    Object.keys(scores).forEach(key => { scores[key] = 0; });
    shuffledQuestions = shuffle([...questions]);

    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    displayQuestion();
}

function restartQuiz() {
    window.location.href = window.location.pathname;
}

function displayQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length) {
        const question = shuffledQuestions[currentQuestionIndex];
        questionNumberEl.textContent = `Q${currentQuestionIndex + 1}.`;
        questionTextEl.textContent = question.text;
        progressEl.style.width = `${((currentQuestionIndex) / shuffledQuestions.length) * 100}%`;
    } else {
        showResults();
    }
}

function handleAnswer(isYes) {
    const question = shuffledQuestions[currentQuestionIndex];
    const category = question.category;
    const isNegative = question.isNegative || false;

    if (isYes !== isNegative) {
        scores[category]++;
    }
    currentQuestionIndex++;
    displayQuestion();
}

async function showResults(sharedResult = null) {
    quizScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    progressEl.style.width = '100%';

    const resultsData = await fetch('results.json').then(res => res.json());

    let resultType;
    let percentages;
    let currentUrl;
    let ceSuitability;

    if (sharedResult) {
        userName = sharedResult.name;
        resultType = sharedResult.type;
        percentages = sharedResult.scores;
        ceSuitability = sharedResult.ceSuitability;
        currentUrl = window.location.href;
    } else {
        percentages = {};
        Object.keys(scores).forEach(key => {
            percentages[key] = (scores[key] / MAX_SCORE_PER_CATEGORY) * 100;
        });
        const sortedResults = Object.entries(percentages).sort(([, a], [, b]) => b - a);
        resultType = `${sortedResults[0][0]}-${sortedResults[1][0]}`;
        
        const rawCeSuitability = Math.round(((scores.cs + scores.edu) / (MAX_SCORE_PER_CATEGORY * 2)) * 100);
        ceSuitability = Math.round((rawCeSuitability / 100) * 50 + 50); // 50% ~ 100% 범위로 조정
        
        const scoreParams = new URLSearchParams(percentages).toString();
        const newUrl = `${window.location.pathname}?name=${encodeURIComponent(userName)}&type=${resultType}&ce=${ceSuitability}&${scoreParams}`;
        history.pushState({}, '', newUrl);
        currentUrl = window.location.href;
    }

    const resultDetails = resultsData[resultType];
    const categoryNames = { cs: "이론(CS)", dev: "개발", edu: "교육", app: "응용" };
    const categoryDescriptions = {
        cs: "🕹️ 논리게이트 보드게임으로 컴퓨터의 작동 원리를 논리적으로 파악하고, 문제 해결을 위한 알고리즘적 사고를 즐기는 분야입니다.",
        dev: "🕹️ Blockly 미로 게임으로 아이디어를 현실로 구현하는 실용적인 분야입니다. 블록 코딩을 통해 논리적 사고를 기르며 성취감을 느낍니다.",
        edu: "🕹️ 금지어 피해서 설명 게임으로 자신의 지식을 다른 사람과 나누고, 효과적인 정보 전달 방법을 익히는 분야입니다.",
        app: "🕹️ Teachable Machine으로 최신 AI 기술을 직접 체험하며 다양한 분야에 융합하여 새로운 가치를 창출하는 분야입니다."
    };

    const [firstCat, secondCat] = resultType.split('-');

    document.getElementById('result-title').innerHTML = `<span class="highlight">${userName}</span>님의 전공 적성 분석 결과`;
    document.getElementById('result-type-name').textContent = `\"${resultDetails.typeName}\"`;
    document.getElementById('result-description').textContent = resultDetails.description;

    document.getElementById('ce-percentage').textContent = ceSuitability;

    document.getElementById('result-summary-text').innerHTML = 
        `<strong>${userName}</strong>님은 <strong>${categoryNames[firstCat]}</strong> 분야에 가장 큰 흥미를 보이며, <strong>${categoryNames[secondCat]}</strong> 분야에도 높은 잠재력을 가지고 있습니다. <br><br>이는 1순위 특성을 중심으로 2순위 특성을 융합할 때 시너지를 낼 수 있다는 의미입니다. 아래에서 각 분야의 특징을 자세히 살펴보세요.`

    document.getElementById('first-major-name').textContent = categoryNames[firstCat];
    document.getElementById('first-major-description').textContent = categoryDescriptions[firstCat];
    document.getElementById('first-major-activity').innerHTML = resultDetails.activities[firstCat];
    document.getElementById('first-major-recommend').textContent = resultDetails.recommendations[firstCat].join(', ');

    document.getElementById('second-major-name').textContent = categoryNames[secondCat];
    document.getElementById('second-major-description').textContent = categoryDescriptions[secondCat];
    document.getElementById('second-major-activity').innerHTML = resultDetails.activities[secondCat];
    document.getElementById('second-major-recommend').textContent = resultDetails.recommendations[secondCat].join(', ');

    createChart(percentages, categoryNames);
    generateQRCode(currentUrl);
}

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const type = params.get('type');
    const cs = params.get('cs');
    const ceSuitability = params.get('ce');

    if (name && type && cs !== null && ceSuitability !== null) {
        const sharedScores = {
            cs: parseFloat(cs),
            dev: parseFloat(params.get('dev')),
            edu: parseFloat(params.get('edu')),
            app: parseFloat(params.get('app'))
        };
        showResults({ name: decodeURIComponent(name), type, scores: sharedScores, ceSuitability: parseInt(ceSuitability) });
    }
}

function generateQRCode(url) {
    const qrCanvas = document.getElementById('qrcode');
    QRCode.toCanvas(qrCanvas, url, { width: 180, margin: 2 }, function (error) {
        if (error) console.error(error);
    });
}

let chartInstance;
function createChart(percentages, categoryNames) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    
    const data = {
        labels: Object.values(categoryNames),
        datasets: [{
            data: Object.values(percentages),
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)'
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    };

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.toFixed(0)}%`;
                        }
                    }
                }
            }
        }
    });
}