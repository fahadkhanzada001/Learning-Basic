$(document).ready(function () {
  const API_URL =
    "https://opentdb.com/api.php?amount=15&category=18&type=multiple";
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let selectedAnswer = null;
  let timer;
  let timeLeft = 20;
  let strike = 0;

  // Selectors
  const $quizContent = $("#quizContent");
  const $nextBtn = $("#nextBtn");
  const $resultBox = $("#result");
  const $progressFill = $(".progress-fill");
  const $timer = $("#time");
  const $report = $("#report");
  const $statusBar = $("#statusBar");

  //  Update Status Bar (Score + Strike + Timer)
  function updateStatus() {
    $statusBar.html(`
      <div class="stat"> Score: <span>${score}</span></div>
      <div class="stat"> Strike: <span>${strike}</span></div>
      <div class="stat"> Time: <span id="time">${timeLeft}</span>s</div>
    `);
  }
  // Timer Function
  function startTimer() {
    clearInterval(timer);
    timeLeft = 20;
    updateStatus();

    timer = setInterval(() => {
      timeLeft--;
      updateStatus();
      if (timeLeft <= 0) {
        console.log(" Time finished!");
        clearInterval(timer);
        checkAnswer(null);
        console.log(" moving to next questions due to timeout")
      }
    }, 1000);
  }

  // Load Quiz Function
  function loadQuiz() {
    console.log(" Fetching quiz from API");
    $.getJSON(API_URL)
      .done(function (data) {
        console.log(" Quiz data loaded", data);
        questions = data.results;
        currentIndex = 0;
        score = 0;
        strike = 0;
        $nextBtn.show().prop("disabled", true);
        $resultBox.empty();
        $report.empty();
        showQuestion();
      })
      .fail(function () {
        console.error(" Error loading quiz");
        $quizContent.html("<p>Error loading quiz. Try again.</p>");
      });
  }

  // Show Question Function
  function showQuestion() {
    if (currentIndex >= questions.length) {
      console.log(" All questions finished");
      showResult();
      return;
    }
    const q = questions[currentIndex];
    console.log(` Question ${currentIndex + 1}:`, q.question);
    console.log(" Correct Answer: ", q.correct_answer);
    let options = [...q.incorrect_answers, q.correct_answer];
    options.sort(() => Math.random() - 0.5);

    let html = `
      <div class="meta"> Category: ${q.category} |  Difficulty: ${q.difficulty}</div>
      <div class="question">${q.question}</div>
      <ul class="options">`;

    options.forEach((opt) => {
      html += `<li><label><input type="radio" name="option" value="${opt}"> ${opt}</label></li>`;
    });
    html += `</ul>`;

    $quizContent.hide().html(html).fadeIn(400);

    selectedAnswer = null;
    $nextBtn.prop("disabled", true);

    updateProgress();
    startTimer();

    $("input[name=option]").on("change", function () {
      selectedAnswer = $(this).val();
      console.log(" Selected answer:", selectedAnswer);
      $nextBtn.prop("disabled", false);
    });

    $(".options li").on("click", function () {
      $(this).find("input[type=radio]").prop("checked", true).trigger("change");
    });
  }

  // Update Progress Function
  function updateProgress() {
    const progress = (currentIndex / questions.length) * 100;
    console.log(` Progress: ${progress.toFixed(2)}%`);
    $progressFill.css("width", progress + "%");
  }

  // Check Answer Function
  function checkAnswer(answer) {
    clearInterval(timer);

    const correct = questions[currentIndex].correct_answer;
    let chosen = answer || "No Answer";

    console.log(
      ` Q${currentIndex + 1} | Correct: ${correct} | Chosen: ${chosen}`
    );

    if (chosen === correct) {
      score++;
      strike++;
      console.log(" Correct Answer! Score:", score, " Strike:", strike);
    } else {
      strike = 0; //  strike reset
      console.log(" Wrong Answer! Score:", score, " Strike reset!");
    }

    updateStatus();

    $(".options li").each(function () {
      let opt = $(this).find("input").val();
      if (opt === correct) $(this).addClass("correct");
      else if (opt === chosen && chosen !== correct) $(this).addClass("wrong");
    });

    $report.append(`<p>Q${
      currentIndex + 1
    }: ${questions[currentIndex].question}<br>
           Correct: ${correct} <br>
           Your Answer: ${chosen}</p>`);
    $nextBtn.prop("disabled", true);

    setTimeout(() => {
      currentIndex++;
      showQuestion();
    }, 1500);
  }

  // Next Button Event
  $nextBtn.on("click", function () {
    if (selectedAnswer === null) {
      alert("Please select an answer!");
      console.log(" Next clicked without selecting an answer");
      return console.log(" Proceeding to next question");
    }
    checkAnswer(selectedAnswer);
  });

  // Show Result Function
  function showResult() {
    console.log(" Quiz Completed. Final Score:", score);
    $quizContent.html("");
    $nextBtn.hide();
    $progressFill.css("width", "100%");
    $resultBox.html(
      `<h2> Quiz Completed! <br>  Your Score: ${score} / ${questions.length} <br>
           <button id="restartBtn" class="btn"> Restart Quiz</button> </h2>`
    );

    $("#restartBtn").on("click", function () {
      console.log(" Restarting Quiz...");
      loadQuiz();
    });
  }
  $("#themeToggle").on("click", function () {
    $("body").toggleClass("dark");

    if ($("body").hasClass("dark")) {
      $(this).text(" Light Mode");
    } else {
      $(this).text(" Dark Mode");
    }
  });

  loadQuiz();
});


