// Define the AudioController class
class AudioController {
  constructor() {
    this.bgMusic = new Audio('Assets/Audio/bg-music.wav');
    this.flipSound = new Audio('Assets/Audio/flip.wav');
    this.matchSound = new Audio('Assets/Audio/match.wav');
    this.victorySound = new Audio('Assets/Audio/victory.wav');
    this.gameOverSound = new Audio('Assets/Audio/gameOver.wav');
    this.bgMusic.volume = 0.5;
    this.bgMusic.loop = true;
  }
  startMusic() {
    this.bgMusic.play();
  }
  stopMusic() {
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }
  flip() {
    this.flipSound.play();
  }
  match() {
    this.matchSound.play();
  }
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

(function($) {
  var audioController = new AudioController();

  /************ Start hard coded settings ******************/

  // How long a non matching card is displayed once clicked.
  var nonMatchingCardTime = 1000;

  // Shuffle card images: How many different images are available to shuffle
  // from?
  var imagesAvailable = 30;

  /************ End hard coded settings ******************/

  // Handle clicking on settings icon
  var settings = document.getElementById('memory--settings-icon');
  var modal = document.getElementById('memory--settings-modal');
  var handleOpenSettings = function (event) {
    event.preventDefault();
    modal.classList.toggle('show');
  };
  settings.addEventListener('click', handleOpenSettings);

  // Handle settings form submission
  var reset = document.getElementById('memory--settings-reset');
  var handleSettingsSubmission = function (event) {
    event.preventDefault();
    
    countdownTimer = startCountdown(0, true);

    var selectWidget = document.getElementById("memory--settings-grid").valueOf();
    var grid = selectWidget.options[selectWidget.selectedIndex].value;
    var gridValues = grid.split('x');
    var cards = $.initialize(Number(gridValues[0]), Number(gridValues[1]), imagesAvailable);

    if (cards) {
      document.getElementById('memory--settings-modal').classList.remove('show');
      document.getElementById('memory--end-game-modal').classList.remove('show');
      document.getElementById('memory--end-game-message').innerText = "";
      document.getElementById('memory--end-game-score').innerText = "";
      buildLayout($.cards, $.settings.rows, $.settings.columns);
 
      // Flip all cards before starting the game
      flipAllCardsAndFreeze(cards.length);

      audioController.startMusic(); // Add background music
    }

  };
  reset.addEventListener('click', handleSettingsSubmission);

  // Function to flip all cards and freeze them for 20 seconds
  function flipAllCardsAndFreeze(cards) {
    var cards = document.querySelectorAll('.flip-container');
    var flipDuration = 150; // Duration (in milliseconds) for flipping each card
    var freezeDurationPerCard = 3000; // Duration (in milliseconds) for freezing each card
    var totalFlipTime = cards.length * flipDuration; // Total time required for flipping all cards

    
    // Flip all cards
    cards.forEach(function (card, index) {
      setTimeout(function () {
        card.classList.toggle('clicked');
        audioController.flip(); // Play flip sound
      }, index * flipDuration); // Delay between flipping each card (adjust the delay as needed)
    });

    // Freeze the cards
    setTimeout(function () {
      // Freeze the cards by removing the click event listener
      cards.forEach(function (card) {
        card.removeEventListener('click', handleFlipCard);
      });

      // After freezing, flip the cards back to their normal state
      setTimeout(function () {
        cards.forEach(function (card) {
          card.classList.toggle('clicked');
          card.addEventListener('click', handleFlipCard);
          
          // After freezing, start the countdown timer
          countdownTimer = startCountdown(countdownDuration);
        });
      }, freezeDurationPerCard); // Adjust the delay as needed to control how long the cards stay frozen
    }, totalFlipTime);
  }

  var countdownTimer;
  var countdownDuration = 20; // Set the countdown duration in seconds
  var countdownInterval;

  function startCountdown(duration, isButtonClicked) {
    var timer = duration;
    var countdownElement = document.getElementById('countdown'); // Replace 'countdown' with the ID of your countdown display element

    if (isButtonClicked) {
      clearInterval(countdownInterval);
      countdownInterval = null; // Set the interval variable to null to indicate that it's stopped
    } else {
      if (countdownInterval === null) { // Check if the timer is not already running
        countdownInterval = setInterval(function () {
          countdownElement.textContent = timer + 's';

          if (timer <= 0) {
            clearInterval(countdownInterval);
            // Check if the game is over
            if (!$.isGameOver) {
              $.isGameOver = true;
              var message = getEndGameMessage(); // Call a function to handle the game over state
              document.getElementById('memory--end-game-message').textContent = message;
              document.getElementById("memory--end-game-modal").classList.toggle('show');
            }
          }

          timer--;
        }, 1000); // Update the countdown every 1 second (1000 milliseconds)
      }
    }
  }

  // Handle clicking on card
  var handleFlipCard = function (event) {

    event.preventDefault();

    var status = $.play(this.index);
    console.log(status);

    if (status.code != 0 ) {
      this.classList.toggle('clicked');
      audioController.flip(); // Play flip sound
    }

    if (status.code == 2 ) {
      audioController.match(); // Play match sound
    }

    if (status.code == 3 ) {
      setTimeout(function () {
        var childNodes = document.getElementById('memory--cards').childNodes;
        childNodes[status.args[0]].classList.remove('clicked');
        childNodes[status.args[1]].classList.remove('clicked');
      }.bind(status), nonMatchingCardTime);
    }
    else if (status.code == 4) {
      var score = parseInt((($.attempts - $.mistakes) / $.attempts) * 100, 10);
      var message = getEndGameMessage(score);

      document.getElementById('memory--end-game-message').textContent = message;
      document.getElementById('memory--end-game-score').textContent =
          'Score: ' + score + ' / 100';

      document.getElementById("memory--end-game-modal").classList.toggle('show');
    }

  };

  var getEndGameMessage = function(score) {
    var message = "";

    if (score == 100) {
      message = "Amazing job!"
      audioController.victory();
    }
    else if (score >= 70 ) {
      message = "Great job!"
      audioController.victory();
    }
    else if (score >= 50) {
      message = "Great job!"
      audioController.victory();
    }
    else {
      message = "You can do better.";
      audioController.gameOver();
    }

    return message;
  }

  // Build grid of cards
  var buildLayout = function (cards, rows, columns) {
    if (!cards.length) {
      return;
    }

    var memoryCards = document.getElementById("memory--cards");
    var index = 0;

    var cardMaxWidth = document.getElementById('memory--app-container').offsetWidth / columns;
    var cardHeightForMaxWidth = cardMaxWidth * (3 / 4);

    var cardMaxHeight = document.getElementById('memory--app-container').offsetHeight / rows;
    var cardWidthForMaxHeight = cardMaxHeight * (4 / 3);

    // Clean up. Remove all child nodes and card clicking event listeners.
    while (memoryCards.firstChild) {
      memoryCards.firstChild.removeEventListener('click', handleFlipCard);
      memoryCards.removeChild(memoryCards.firstChild);
    }

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        // Use cloneNode(true) otherwise only one node is appended
        memoryCards.appendChild(buildCardNode(index, cards[index],
          (100 / columns) + "%", (100 / rows) + "%"));
        index++;
      }
    }

    // Resize cards to fit in viewport
    if (cardMaxHeight > cardHeightForMaxWidth) {
      // Update height
      memoryCards.style.height = (cardHeightForMaxWidth * rows) + "px";
      memoryCards.style.width = document.getElementById('memory--app-container').offsetWidth + "px";
      memoryCards.style.top = ((cardMaxHeight * rows - (cardHeightForMaxWidth * rows)) / 2) + "px";
    }
    else {
      // Update Width
      memoryCards.style.width = (cardWidthForMaxHeight * columns) + "px";
      memoryCards.style.height = document.getElementById('memory--app-container').offsetHeight + "px";
      memoryCards.style.top = 0;
    }

  };

  // Update on resize
  window.addEventListener('resize', function() {
    buildLayout($.cards, $.settings.rows, $.settings.columns);
  }, true);

  // Build single card
  var buildCardNode = function (index, card, width, height) {
    var flipContainer = document.createElement("li");
    var flipper = document.createElement("div");
    var front = document.createElement("a");
    var back = document.createElement("a");

    flipContainer.index = index;
    flipContainer.style.width = width;
    flipContainer.style.height = height;
    flipContainer.classList.add("flip-container");
    if (card.isRevealed) {
      flipContainer.classList.add("clicked");
    }

    flipper.classList.add("flipper");
    front.classList.add("front");
    front.setAttribute("href", "#");
    back.classList.add("back");
    back.classList.add("card-" + card.value);
    if (card.isMatchingCard) {
      back.classList.add("matching");
    }
    back.setAttribute("href", "#");

    flipper.appendChild(front);
    flipper.appendChild(back);
    flipContainer.appendChild(flipper);

    flipContainer.addEventListener('click', handleFlipCard);

    return flipContainer;
  };

  async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        webcam.srcObject = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
  }
  startWebcam();

})(MemoryGame);
