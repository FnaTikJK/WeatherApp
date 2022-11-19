let apiKey = "b943af1fd2c2adf413b95736cab254a2";

document.getElementById("btn_add").onclick = get_add_widget_func();

function get_add_widget_func(){
    let ind = 0;

    return () => {
        ind++;
        var div = document.createElement("div");
        div.setAttribute("class", "widget");
        div.innerHTML = get_widget_html(ind);
        document.body.appendChild(div);
        document.getElementById(`btn_get_info${ind}`).onclick = get_info_getter_func(ind);
    }
}

function get_widget_html(ind){
    return `
        <div>
            Широта
            <input id="lat${ind}" value="55.755864">
        </div>
        <div>
            Долгота
            <input id="lon${ind}" value="37.617698">
        </div>
        <button id="btn_get_info${ind}" class="btn">
            Показать погоду
        </button>
        <div>
            <div class="block">
                <div id="place${ind}" class="place-info"></div>
                <img id="weather_img${ind}">
                <div id="temp${ind}" class="temp-info"></div>
                <div id="feels_like${ind}"></div>
                <div id="weather_description${ind}"></div>
            </div>
            <div id="wind_description${ind}" class="block">

            </div>
            <div class="block">
                <img id="wind_img${ind}">
                <div id="wind_speed${ind}" style="margin-left: 20px;"></div>
                <div id="humidity${ind}"></div>
                <div id="visibility${ind}"></div>
                <div id="time${ind}"></div>
            </div>
        </div>

        <div id="map${ind}" class="map">
            Место на карте
        </div>
    `
}

function get_info_getter_func(ind){
    let map;
    
    return async () => {
        let lat = Number(document.getElementById(`lat${ind}`).value);
        let lon = Number(document.getElementById(`lon${ind}`).value);

        if (isNaN(lat) || isNaN(lon))
        {
            alert("Некорректные данные");
            return;
        }

        let weather = new Weather(await GetWeatherResponse(lat, lon));
        InputInfoInHtml(weather, ind);

        if (map === undefined)
            ymaps.ready(() => {
                map = new ymaps.Map(`map${ind}`, {
                    center: [lat, lon],
                    zoom: 7
                });
            });
        else 
            map.setCenter([lat, lon]);
    }
}

function InputInfoInHtml(weather, ind){
    document.getElementById(`place${ind}`).textContent = weather.Location.name + ", " + weather.Location.country;
    document.getElementById(`weather_img${ind}`).src = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    document.getElementById(`temp${ind}`).textContent = weather.main.temp + "°C"; 
    document.getElementById(`feels_like${ind}`).textContent = `Ощущается как ${weather.main.feels_like}°C`;
    document.getElementById(`weather_description${ind}`).textContent = weather.description;
    document.getElementById(`wind_img${ind}`).style.transform = "rotate("+ ((weather.main.wind.degree + 90) % 360) +"deg)";
    document.getElementById(`wind_img${ind}`).src = "images/wind-arrow.png";
    document.getElementById(`wind_description${ind}`).textContent = "Направление и скорость ветра";
    document.getElementById(`wind_speed${ind}`).textContent = weather.main.wind.speed + "м/с";
    document.getElementById(`humidity${ind}`).textContent = `Влажность:${weather.main.humidity}%`;
    document.getElementById(`visibility${ind}`).textContent = `Видимость:${weather.main.visibility}м`;
    document.getElementById(`time${ind}`).textContent = `Время:${weather.time.hours}:${weather.time.minutes}`;
}

async function GetWeatherResponse(lat, lon){
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    return await response.json();
}

class Weather{
    constructor(weatherResponse){
        this.main = {
            temp: weatherResponse.main.temp,
            feels_like: weatherResponse.main.feels_like,
            humidity: weatherResponse.main.humidity,
            visibility: weatherResponse.visibility,
            wind: {
                degree: weatherResponse.wind.deg,
                speed: weatherResponse.wind.speed,
            },
        };
        this.Location = {
            name: weatherResponse.name,
            country: weatherResponse.sys.country,
        };
        this.time = {
            hours: Math.floor((weatherResponse.dt + weatherResponse.timezone) / 3600) % 24 ,
            minutes: Math.floor((weatherResponse.dt + weatherResponse.timezone) / 60) % 60,
            sunrise: weatherResponse.sys.sunrise,
            sunset: weatherResponse.sys.sunset,
        };
        this.description = weatherResponse.weather[0].description;
        this.icon = weatherResponse.weather[0].icon;
    }
}