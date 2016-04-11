var client = require('./client');
var getJSON = require('simple-get-json');


function processTweet(tweet) {
  var tweetLowerCase = tweet.text.toLowerCase();
  var sliced = tweetLowerCase.slice(0, 12);
  var query = tweet.text.replace(sliced, '');
  var api_url = 'http://api.openweathermap.org/data/2.5/weather?q=' + query + '&units=metric&appid=ab0f9735d1da46ee95ae7808cf197781';

  if (tweet.user.screen_name != 'weathernfo') {
    if (query.indexOf('howto') > -1 || query.length === 0) {
      var replyText = 'To use this app type the city name or the city name followed by a coma then the country code. ex: amsterdam,nl';
      post(tweet, replyText);
    } else if (query.indexOf('tomorrow') > -1) {
      var spl = query.split(' ');
      var tomQuery = spl[0];
      api_url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + tomQuery + '&mode=json&units=metric&cnt=2&appid=ab0f9735d1da46ee95ae7808cf197781';
      loadWeatherInfosFromJsonTomorrow(api_url, tweet);
    } else {
      loadWeatherInfosFromJson(api_url, tweet);
    }
  }
}

function post(tweet, replyText) {

  var reply = {
    status: '@' + tweet.user.screen_name + ' ' + replyText,
    in_reply_to_status_id: tweet.id_str
  };
  client.post('statuses/update', reply, function(error, data) {
    if (error) {
      console.log(error);
    }
  });
}


client.stream('statuses/filter', {
  track: 'weathernfo'
}, function(stream) {
  stream.on('data', processTweet);

  stream.on('error', function(error) {
    throw error;
  });
});

function weatherinfos(apiJson, tweet) {
  // country = searchresult['location']['country_name'];
  var city = apiJson['name'];
  var temp = apiJson['main']['temp'];
  var weather = apiJson['weather'][0]['description'];
  var replyText = "The temperature now in " + city + " is: " + round(temp) + "°C, and the weather is: " + weather;
  console.log(replyText);
  // Update the replyText:
  post(tweet, replyText);

}

function loadWeatherInfosFromJson(api_url, tweet) {

  // This function is called when getJSON successfully returns data.
  function onSuccess(apiJson) {
    // Inside of this function, I have access to data, and I have access to tweet
    // (because of the scoping).
    weatherinfos(apiJson, tweet);
  }


  // Instead of passing the weatherinfos function, I pass onSuccess.
  getJSON(api_url, onSuccess);

  //   getJSON(api_url, weatherinfos);
}


function weatherinfosTomorrow(apiJson, tweet) {
  // country = searchresult['location']['country_name'];
  var city = apiJson['city']['name'];
  var temp = apiJson['list'][1].temp.day;
  var weather = apiJson['list'][1]['weather'][0]['description'];
  var replyText = "The temperature Tomorrow in " + city + " is: " + round(temp) + "°C, and the weather is: " + weather;
  var dtxt = apiJson['list'][1].dt;
  console.log(dtxt);

  // Update the replyText:
  post(tweet, replyText);
}

function loadWeatherInfosFromJsonTomorrow(api_url, tweet) {

  // This function is called when getJSON successfully returns data.
  function onSuccess(apiJson) {
    // Inside of this function, I have access to data, and I have access to tweet
    // (because of the scoping).
    weatherinfosTomorrow(apiJson, tweet);
  }

  // Instead of passing the weatherinfos function, I pass onSuccess.
  getJSON(api_url, onSuccess);

  //   getJSON(api_url, weatherinfos);
}

function round(num) {
  return Math.floor(num);
}
