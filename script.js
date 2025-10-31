// تحديد اللغة من التخزين المحلي أو افتراض العربية
let lang = localStorage.getItem('lang') || 'ar';

// النصوص المستخدمة في الموقع
const texts = {
  ar: {
    next: "التالي",
    prev: "السابق",
    finish: "إنهاء",
    madeBy: "صُنع بواسطة حسن هادي",
  },
  en: {
    next: "Next",
    prev: "Previous",
    finish: "Finish",
    madeBy: "Made by Hassan Hadi",
  }
};

// تطبيق اللغة على العناصر
document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const creditsElem = document.getElementById('credits');

  if (nextBtn) nextBtn.textContent = texts[lang].next;
  if (prevBtn) prevBtn.textContent = texts[lang].prev;
  if (creditsElem) creditsElem.textContent = texts[lang].madeBy;

  const loadingDiv = document.getElementById('loading');
  const testContainer = document.getElementById('test-container');

  // تحميل الأسئلة من ملف JSON
  fetch('questions.json')
    .then(res => res.json())
    .then(questions => {
      // إخفاء شاشة التحميل بعد 2.5 ثانية
      setTimeout(() => {
        loadingDiv.style.display = 'none';
        testContainer.style.display = 'block';
      }, 2500);

      let currentIndex = 0;
      const totalQuestions = questions.length;
      const userAnswers = new Array(totalQuestions).fill(null);

      const questionText = document.getElementById('question-text');
      const optionsContainer = document.getElementById('options-container');
      const nextButton = document.getElementById('next-btn');
      const prevButton = document.getElementById('prev-btn');
      const progressText = document.getElementById('progress');

      function showQuestion(index) {
        const q = questions[index];
        questionText.textContent = lang === 'ar' ? q.question_ar : q.question_en;
        optionsContainer.innerHTML = '';

        const options = lang === 'ar' ? q.options_ar : q.options_en;
        options.forEach((option, j) => {
          const input = document.createElement('input');
          input.type = 'radio';
          input.id = `q${index}_${j}`;
          input.name = `q${index}`;
          input.value = j;
          if (userAnswers[index] === j) input.checked = true;

          const label = document.createElement('label');
          label.htmlFor = input.id;
          label.textContent = option;

          optionsContainer.appendChild(input);
          optionsContainer.appendChild(label);
        });

        progressText.textContent = `${index + 1} / ${totalQuestions}`;
        prevButton.disabled = index === 0;
        nextButton.textContent = index === totalQuestions - 1 ? texts[lang].finish : texts[lang].next;
        nextButton.disabled = userAnswers[index] === null;

        document.querySelectorAll(`input[name="q${index}"]`).forEach(input => {
          input.addEventListener('change', () => {
            userAnswers[index] = Number(input.value);
            nextButton.disabled = false;
          });
        });
      }

      showQuestion(0);

      nextButton.addEventListener('click', () => {
        if (currentIndex < totalQuestions - 1) {
          currentIndex++;
          showQuestion(currentIndex);
        } else {
          // حساب النتائج
          const scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
          questions.forEach((q, idx) => {
            const ans = userAnswers[idx];
            if (ans === null) return;
            const dim = q.dimension;
            const first = dim[0];
            const second = dim[1];
            if (ans <= 1) scores[first] += (ans === 0 ? 2 : 1);
            else scores[second] += (ans === 3 ? 2 : 1);
          });
          const resultType = [
            scores.E >= scores.I ? 'E' : 'I',
            scores.S >= scores.N ? 'S' : 'N',
            scores.T >= scores.F ? 'T' : 'F',
            scores.J >= scores.P ? 'J' : 'P'
          ].join('');
          localStorage.setItem('type', resultType);
          localStorage.setItem('scores', JSON.stringify(scores));
          window.location.href = 'result.html';
        }
      });

      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          showQuestion(currentIndex);
        }
      });
    })
    .catch(err => {
      console.error("Error loading questions:", err);
      document.getElementById('question-text').textContent = "حدث خطأ أثناء تحميل الأسئلة.";
      loadingDiv.style.display = 'none';
      testContainer.style.display = 'block';
    });
});
