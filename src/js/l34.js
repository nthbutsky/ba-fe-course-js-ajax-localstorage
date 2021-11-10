import OMDB_API_KEY from './config';

const apiKey = OMDB_API_KEY.apiKey;
const searchInput = document.querySelector('#input-search');
const searchBtn = document.querySelector('#submit-btn');
const output = document.querySelector('#output-container');
const details = document.querySelector('#details-container');
const pagination = document.querySelector('#pagination');
const prevBtnContainer = document.querySelector('#prev-btn');
const nextBtnContainer = document.querySelector('#next-btn');
const favoriteBtn = document.querySelector('#favorite-btn');
const clearBtn = document.querySelector('#clear-btn');

searchBtn.addEventListener('click', async () => {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchInput.value}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    createPagination(Number(data.totalResults));
    output.innerHTML = '';
    details.innerHTML = '';
    showSearchResult(data);
  } catch (error) {
    console.log('Rejected', error);
  }
});

function showSearchResult(json) {
  let result = '';
  json.Search.forEach(e => {
    result += renderItem(e);
    output.innerHTML = result;
  });
}

function renderItem(item) {
  if (item.Poster === 'N/A') {
    item.Poster = './img/no-poster-available.png';
  }
  let result = '';
  result += `<div class="output-section__item">
              <img src="${item.Poster}" alt="${item.Title}">
              <div class="output-section__item-hover">${item.Title}</div>
              </div>`;
  return result;
}

function createPagination(itemsCount) {
  pagination.innerHTML = ' ';

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.innerText = `${i}`;
    pagination.append(btn);
  }

  const btnPrev = document.createElement('button');
  btnPrev.innerHTML = '&#8592;';
  const btnNext = document.createElement('button');
  btnNext.innerHTML = '&#8594;';
  prevBtnContainer.append(btnPrev);
  btnPrev.style.visibility = 'hidden';
  nextBtnContainer.append(btnNext);

  let currentPage = 1;
  const btnsPerPage = 10;

  btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      changePage(currentPage);
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentPage < setPagesNumb()) {
      currentPage++;
      changePage(currentPage);
    }
  });

  function setPagesNumb() {
    return itemsCount / btnsPerPage;
  }

  function changePage(page) {
    if (page < 1) {
      page = 1;
    }
    if (page > setPagesNumb()) page = setPagesNumb();

    pagination.innerHTML = ' ';

    for (let i = (page - 1) * btnsPerPage + 1; i <= page * btnsPerPage; i++) {
      const btn = document.createElement('button');
      btn.innerText = `${i}`;
      pagination.append(btn);
    }

    if (page == 1) {
      btnPrev.style.visibility = 'hidden';
    } else {
      btnPrev.style.visibility = 'visible';
    }

    if (page == setPagesNumb()) {
      btnNext.style.visibility = 'hidden';
    } else {
      btnNext.style.visibility = 'visible';
    }
  }
  window.onload = function () {
    changePage(1);
  };
}

pagination.addEventListener('click', async function (e) {
  e.preventDefault();
  const clickedPage = +e.target.innerText;
  console.log(clickedPage);
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchInput.value}&page=${clickedPage}`;
  const response = await fetch(url);
  const data = await response.json();
  output.innerHTML = ' ';
  showSearchResult(data);
});

output.addEventListener('click', async function (e) {
  e.preventDefault();
  const clickedItem = e.target.innerText;
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${clickedItem}`;
  const response = await fetch(url);
  const data = await response.json();
  output.innerHTML = ' ';
  details.innerHTML = ' ';
  renderClickedItem(data);
});

function renderClickedItem(item) {
  if (item.Poster === 'N/A') {
    item.Poster = './img/no-poster-available.png';
  }
  let result = '';
  result += `<div class="output-section__item-clicked">
              <div class="output-section__item-clicked-poster-container">
                <img class="output-section__item-clicked-poster" src="${item.Poster}" alt="${item.imdbID}">
                <i class="output-section__item-clicked-favorite-btn far fa-heart" id="heart"></i>
                <div class="output-section__item-clicked-poster-hover"></div>
              </div>
              <div class="output-section__item-clicked-details-container">
                <p class="output-section__item-clicked-title">${item.Title}</p>
                <p class="output-section__item-clicked-year">${item.Year}</p>
                <p class="output-section__item-clicked-country">${item.Country}</p>
                <p class="output-section__item-clicked-director">${item.Director}</p>
                <p class="output-section__item-clicked-runtime">${item.Runtime}</p>
                <p class="output-section__item-clicked-actors">${item.Actors}</p>
                <p class="output-section__item-clicked-plot">${item.Plot}</p>
              </div>
            </div>`;
  details.innerHTML = result;
  pagination.innerHTML = '';
  prevBtnContainer.innerHTML = '';
  nextBtnContainer.innerHTML = '';
  clearBtn.style.display = 'none';
}

function addFavorite(e) {
  const heart = e.target;
  let favoriteItemId = '';

  if (heart.getAttribute('id') === 'heart') {
    favoriteItemId = heart.previousElementSibling.getAttribute('alt');
  }

  if (favoriteItemId !== null && favoriteItemId !== undefined) {
    if (localStorage.getItem('favorites')) {
      const favorites = JSON.parse(localStorage.getItem('favorites'));
      const elementSearch = favorites.findIndex(item => {
        if (item === favoriteItemId) {
          return item;
        }
      });
      if (elementSearch === -1) {
        favorites.push(favoriteItemId);
      } else {
        favorites.splice(elementSearch, 1);
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
      // heart.classList.toggle('fas');
      // heart.classList.toggle('far');
    } else {
      const favoritesArrIds = [favoriteItemId];
      localStorage.setItem('favorites', JSON.stringify(favoritesArrIds));
      // heart.classList.toggle('fas');
      // heart.classList.toggle('far');
    }
  }
}

details.addEventListener('click', e => {
  addFavorite(e);
});

favoriteBtn.addEventListener('click', async function () {
  output.innerHTML = '';
  pagination.innerHTML = '';
  prevBtnContainer.innerHTML = '';
  nextBtnContainer.innerHTML = '';
  details.innerHTML = '';
  clearBtn.style.display = 'block';

  clearBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target === clearBtn) {
      localStorage.clear();
      output.innerHTML =
        '<div class="output-section__no-fav-msg">No favorites right now...</div>';
      clearBtn.style.display = 'none';
    }
  });
  const favoritesArray = JSON.parse(localStorage.getItem('favorites'));

  if (favoritesArray && favoritesArray.length > 0) {
    for (const item of favoritesArray) {
      const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${item}`;
      const response = await fetch(url);
      const data = await response.json();
      showFavorites(data);
    }
  } else {
    output.innerHTML =
      '<div class="output-section__no-fav-msg">No favorites right now...</div>';
    clearBtn.style.display = 'none';
  }
});

function showFavorites(json) {
  let result = '';
  result += renderItem(json);
  output.innerHTML += result;
}

// ALTERNATIVE WAYS OF FETCHING DATA

// searchBtn.addEventListener('click', () => {
//   const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchInput.value}`;
//   fetch(url)
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(error => console.log(error));
// });

// searchBtn.addEventListener('click', () => {
//   const xhr = new XMLHttpRequest();
//   xhr.addEventListener('readystatechange', () => {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//       const data = JSON.parse(xhr.responseText);
//       console.log(data);
//     } else if (xhr.readyState === 4) {
//       console.log('could not fetch data');
//     }
//   });
//   xhr.open(
//     'GET',
//     `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchInput.value}`,
//   );
//   // xhr.responseType = 'json';
//   xhr.send();
// });
