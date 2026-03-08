const gameOverWrapper = document.querySelector('.game-over');
const playAgainTimeWrapper = document.querySelector('.game-over p span');
const apiUrl = window.location.origin;

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
      return c.substring(name.length, c.length);
    }
  }
  return "";
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

const handleIncorrectAnswers = (n) => {
  const tips = document.querySelectorAll('.tip');
  const tip = tips[tips.length - n]
  if (tip) {
    tip.classList.add('show');
  }
}

// TODO: figure out stats and cookie
// do i even need stats here? just x/255 ? show correct answer number?
// userAnswered true = correctly
// show userAnswered true / total * 100 ?
const handleStats = () => {

  // get totals and set cookie


  // display on front end

}

const handleEndGame = async (onLoad = false, id = "") => {
  const dishTitle = document.querySelector('.dish-title');
  dishTitle.classList.add('showing');

  const foodCountry = getCookie('food-country');
  const foodName = getCookie('food-name');
  const playAgainTime = getCookie('play-again-time');

  try {
    if (!foodCountry) {
      const response = await fetch(`${apiUrl}/get-country`, {
        method: 'POST',
        body: JSON.stringify({ id: id }),
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      console.log(data);
      if (data) {
        const d = new Date();
        const currentHour = d.getHours();
        const currentMinute = d.getMinutes();
        const cookieValue = `${d.toDateString()} ${currentHour}:${currentMinute}`;
        setCookie('play-again-time', cookieValue, 1);
        setCookie('food-country', data.country, 1);
        setCookie('food-name', data.name, 1);
        playAgainTimeWrapper.innerHTML = playAgainTime;
        playAgainTimeWrapper.insertAdjacentHTML('afterend', `<p>Today's Answer: ${data.country}, Cuisine: ${data.name}</p>`);
      }
    }

    if (onLoad) {
      gameOverWrapper.classList.add('show');
      playAgainTimeWrapper.innerHTML = playAgainTime;
      playAgainTimeWrapper.insertAdjacentHTML('afterend', `<p>Today's Answer: ${foodCountry}, Cuisine: ${foodName}</p>`);
    } else {
      setCookie('game-over', true, 1);
      setTimeout(() => {
        gameOverWrapper.classList.add('show');
        playAgainTimeWrapper.innerHTML = playAgainTime;
      }, 3000);
    }
  } catch (err) {
    console.log(err);
  }
}

const handleOnChange = () => {
  const options = document.querySelectorAll('#select-list li');
  const inputValue = document.querySelector('input[name="country"]').value.toLowerCase();
  options.forEach(result => {
    if (result.innerHTML.toLowerCase().includes(inputValue)) {
      result.style.display = 'block';
    } else {
      result.style.display = 'none';
    }
  });
}

const handleOpenInput = () => {
  const selectList = document.querySelector('#select-list');
  const input = document.querySelector('input[name="country"]');
  input.addEventListener('keydown', () => {
    selectList.classList.add('open');
  });
  input.addEventListener('keyup', handleOnChange);
  input.addEventListener('blur', (e) => {
    setTimeout(() => {
      selectList.classList.remove('open');
    }, 250);
  });
  
  const options = document.querySelectorAll('#select-list li');
  options.forEach(result => {
    result.addEventListener('click', () => {
      console.log(result.innerHTML);
      input.value = result.innerHTML;
      selectList.classList.remove('open');
    });
  });
}

const capitalizeFirstLetter = (string) => {
  const trimmedStr = string.trim();
  return trimmedStr[0].toUpperCase() + trimmedStr.slice(1);
}

// init

if (!getCookie('game-over')) {

  searchFoodImage();

  handleOpenInput();

  const form = document.querySelector('#country-guesser');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const country = capitalizeFirstLetter(e.target.elements.country.value);
    const id = e.target.elements.id.value;
    if (country != '') {
      fetch(`${apiUrl}/check-country`, {
        method: 'POST',
        body: JSON.stringify({ country: country, id: id }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then((res) => {
          return res.json();
        })
        .then(data => {
          const imageWrapper = document.querySelector('.image-wrapper');
          if (data) {
            imageWrapper.classList.add('correct');
            handleEndGame(false, id);

            // call next random dish
            // setTimeout(() => {
            //   getNextDish();
            // }, 2000);
          } else {
            const guessesLeft = document.querySelector('.guesses-left span');
            const n = parseInt(guessesLeft.innerHTML) - 1;
            guessesLeft.innerHTML = n;
            handleIncorrectAnswers(n);

            imageWrapper.classList.add('incorrect');

            // clear input
            document.querySelector('input[name="country"]').value = '';

            if (n != 0) {
              setTimeout(() => {
                imageWrapper.classList.remove('incorrect');
              }, 1500);
            } else {
              // end game at n == 0 - set cookie to wait till tomorrow
              handleEndGame(false, id);
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