const form = document.querySelector('#country-guesser');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(e.target.elements.country.value)
  const country = e.target.elements.country.value;
  const id = e.target.elements.id.value;
  fetch('http://localhost:8081/check-country', {
    method: 'POST',
    body: JSON.stringify({country: country, id: id}),
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
      // show dish title
      const dishTitle = document.querySelector('.dish-title');
      dishTitle.classList.add('showing');

      // call next random dish
      setTimeout(() => {
        getNextDish();
      }, 2000);
      // or
      // TODO: set cookie to wait till tomorrow
      setCookie('game-over', true, 1);


    } else {
      // TODO: update guess option
      const guessesLeft = document.querySelector('.guesses-left span');
      const n = parseInt(guessesLeft.innerHTML) - 1;
      guessesLeft.innerHTML = n;
      console.log(n);
      handleIncorrectAnswers(n);

      imageWrapper.classList.add('incorrect');
      if (n != 0){
        setTimeout(() => {
          imageWrapper.classList.remove('incorrect');
        }, 1500);
      }
    }
  })
  .catch(err => console.log(err));
});


const handleIncorrectAnswers = (n) => {
  const tip = document.querySelector(`.tip-${n}`);
  if (tip) {
    tip.classList.add('show');
  }

  // end game at n == 0 - set cookie to wait till tomorrow
  if (n == 0) {
    // TODO: set cookie to wait till tomorrow
    setCookie('game-over', true, 1);

  }

}



const setCookie = (cname, cvalue, exdays = 1) => {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  console.log(expires)
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const getCookie = (cname) => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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



// basically useless now lol
// pay extra and get unlimited games looool
const getNextDish = () => {
  const imageWrapper = document.querySelector('.image-wrapper');
  const img = document.querySelector('.image-wrapper img');
  const dishTitle = document.querySelector('.dish-title');
  const idInput = document.querySelector('input[name=id]');
  const countryInput = document.querySelector('input[name=country]');

  // remove old dish
  img.style.opacity = '0';
  imageWrapper.classList.remove('correct');
  dishTitle.classList.remove('showing');

  // load new dish
  fetch('/new-dish')
  .then((res) => {
    return res.json();
  })
  .then(data => {
    console.log(data);
    if (data) {
      countryInput.value = '';
      idInput.value = data.id;
      dishTitle.innerHTML = data.img.fields.title;
      img.src = data.img.fields.file.url+'?fit=fill&w=720&h=720';
      img.style.opacity = '1';
    } else {
      imageWrapper.innerHTML = '<h2>Complete!</h2>';
    }
  })
  .catch(err => console.log(err));
}