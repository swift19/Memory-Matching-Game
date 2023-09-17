// Define the AudioController class
class AudioController {
  constructor() {
    // Local only
    // this.bgMusic = new Audio('Assets/Audio/bg-music.mp3');
    // this.flipSound = new Audio('Assets/Audio/flip.wav');
    // this.matchSound = new Audio('Assets/Audio/match.wav');
    // this.victorySound = new Audio('Assets/Audio/victory.wav');
    // this.gameOverSound = new Audio('Assets/Audio/gameOver.wav');

    // From GITHUB PAGES WEBSITE
    // this.bgMusic = new Audio('https://github.com/swift19/Memory-Matching-Game/blob/main/assets/Audio/bg-music.wav');
    // this.flipSound = new Audio('https://github.com/swift19/Memory-Matching-Game/blob/main/assets/Audio/flip.wav');
    // this.matchSound = new Audio('https://github.com/swift19/Memory-Matching-Game/blob/main/assets/Audio/match.wav');
    // this.victorySound = new Audio('https://github.com/swift19/Memory-Matching-Game/blob/main/assets/Audio/victory.wav');
    // this.gameOverSound = new Audio('https://github.com/swift19/Memory-Matching-Game/blob/main/assets/Audio/gameOver.wav');

    this.bgMusic = new Audio('assets/Audio/bg-music.wav');
    this.flipSound = new Audio('assets/Audio/flip.wav');
    this.matchSound = new Audio('assets/Audio/match.wav');
    this.victorySound = new Audio('assets/Audio/victory.wav');
    this.gameOverSound = new Audio('assets/Audio/gameOver.wav');
    
    this.bgMusic.volume = 0.5;
    this.bgMusic.loop = true;
    this.isMuted = false; // Add a property to track mute state
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

  mute() {
    this.isMuted = true;
    this.bgMusic.muted = true;
    this.flipSound.muted = true;
    this.matchSound.muted = true;
    this.victorySound.muted = true;
    this.gameOverSound.muted = true;
  }

  unmute() {
    this.isMuted = false;
    this.bgMusic.muted = false;
    this.flipSound.muted = false;
    this.matchSound.muted = false;
    this.victorySound.muted = false;
    this.gameOverSound.muted = false;
  }
}

(function($) {
  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalVideo = document.getElementById("modal-video");
    const mainContent = document.getElementById("main-content");

    modal.style.display = "block";
    modalVideo.play();

    setTimeout(function () {
      modal.style.display = "none";
      mainContent.style.display = "block";
      modalVideo.pause();
    }, 5000); // 5000 milliseconds (5 seconds)
  });

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
  var defaultDificulty = "2x3";
  var handleSettingsSubmission = function (event) {
    event.preventDefault();

    countdownTimer = startCountdown(0, true);

    // var selectWidget = document.getElementById("memory--settings-grid").valueOf();

    var grid = defaultDificulty;
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

      level = 1;
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
  var countdownDuration = 120; // Set the countdown duration in seconds
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

      // Add the heartbeat animation to the card for 1 second
      this.style.animation = 'heartbeat2 1s';
      setTimeout(function () {
          this.style.animation = ''; // Remove the animation after 1 second
      }.bind(this), 1000);
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
      var levelChecker = level + 1;
      document.getElementById('memory--end-game-message').textContent = levelChecker === 5 ? "Congratulations! You finished the game!" : message;
      document.getElementById('memory--end-game-score').textContent =
          'Score: ' + score + ' / 100';

      document.getElementById("memory--end-game-modal").classList.toggle('show');

      // execute confetti every end of the level
      const confs = document.getElementById("drawing_canvas");
      confs.style.zIndex = "100";
      initDrawingCanvas();
      requestAnimationFrame(loop);

      if (levelChecker < 5){
        if (message !== "You can do better. Restart the game."){
          setTimeout(function() {
            confs.style.zIndex = "0";
            nextLevel();
          }, 5000); 
        }
      }
    }
  };

  let level = 1;
  var gameLevel = ["3x4", "4x5", "5x6", "6x7"];
  var nextLevel = function () {
    level ++;
    console.log(level)
    countdownTimer = startCountdown(0, true);

    var grid = gameLevel[level - 1];
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
    }
  }

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
      message = "You can do better. Please restart the game.";
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

  // Add a variable to keep track of the currently active camera
  let activeCamera = 'user';

  // Function to toggle between user and environment cameras
  function toggleCamera() {
    const video = document.getElementById('webcam');
    const constraints =
      activeCamera === 'user'
        ? { video: { facingMode: 'environment' } }
        : { video: { facingMode: 'user' } };

    // Stop the current stream
    const currentStream = video.srcObject;
    if (currentStream) {
      const tracks = currentStream.getTracks();
      tracks.forEach((track) => track.stop());
    }

    // Get a new stream with the updated constraints
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
        activeCamera = activeCamera === 'user' ? 'environment' : 'user';
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }

  // Add a click event listener to the button
  document.getElementById('toggle-camera').addEventListener('click', toggleCamera);


  var muteButton = document.getElementById('mute-audio');
  muteButton.addEventListener('click', function() {
    // audioController.stopMusic(); // for mobile only
    audioController.mute(); // Mute audio
    muteButton.style.display = 'none'; // Hide the mute button
    unmuteButton.style.display = 'inline-block'; // Show the unmute button
  });

  // Add event listener to the unmute button
  var unmuteButton = document.getElementById('unmute-audio');
  unmuteButton.addEventListener('click', function() {
    // audioController.startMusic(); // for mobile only
    audioController.unmute(); // Unmute audio
    muteButton.style.display = 'inline-block'; // Show the mute button
    unmuteButton.style.display = 'none'; // Hide the unmute button
  });

  async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        webcam.srcObject = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
  }
  startWebcam();

  const TWO_PI = Math.PI * 2;
  const HALF_PI = Math.PI * 0.5;

  // canvas settings
  var viewWidth = 512,
      viewHeight = 350,
      drawingCanvas = document.getElementById("drawing_canvas"),
      ctx,
      timeStep = (1/60);

  Point = function(x, y) {
      this.x = x || 0;
      this.y = y || 0;
  };

  Particle = function(p0, p1, p2, p3) {
      this.p0 = p0;
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;

      this.time = 0;
      this.duration = 3 + Math.random() * 2;
      this.color =  '#' + Math.floor((Math.random() * 0xffffff)).toString(16);
      this.w = 8;
      this.h = 6;

      this.complete = false;
  };

  Particle.prototype = {
      update:function() {
          this.time = Math.min(this.duration, this.time + timeStep);

          var f = Ease.outCubic(this.time, 0, 1, this.duration);
          var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

          var dx = p.x - this.x;
          var dy = p.y - this.y;

          this.r =  Math.atan2(dy, dx) + HALF_PI;
          this.sy = Math.sin(Math.PI * f * 10);
          this.x = p.x;
          this.y = p.y;

          this.complete = this.time === this.duration;
      },
      draw:function() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.r);
          ctx.scale(1, this.sy);

          ctx.fillStyle = this.color;
          ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

          ctx.restore();
      },
      reset: function() {
        this.time = 0;
        this.duration = 3 + Math.random() * 2;
        this.complete = false;
    },
  };

  // Loader = function(x, y) {
  //     this.x = x;
  //     this.y = y;

  //     this.r = 24;
  //     this._progress = 0;

  //     this.complete = false;
  // };

  // Loader.prototype = {
  //     reset:function() {
  //         this._progress = 0;
  //         this.complete = false;
  //     },
  //     set progress(p) {
  //         this._progress = p < 0 ? 0 : (p > 1 ? 1 : p);

  //         this.complete = this._progress === 1;
  //     },
  //     get progress() {
  //         return this._progress;
  //     },
  //     draw:function() {
  //         ctx.fillStyle = '#000';
  //         ctx.beginPath();
  //         ctx.arc(this.x, this.y, this.r, -HALF_PI, TWO_PI * this._progress - HALF_PI);
  //         ctx.lineTo(this.x, this.y);
  //         ctx.closePath();
  //         ctx.fill();
  //     }
  // };

  Exploader = function(x, y) {
      this.x = x;
      this.y = y;

      this.startRadius = 24;

      this.time = 0;
      this.duration = 0.4;
      this.progress = 0;

      this.complete = false;
  };

  Exploader.prototype = {
      reset:function() {
          this.time = 0;
          this.progress = 0;
          this.complete = false;
      },
      update:function() {
          this.time = Math.min(this.duration, this.time + timeStep);
          this.progress = Ease.inBack(this.time, 0, 1, this.duration);
          console.log(this.time, this.duration)
          this.complete = this.time === this.duration;

      },
      draw:function() {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.startRadius * (1 - this.progress), 0, TWO_PI);
          ctx.fill();
      }
  };

  var particles = [],
      // loader,
      exploader,
      phase = 0;

  function initDrawingCanvas() {
      drawingCanvas.width = viewWidth;
      drawingCanvas.height = viewHeight;
      ctx = drawingCanvas.getContext('2d');

      // createLoader();
      createExploader();
      createParticles();
  }

  function createLoader() {
      loader = new Loader(viewWidth * 0.5, viewHeight * 0.5);
  }

  function createExploader() {
      exploader = new Exploader(viewWidth * 0.5, viewHeight * 0.5);
  }

  function createParticles() {
      for (var i = 0; i < 128; i++) {
          var p0 = new Point(viewWidth * 0.5, viewHeight * 0.5);
          var p1 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
          var p2 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
          var p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

          particles.push(new Particle(p0, p1, p2, p3));
      }
  }

  function update() {

      switch (phase) {
          case 0:
              // loader.progress += (1/45);
              break;
          case 1:
              exploader.update();
              break;
          case 2:
              particles.forEach(function(p) {
                  p.update();
              });
              break;
      }
  }

  function draw() {
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      switch (phase) {
          case 0:
              // loader.draw();
              break;
          case 1:
              exploader.draw();
              break;
          case 2:
              particles.forEach(function(p) {
                  p.draw();
              });
          break;
      }
  }

  // window.onload = function() {
  //     initDrawingCanvas();
  //     requestAnimationFrame(loop);
  // };

  let animationFrameId = null;

  function loop() {
      update();
      draw();
      phase = 1;

      if (phase === 1 && exploader.complete) {
          phase = 2;
      } else if (phase === 2 && checkParticlesComplete()) {
          // Reset the game
          phase = 0;
          exploader.reset();
          particles.forEach(function(p) {
              p.reset();
          });
          createParticles();
      }

      // Cancel the previous animation frame request if it exists
      if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
      }

      // Request a new animation frame
      animationFrameId = requestAnimationFrame(loop);
  }

  function checkParticlesComplete() {
      for (var i = 0; i < particles.length; i++) {
          if (particles[i].complete === false) return false;
      }
      return true;
  }

  // math and stuff

  /**
   * easing equations from http://gizma.com/easing/
   * t = current time
   * b = start value
   * c = delta value
   * d = duration
   */
  var Ease = {
      inCubic:function (t, b, c, d) {
          t /= d;
          return c*t*t*t + b;
      },
      outCubic:function(t, b, c, d) {
          t /= d;
          t--;
          return c*(t*t*t + 1) + b;
      },
      inOutCubic:function(t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2*t*t*t + b;
          t -= 2;
          return c/2*(t*t*t + 2) + b;
      },
      inBack: function (t, b, c, d, s) {
          s = s || 1.70158;
          return c*(t/=d)*t*((s+1)*t - s) + b;
      }
  };

  function cubeBezier(p0, c0, c1, p1, t) {
      var p = new Point();
      var nt = (1 - t);

      p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
      p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

      return p;
  }

})(MemoryGame);
