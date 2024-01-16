const gameOverWrapper = document.querySelector('.game-over');
const playAgainTimeWrapper = document.querySelector('.game-over p span');

const setCookie = (cname, cvalue, exdays = 1) => {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  var currentHour = d.getHours();
  var currentMinute = d.getMinutes();
  document.cookie = `play-again-time=${d.toDateString()} ${currentHour}:${currentMinute}`;
}

const getCookie = (cname) => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      console.log(document.cookie);
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const handleIncorrectAnswers = (n) => {
  const tips = document.querySelectorAll('.tip');
  const tip = tips[tips.length - n]
  if (tip) {
    tip.classList.add('show');
  }
  // end game at n == 0 - set cookie to wait till tomorrow
  if (n == 0) {
    handleEndGame();
  }
}

const handleEndGame = (onLoad = false) => {
  setCookie('game-over', true, 1);
  const dishTitle = document.querySelector('.dish-title');
  dishTitle.classList.add('showing');
  const playAgainTime = getCookie('play-again-time');

  if (onLoad) {
    gameOverWrapper.classList.add('show');
    playAgainTimeWrapper.innerHTML = playAgainTime;
  } else {
    setTimeout(() => {
      gameOverWrapper.classList.add('show');
      playAgainTimeWrapper.innerHTML = playAgainTime;
    }, 3000);
  }
}

const searchFoodImage = () => {
  const dishTitle = document.querySelector('.dish-title');
  const url = `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyDQGvc77DU8f_BIP11vSI2jkKW6tgoG4Yo&cx=b79a49e5fe1f940d0&q=${dishTitle.innerText}&searchType=image&imgSize=huge`;
  fetch(url)
    .then(res => {
      return res.json();
    })
    .then(data => {
      const imageWrapper = document.querySelector('.image-wrapper');
      const imgUrl = data.items[0].link;
      const img = new Image();
      img.src = imgUrl;
      imageWrapper.appendChild(img);
    })
    .catch(err => console.log(err));
}



// init
if (!getCookie('game-over')) {

  searchFoodImage();

  const form = document.querySelector('#country-guesser');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const country = e.target.elements.country.value;
    const id = e.target.elements.id.value;
    if (country != '') {
      fetch('https://cuisine-quest.vercel.app/check-country', {
        method: 'POST',
        body: JSON.stringify({ country: country, id: id }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(async (res) => {
          return res.json();
        })
        .then(data => {
          const imageWrapper = document.querySelector('.image-wrapper');
          if (data) {
            imageWrapper.classList.add('correct');
            handleEndGame();

            // call next random dish
            // setTimeout(() => {
            //   getNextDish();
            // }, 2000);
          } else {
            const guessesLeft = document.querySelector('.guesses-left span');
            const n = parseInt(guessesLeft.innerHTML) - 1;
            guessesLeft.innerHTML = n;
            handleIncorrectAnswers(n); // handleEndGame called here

            imageWrapper.classList.add('incorrect');
            if (n != 0) {
              setTimeout(() => {
                imageWrapper.classList.remove('incorrect');
              }, 1500);
            }
          }
        })
        .catch(err => console.log(err));
    }
  });

} else {
  handleEndGame(true);
}




// basically useless now lol
// pay extra and get unlimited games looool
// const getNextDish = () => {
//   const imageWrapper = document.querySelector('.image-wrapper');
//   const img = document.querySelector('.image-wrapper img');
//   const dishTitle = document.querySelector('.dish-title');
//   const idInput = document.querySelector('input[name=id]');
//   const countryInput = document.querySelector('input[name=country]');

//   // remove old dish
//   img.style.opacity = '0';
//   imageWrapper.classList.remove('correct');
//   dishTitle.classList.remove('showing');

//   // load new dish
//   fetch('/new-dish')
//     .then((res) => {
//       return res.json();
//     })
//     .then(data => {
//       console.log(data);
//       if (data) {
//         countryInput.value = '';
//         idInput.value = data.id;
//         dishTitle.innerHTML = data.img.fields.title;
//         img.src = data.img.fields.file.url + '?fit=fill&w=720&h=720';
//         img.style.opacity = '1';
//       } else {
//         imageWrapper.innerHTML = '<h2>Complete!</h2>';
//       }
//     })
//     .catch(err => console.log(err));
// }