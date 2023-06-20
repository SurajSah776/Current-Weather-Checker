// Fetching the tabs
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const error = document.querySelector(".error");


// Initially variables needed

let currentTab = userTab;
const API_KEY = "d416462772867a6ce470357f97cc3289";
currentTab.classList.add("current-tab");


// Initially calling if there is saved lattitude and longitude
getFromSessionStorage();

// Function for switching between the tabs ( weather and search)

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        error.classList.remove("active");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // Switching the tabs by adding / removing 'active' class
        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
};

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// Checks if coordinates are already present in local storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // If coordinates are not present in local storage, then we will be showing the Grant Access Window
        grantAccessContainer.classList.add("active");
    }
    else {
        // else we will fetch the weather by passing the lattitude and longitude by calling API
        const coordinates = JSON.parse(localCoordinates);

        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    // We need to show the loading screen
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    // API Call

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        // removing loading screen and showing the weather info screen
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }
    catch (err) {
        // If there is an error, we will show the error message
        loadingScreen.classList.remove("active");
        alert("Error: " + err.message);
    }
}



// Function to render wather info fom json file to the UI

function renderWeatherInfo(weatherInfo) {

    // We need to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI elements
    // We will use "Optional Chaining Operator (?.)""

    cityName.innerText = weatherInfo?.name;

    countryIcon.src =
        `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    desc.innerText = weatherInfo?.weather?.[0].description;

    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temp.innerText = `${weatherInfo?.main?.temp} °C`;

    windSpeed.innerText = `${weatherInfo?.wind?.speed}m/s`;

    humidity.innerText = `${weatherInfo?.main?.humidity}%`;

    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

}


// Finding / Checking the current Location using geo location API

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition); //Callback function showPosition
    }
    else {
        // alert for no geolocation support
        alert("No GeoLocation Support Available")
    }
}

function showPosition(position) {
    const userCooordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCooordinates));
    fetchUserWeatherInfo(userCooordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


// Function For Search icon
const searchInput = document.querySelector("[data-searchInput]")
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityNamee = searchInput.value;

    // if cityname is empty
    if (cityNamee === "") {
        return;
    }
    // if not empty
    else {
        fetchSearchWeatherInfo(searchInput.value);
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    error.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        // Added
        if (!response.ok) {
            loadingScreen.classList.remove("active");
            error.classList.add("active"); /*Not Working */
            alert("City not Found");
        }
        else {
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
    }
    catch (err) {
        alert("API Error : ", err)
    }


}