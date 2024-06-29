let currentCity = "";
let units = "metric";
const API_KEY = "f53eec14443ef05d6d6784e31899ea4e";

let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".weather__datetime p");
let weatherForecast = document.querySelector(".weather__forecast p");
let weatherTemperature = document.querySelector(".weather__temperature");
let weatherIcon = document.querySelector(".weather__icon img");
let weatherMinmax = document.querySelector(".weather__minmax");
let weatherRealfeel = document.querySelector(".weather__realfeel");
let weatherHumidity = document.querySelector(".weather__humidity");
let weatherWind = document.querySelector(".weather__wind");
let weatherPressure = document.querySelector(".weather__pressure");
let weatherSearch = document.querySelector(".weather__search");

// Function to show custom location access popup
function showLocationPopup() {
    const locationPopup = document.getElementById("locationPopup");
    locationPopup.style.display = "block";

    // Handle allow button click
    document.getElementById("allowLocation").addEventListener("click", () => {
        locationPopup.style.display = "none";
        requestLocationPermission();
    });

    // Handle deny button click (optional)
    document.getElementById("denyLocation").addEventListener("click", () => {
        locationPopup.style.display = "none";
        // Handle denial action if needed
    });
}

// Event listener for form submission
weatherSearch.addEventListener("submit", (e) => {
    let search = document.querySelector(".weather__searchform");
    e.preventDefault();
    currentCity = search.value;
    getWeather();
    search.value = "";
});

// Event listeners for unit change
document.querySelector(".unit__celsius").addEventListener("click", () => {
    if (units !== "metric") {
        units = "metric";
        getWeather();
    }
});

document.querySelector(".unit__fahrenheit").addEventListener("click", () => {
    if (units !== "imperial") {
        units = "imperial";
        getWeather();
    }
});

// Function to convert country code
function convertCountryCode(country) {
    let regionName = new Intl.DisplayNames(["en"], { type: "region" });
    return regionName.of(country);
}

// Function to convert timestamp
function convertTimestamp(timestamp, timezone) {
    const convertTimeZone = timezone / 3600;
    const date = new Date(timestamp * 1000);
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: `Etc/GMT${convertTimeZone >= 0 ? "-" : "+"}${Math.abs(convertTimeZone)}`,
        hour12: true,
    };
    return date.toLocaleString('en-US', options);
}

// Function to get weather data
function getWeather() {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${units}`;
    if (currentCity) {
        apiUrl += `&q=${currentCity}`;
    } else {
        // Show location access popup
        showLocationPopup();
        return; // Wait for user response before fetching weather
    }
    fetchWeatherData(apiUrl);
}

// Function to fetch weather data
function fetchWeatherData(apiUrl) {
    fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
            city.innerHTML = `${data.name}, ${convertCountryCode(data.sys.country)}`;
            datetime.innerHTML = convertTimestamp(data.dt, data.timezone);
            weatherForecast.innerHTML = `${data.weather[0].main}`;
            weatherTemperature.innerHTML = `${data.main.temp.toFixed()}&deg`;
            weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            weatherMinmax.innerHTML = `<p>Min: ${data.main.temp_min.toFixed()}&deg</p><p>Max: ${data.main.temp_max.toFixed()}&deg</p>`;
            weatherRealfeel.innerHTML = `${data.main.feels_like.toFixed()}&deg`;
            weatherHumidity.innerHTML = `${data.main.humidity.toFixed()}%`;
            weatherWind.innerHTML = `${data.wind.speed}${units === "imperial" ? "mph" : "m/s"}`;
            weatherPressure.innerHTML = `${data.main.pressure} hPa`;
        })
        .catch((error) => {
            console.error("Error fetching weather data:", error);
        });
}

// Function to request location permission
function requestLocationPermission() {
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
            // Permission already granted
            getLocation();
        } else if (permissionStatus.state === 'prompt') {
            // Permission not yet granted, request it
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Handle location data
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}`);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Handle error if needed
                }
            );
        } else {
            // Permission denied or other state, handle accordingly
            console.log('Geolocation permission denied or other state:', permissionStatus.state);
        }
    });
}

// Event listener for page load
window.addEventListener("load", () => {
    if (!currentCity) {
        // Show location access popup on load if city is not set
        showLocationPopup();
    } else {
        getWeather();
    }
});
