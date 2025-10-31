// تحديد اللغة الحالية (عربية أو إنجليزية) من localStorage أو افتراضية 'ar'
let lang = localStorage.getItem('lang') || 'ar';

// ترجمة عناوين الأزرار والنصوص للغتين
const ui = {
  ar: { next: "التالي", prev: "السابق", finish: "إنهاء", madeBy: "صُنع بواسطة حسن هادي" },
  en: { next: "Next", prev: "Previous", finish: "Finish", madeBy: "Made by Hassan Hadi" }
};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const loadingDiv = document.getElementById('loading');
  const testContainer = document.getElementById('test-container');
  const credits = document.getElementById('credits');
  // تعريب/ترجمة التذييل والأزرار
  credits.textContent = ui[lang].madeBy;
  document.getElementById('next-btn').textContent = ui[lang].next;
  document.getElementById('prev-btn').textContent = ui[lang].prev;

  // Fetch الأسئلة
  fetch('questions.json')
    .then(res => res.json())
    .then(questions => {
      // إخفاء شاشة التحميل بعد 3 ثوانٍ
      setTimeout(() => {
        loadingDiv.style.display = 'none';
        testContainer.style.display = 'block';
      }, 3000);

      let currentIndex = 0;
      const answers = new Array(questions.length).fill(null);

      // عناصر DOM
      const questionText = document.getElementById('question-text');
      const optionsContainer = document.getElementById('options-container');
      const nextBtn = document.getElementById('next-btn');
      const prevBtn = document.getElementById('prev-btn');
      const progress = document.getElementById('progress');

      // عرض سؤال بناءً على المؤشر
      function showQuestion(index) {
        const q = questions[index];
        questionText.textContent = lang === 'ar' ? q.question_ar : q.question_en;

        // إنشاء الخيارات
        optionsContainer.innerHTML = '';
        const opts = lang === 'ar' ? q.options_ar : q.options_en;
        opts.forEach((txt, i) => {
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = `q${index}`;
          input.id = `q${index}_${i}`;
          input.value = i;
          if (answers[index] === i) input.checked = true;

          const label = document.createElement('label');
          label.htmlFor = input.id;
          label.textContent = txt;

          optionsContainer.appendChild(input);
          optionsContainer.appendChild(label);
        });

        // تحديث عداد الأسئلة
        progress.textContent = `${index + 1} / ${questions.length}`;

        // زر السابق
        prevBtn.disabled = (index === 0);

        // زر التالي أو إنهاء
        nextBtn.textContent = (index === questions.length - 1) ? ui[lang].finish : ui[lang].next;
        nextBtn.disabled = (answers[index] === null);

        // عند اختيار إجابة
        document.querySelectorAll(`input[name="q${index}"]`).forEach(inp => {
          inp.addEventListener('change', e => {
            answers[index] = Number(e.target.value);
            nextBtn.disabled = false;
          });
        });
      }

      // عرض أول سؤال
      showQuestion(0);

      // التالي/إنهاء
      nextBtn.addEventListener('click', () => {
        // إذا كنا في آخر سؤال -> احسب النتيجة
        if (currentIndex === questions.length - 1) {
          // حساب الدرجات لكل بعد: E/I, S/N, T/F, J/P
          const scores = { E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0 };
          questions.forEach((q, idx) => {
            const ans = answers[idx];
            if (ans === null) return;
            const first = q.dimension[0];
            const second = q.dimension[1];
            // 0 و 1 = تتجه للأول (قيمة +2، +1)
            // 2 و 3 = تتجه للثاني (قيمة +1، +2)
            if (ans <= 1) scores[first] += (ans === 0 ? 2 : 1);
            else scores[second] += (ans === 3 ? 2 : 1);
          });
          // تحديد نوع الشخصية بناءً على أعلى قيمة في كل بعد
          const type = [
            scores.E >= scores.I ? 'E' : 'I',
            scores.S >= scores.N ? 'S' : 'N',
            scores.T >= scores.F ? 'T' : 'F',
            scores.J >= scores.P ? 'J' : 'P'
          ].join('');
          // حفظ النتيجة للتصنيف في localStorage
          localStorage.setItem('type', type);
          localStorage.setItem('scores', JSON.stringify(scores));
          // الانتقال لصفحة النتيجة
          window.location.href = 'result.html';
          return;
        }
        // انتقل للسؤال التالي
        currentIndex++;
        showQuestion(currentIndex);
      });

      // السابق
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          showQuestion(currentIndex);
        }
      });
    })
    .catch(err => {
      console.error('Error loading questions.json:', err);
      loadingDiv.style.display = 'none';
      testContainer.style.display = 'block';
      document.getElementById('question-text').textContent = 'حدث خطأ أثناء تحميل الأسئلة.';
    });
});
