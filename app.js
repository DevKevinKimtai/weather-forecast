
let history =  JSON.parse(localStorage.getItem("history")) || [];

const today = $('#today');
const forecast = $('#forecast');
const historylist = $('#history');
const h1 =$('h1');
let h1error = false;
const Apikey = "64c061c7a143e44714946379a0b46c02";
const errorMsg = (error) => {
    console.error(error);
    if (!h1error) {
        h1error= true;
        
        const h1 = $('h1');
        const h1a = h1.text();
        
        h1.text(`${error}, Please try again.`).addClass('text-danger');
        
        setTimeout(() => {
            h1.text(h1a).removeClass('text-danger');
            h1error= false; 
        }, 10000);
    }
};

const currentWeatherGetter = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Apikey}&units=imperial`);
        if(!response.ok){
            throw new Error('Failed to fetch  current weather condition');
        }
        const data = await response.json();
        const crrntweather = data;
        const { lat, lon } = data.coord;
        return {crrntweather, lat, lon};
    }catch(error){
        errorMsg(error);
        throw error;
    }
};

const weatherGetter = async (lat,lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${Apikey}&units=imperial`);
        if(!response.ok){
            throw new Error('Failed to fetch weather condition');
        }
        const data = await response.json();
        const weather = data.list;
        return weather;
    }catch(error){
        errorMsg(error);
        throw error;
    }
};

const latLonWeather = (city) => {
    const cardInfo = [];
    return currentWeatherGetter(city)  
    .then(({crrntweather,lat, lon }) => {
        cardInfo.push(crrntweather);
        return {lat, lon};
    })
    .then(({lat, lon}) => {
        return weatherGetter(lat, lon);
    })
    .then((weather) =>{
        for (let i = 6; i < weather.length; i += 8) {
            cardInfo.push(weather[i]);
        };
        today.empty();
        forecast.empty();
        createWeatherCard(cardInfo);
})
.catch(error => errorMsg(error));
};

const renderHistory = (city) => {
    const  historyelcont = $('<li>');
    const  historyel = $('<button>');
    historyel.text(city);
    historyel.attr('class', 'btn btn-outline-info');
    historyelcont.append(historyel);
    historylist.append(historyelcont);
    localStorage.setItem('history', JSON.stringify(history));
};

const weatherSearcher = (event) => {
    event.preventDefault();
    const city = $('#city').val().trim();
    $('#city').val('');
    if(!history.includes(city)){
        history.push(city);
        renderHistory(city);
    };
    latLonWeather(city);
};

const createWeatherCard = (weather) => {
    for(let i = 0; i < weather.length; i++){

    const colClass = i === 0 ? 'col-md-8 col-g-6 col-xl-4': 'col-md-8 col-lg-6 col-xl-2';
    const cardBodyClass = i === 0 ? 'card-body p-4' : 'card-body p-2';
    const headerClass = i === 0 ? 'd-flex' : 'd-flex text-center';
    const dateClass = i === 0 ? '' : 'me-3';
    const tempCondclass = i === 0 ? 'd-flex flex-column text-center mt-5 mb-4' : 'd-flex flex-column text-center mt-3 mb-2';
    const imgclass = i === 0 ? 'bigone' : '';
    const degrees = i === 0 ? 'display-4 mb-0 font-weight-bold' : 'display-6 mb-0 font-weight-bold';
    const dateparser = i === 0 ?  dayjs.unix(weather[i].dt) :  dayjs(weather[i].dt_txt);

    const col = $('<div>').addClass(colClass); 
    const card = $('<div>').addClass('card'); 
    const cardBody = $('<div>').addClass(cardBodyClass); 
    const header = $('<div>').addClass(headerClass); 
    const cityname = $('<h6>').addClass('flex-grow-1').text(weather[0].name); 
    const date = $('<h6>').text( dateparser.format('M/D/YY')).addClass(dateClass); 
    const tempcond = $('<div>').addClass(tempCondclass); 
    const temp = $('<h6>').addClass(degrees).text(`${weather[i].main.temp} ºF`);
    const cond = $('<span>').addClass('small').text(weather[i].weather[0].main);
    const humWindicon = $('<div>').addClass('d-flex align-items-center'); 
    const humWind = $('<div>').addClass('flex-grow-1'); 
    const wind = $('<div>'); 
    const windi = $('<i>').addClass('fas fa-wind fa-fw');
    const windSpan = $('<span>').text(`${weather[i].wind.speed} mph`).addClass('ms-1'); 
    const hum = $('<div>'); 
    const humi = $('<i>').addClass('fas fa-tint fa-fw');
    const humSpan = $('<span>').text(`${weather[i].main.humidity} %`).addClass('ms-1');
    const icondiv = $('<div>');
    const icon = $('<img>').attr('src', `http://openweathermap.org/img/w/${weather[i].weather[0].icon}.png`).addClass(imgclass);
    
    header.append(cityname, date);
    tempcond.append(temp, cond);
    wind.append(windi, windSpan);
    hum.append(humi, humSpan);
    humWind.append(wind, hum);
    icondiv.append(icon);
    humWindicon.append(humWind, icondiv);
    cardBody.append(header, tempcond, humWindicon);
    card.append(cardBody);
    col.append(card);

    if(i === 0){
        today.append(col);
    }else{forecast.append(col);}
    };
};

const historybtn = (event) => {
    event.preventDefault();
    latLonWeather(event.target.textContent);
};


$(document).ready(function () {
    $('#search').on('click', weatherSearcher);

    history.forEach(search => {
        renderHistory(search);
    });

    if(history.length === 0){
        latLonWeather('new york');
    }else{
        latLonWeather(history[history.length - 1]);
    }

    historylist.on('click', historybtn);
})