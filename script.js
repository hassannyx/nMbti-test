// Data and language handling
let lang = localStorage.getItem('lang') || 'ar';
const texts = {
  en: {
    siteName: "MBTI Personality Test",
    description: "Take this 16 Personalities (MBTI) test to discover your type.",
    startTest: "Start Test",
    next: "Next",
    prev: "Previous",
    finish: "Finish",
    loading: "Loading your result...",
    result: "Your Result",
    famous: "Famous personalities with this type:",
    chart: "Your personality breakdown:",
    madeBy: "Made by Hassan Hadi"
  },
  ar: {
    siteName: "اختبار MBTI للشخصية",
    description: "خض هذا الاختبار لتحديد نمط شخصيتك (16 شخصية).",
    startTest: "ابدأ الاختبار",
    next: "التالي",
    prev: "السابق",
    finish: "إنهاء",
    loading: "جاري تحضير النتيجة...",
    result: "نتيجتك",
    famous: "5 شخصيات مشهورة من هذا النمط:",
    chart: "تفاصيل نمط شخصيتك:",
    madeBy: "صُنع بواسطة حسن هادي"
  }
};
// Apply text content based on current language
document.addEventListener('DOMContentLoaded', () => {
  // Common elements
  const siteNameElem = document.getElementById('site-name');
  const creditsElem = document.getElementById('credits');
  if(siteNameElem) siteNameElem.textContent = texts[lang].siteName;
  if(creditsElem) creditsElem.textContent = texts[lang].madeBy;
  // Page-specific elements
  const startBtn = document.getElementById('start-btn');
  const descElem = document.getElementById('description');
  const loadingText = document.getElementById('loading-text');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const progressElem = document.getElementById('progress');
  if(descElem) descElem.textContent = texts[lang].description;
  if(startBtn) {
    startBtn.textContent = texts[lang].startTest;
    startBtn.addEventListener('click', () => {
      // Start test
      window.location.href = 'test.html';
    });
  }
  if(nextBtn) nextBtn.textContent = texts[lang].next;
  if(prevBtn) prevBtn.textContent = texts[lang].prev;
  if(loadingText) loadingText.textContent = texts[lang].loading;
  // Page logic
  if(document.body.classList.contains('test-page')) {
    // Test page
    fetch('questions.json')
      .then(res => res.json())
      .then(questions => {
        let currentIndex = 0;
        const totalQuestions = questions.length;
        const userAnswers = new Array(totalQuestions).fill(null);
        // UI references
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const nextButton = document.getElementById('next-btn');
        const prevButton = document.getElementById('prev-btn');
        const progressText = document.getElementById('progress');
        // Render a question
        function showQuestion(index) {
          const q = questions[index];
          // Set question text
          questionText.textContent = lang === 'ar' ? q.question_ar : q.question_en;
          // Render options
          optionsContainer.innerHTML = '';
          q.options_en.forEach((opt, j) => {
            const optionText = lang === 'ar' ? q.options_ar[j] : q.options_en[j];
            const optionId = `q${index}_${j}`;
            // Radio input
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q${index}`;
            input.id = optionId;
            input.value = j;
            if(userAnswers[index] === j) input.checked = true;
            // Label
            const label = document.createElement('label');
            label.htmlFor = optionId;
            label.textContent = optionText;
            // Append to container
            optionsContainer.appendChild(input);
            optionsContainer.appendChild(label);
          });
          // Update progress
          const qWord = lang === 'ar' ? 'السؤال' : 'Question';
          progressText.textContent = `${qWord} ${index+1} ${lang==='ar' ? 'من' : 'of'} ${totalQuestions}`;
          // Update buttons
          prevButton.disabled = (index === 0);
          nextButton.textContent = (index === totalQuestions - 1) ? texts[lang].finish : texts[lang].next;
          nextButton.disabled = (userAnswers[index] === null);
          // Enable Next on selection
          document.querySelectorAll(`input[name="q${index}"]`).forEach(inputElem => {
            inputElem.addEventListener('change', () => {
              userAnswers[index] = Number(inputElem.value);
              nextButton.disabled = false;
            });
          });
        }
        // Initial question
        showQuestion(0);
        // Next button handler
        nextButton.addEventListener('click', () => {
          if(currentIndex < totalQuestions - 1) {
            currentIndex++;
            showQuestion(currentIndex);
          } else {
            // Finish test
            const scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
            questions.forEach((q, idx) => {
              const answer = userAnswers[idx];
              if(answer === null) return;
              const dim = q.dimension;
              const firstLetter = dim.charAt(0);
              const secondLetter = dim.charAt(1);
              if(answer <= 1) {
                scores[firstLetter] += (answer === 0 ? 2 : 1);
              } else if(answer >= 2) {
                scores[secondLetter] += (answer === 3 ? 2 : 1);
              }
            });
            const typeLetters = [];
            typeLetters.push(scores.E >= scores.I ? 'E' : 'I');
            typeLetters.push(scores.S >= scores.N ? 'S' : 'N');
            typeLetters.push(scores.T >= scores.F ? 'T' : 'F');
            typeLetters.push(scores.J >= scores.P ? 'J' : 'P');
            const resultType = typeLetters.join('');
            localStorage.setItem('type', resultType);
            localStorage.setItem('scores', JSON.stringify(scores));
            window.location.href = 'result.html';
          }
        });
        // Prev button handler
        prevButton.addEventListener('click', () => {
          if(currentIndex > 0) {
            currentIndex--;
            showQuestion(currentIndex);
          }
        });
      });
  }
  else if(document.body.classList.contains('result-page')) {
    // Result page
    const typeCode = localStorage.getItem('type');
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    if(!typeCode || !scores) {
      window.location.href = 'index.html';
      return;
    }
    const resultTypeElem = document.getElementById('result-type');
    const resultNameElem = document.getElementById('result-name');
    const resultDescElem = document.getElementById('result-description');
    const famousTitleElem = document.getElementById('famous-title');
    const famousListElem = document.getElementById('famous-list');
    const chartTitleElem = document.getElementById('chart-title');
    resultTypeElem.textContent = typeCode;
    fetch('types.json')
      .then(res => res.json())
      .then(typesData => {
        const typeInfo = typesData.find(t => t.code === typeCode);
        if(typeInfo) {
          resultNameElem.textContent = lang === 'ar' ? typeInfo.name_ar : typeInfo.name_en;
          resultDescElem.textContent = lang === 'ar' ? typeInfo.description_ar : typeInfo.description_en;
          famousTitleElem.textContent = texts[lang].famous;
          chartTitleElem.textContent = texts[lang].chart;
          const celebs = (lang === 'ar' && typeInfo.celebrities_ar.length) ? typeInfo.celebrities_ar : typeInfo.celebrities_en;
          celebs.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            famousListElem.appendChild(li);
          });
          const chartContainer = document.getElementById('chart');
          const axes = [
            { pair: 'EI', first: 'E', second: 'I' },
            { pair: 'SN', first: 'S', second: 'N' },
            { pair: 'TF', first: 'T', second: 'F' },
            { pair: 'JP', first: 'J', second: 'P' }
          ];
          axes.forEach(axis => {
            const firstScore = scores[axis.first] || 0;
            const secondScore = scores[axis.second] || 0;
            const total = firstScore + secondScore;
            const firstPercent = total ? Math.round((firstScore / total) * 100) : 0;
            const secondPercent = 100 - firstPercent;
            const axisDiv = document.createElement('div');
            axisDiv.className = 'axis';
            const labelDiv = document.createElement('div');
            labelDiv.className = 'axis-label';
            labelDiv.textContent = `${axis.first} / ${axis.second}`;
            const barDiv = document.createElement('div');
            barDiv.className = 'bar';
            const fillFirst = document.createElement('div');
            fillFirst.className = 'fill-first';
            fillFirst.style.width = firstPercent + '%';
            const fillSecond = document.createElement('div');
            fillSecond.className = 'fill-second';
            fillSecond.style.width = secondPercent + '%';
            barDiv.appendChild(fillFirst);
            barDiv.appendChild(fillSecond);
            const valuesDiv = document.createElement('div');
            valuesDiv.className = 'axis-values';
            valuesDiv.textContent = `${axis.first}: ${firstPercent}% | ${axis.second}: ${secondPercent}%`;
            axisDiv.appendChild(labelDiv);
            axisDiv.appendChild(barDiv);
            axisDiv.appendChild(valuesDiv);
            chartContainer.appendChild(axisDiv);
          });
          const loadingDiv = document.getElementById('loading');
          const resultContentDiv = document.getElementById('result-content');
          setTimeout(() => {
            if(loadingDiv) loadingDiv.style.display = 'none';
            if(resultContentDiv) resultContentDiv.style.display = 'block';
          }, 3000);
        }
      });
  }
});
