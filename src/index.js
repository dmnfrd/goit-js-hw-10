/*Поле пошуку
Назву країни для пошуку користувач вводить у текстове поле input#search-box. HTTP-запити виконуються при введенні назви країни, тобто на події input. Але робити запит з кожним натисканням клавіші не можна, оскільки одночасно буде багато запитів і вони будуть виконуватися в непередбачуваному порядку.

Необхідно застосувати прийом Debounce на обробнику події і робити HTTP-запит через 300мс після того, як користувач перестав вводити текст. Використовуй пакет lodash.debounce.

Якщо користувач повністю очищає поле пошуку, то HTTP-запит не виконується, а розмітка списку країн або інформації про країну зникає.

Виконай санітизацію введеного рядка методом trim(), це вирішить проблему, коли в полі введення тільки пробіли, або вони є на початку і в кінці рядка.

Інтерфейс
Якщо у відповіді бекенд повернув більше ніж 10 країн, в інтерфейсі з'являється повідомлення про те, що назва повинна бути специфічнішою. Для повідомлень використовуй бібліотеку notiflix і виводь такий рядок "Too many matches found. Please enter a more specific name.".

Too many matches alert

Якщо бекенд повернув від 2-х до 10-и країн, під тестовим полем відображається список знайдених країн. Кожен елемент списку складається з прапора та назви країни.

Country list UI

Якщо результат запиту - це масив з однією країною, в інтерфейсі відображається розмітка картки з даними про країну: прапор, назва, столиця, населення і мови.

Country info UI

УВАГА
Достатньо, щоб застосунок працював для більшості країн. Деякі країни, як-от Sudan, можуть створювати проблеми, оскільки назва країни є частиною назви іншої країни - South Sudan. Не потрібно турбуватися про ці винятки.

Обробка помилки
Якщо користувач ввів назву країни, якої не існує, бекенд поверне не порожній масив, а помилку зі статус кодом 404 - не знайдено. Якщо це не обробити, то користувач ніколи не дізнається про те, що пошук не дав результатів. Додай повідомлення "Oops, there is no country with that name" у разі помилки, використовуючи бібліотеку notiflix.

Error alert

УВАГА
Не забувай про те, що fetch не вважає 404 помилкою, тому необхідно явно відхилити проміс, щоб можна було зловити і обробити помилку. */

import './css/styles.css';
import { fetchCountries } from './js/fetchCountries';
import { Notify } from 'notiflix';
import debounce from 'lodash.debounce';



const DEBOUNCE_DELAY = 300;

const searchBox = document.querySelector('input#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

searchBox.addEventListener('input', debounce(onCountrySearch, DEBOUNCE_DELAY));

function onCountrySearch() {
    const countryName = searchBox.value.trim();
    if (!countryName) {
        countryInfo.innerHTML = '';
        countryList.innerHTML = '';
        return;
    }

    fetchCountries(countryName)
        .then(countries => {
            if (countries.length > 10) {
                Notify.info('Too many matches found. Please enter a more specific name.');
                countryInfo.innerHTML = '';
                countryList.innerHTML = '';
                return;
            }
            if (countries.length >= 2) {
                const countryListDisplay = countries.map(country => createListMarkup(country));
                countryList.innerHTML = countryListDisplay.join("");
                countryInfo.innerHTML = '';
            }
            if (countries.length === 1) {
                const countryInfoDisplay = countries.map(country => createInfoMarkup(country));
                countryInfo.innerHTML = countryInfoDisplay.join("");
                countryList.innerHTML = '';
            }
        })
        .catch(error => {
            Notify.failure('Oops, there is no country with that name');
            countryInfo.innerHTML = '';
            countryList.innerHTML = '';
            return error;
        });
}

const createListMarkup = ({ name, flags }) => {
  return `<li class="country-list__item">
    <img class="country-list__img" width="60px" height="40px"
        src="${flags.svg}" 
        alt="${name.official}"/>
    <p class="country-list__name">${name.official}</p>
  </li>`;
};

const createInfoMarkup = ({ name, capital, population, flags, languages }) => {
  return `<div class="country-info__meta">
    <img class="country-info__img" width="80px" height="40px"
        src="${flags.svg}" alt="${name.official}">
    <p class="country-info__name"><b>${name.official}</b></p>
  </div>
  <p class="country-info__capital"><b>Capital: </b>${capital}</p>
  <p class="country-info__population"><b>Population: </b>${population}</p>
  <p class="country-info__languages"><b>Languages: </b>${Object.values(languages)}</p>`
};
