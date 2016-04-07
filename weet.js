var Twitter = require('twitter');
var getJSON = require('simple-get-json');
var Readline = require('readline');


var client = new Twitter({
  consumer_key: 'tXEpYDAL8XUqoUEXARLmf5R2t',
  consumer_secret: '8kFgqlA3wJzr5jgTZiZiWiRSTQdH2nUMUYK8fQ5flQGriDrvxM',
  access_token_key: '716894117675057152-o0ypxyn9g2axV3kvvOWmleDKqfIdlNS',
  access_token_secret: 'EzFErztcwvqx2SsrYJ9IxKe3h8zjq47ZRt7V1PxYGyI0M'
});

function processTweet(tweet) {
  var tweetLowerCase = tweet.text.toLowerCase();
  var sliced = tweetLowerCase.slice(0, 12);
  var replaced = tweet.text.replace(sliced, '');
  var query = replaced.toLowerCase();
  var api_url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + query + '&mode=json&units=metric&cnt=8&appid=ab0f9735d1da46ee95ae7808cf197781';
  
  if (tweet.user.screen_name == 'weathernfo') {
    return;
  }else {
    if(query.indexOf('howto') > -1 || query.length === 0){
      var replyText = 'To use this app type the city name or the city name followed by a coma then the country code. ex: amsterdam,nl';
      post(tweet, replyText);
      return;
    }else if(query.indexOf('tomorrow') > -1){
      var spl = query.split(' ');
      var tomQuery = spl[0];
      api_url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + tomQuery + '&mode=json&units=metric&cnt=8&appid=ab0f9735d1da46ee95ae7808cf197781';
      console.log(api_url);
      loadWeatherInfosFromJsonTom(api_url, tweet);
    }else{
      loadWeatherInfosFromJson(api_url,tweet);
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
  var city = apiJson['city']['name'];
  var temp = apiJson['list'][0]['main']['temp'];
  var weather = apiJson['list'][0]['weather'][0]['description'];
  var replyText = "The temperature now in " + city + " is: " + temp + "°C, and the weather is: " + weather;
  console.log(replyText);
  // Update the replyText:
  post(tweet, replyText);
  
 /* var replyText = "The temperature now in " + city + " is: " + temp_c + "°C, and the weather is: " + weather;
  console.log(replyText);
  post(tweet, replyText);*/
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

function weatherinfosTom(apiJson, tweet) {
  // country = searchresult['location']['country_name'];
  var list = apiJson['list'];
  for (var i = 0; i < list.length; i++){
    if(list[i].dt_txt.split(' ')[1] == '09:00:00'){
    console.log(list[i].dt_txt.split(' ')[1]);
    console.log(list[i]['main'].temp);
    var city = apiJson['city']['name'];
    var temp = apiJson['list'][i]['main']['temp'];
    var weather = apiJson['list'][i]['weather'][0]['description'];
    var replyText = "The temperature now in " + city + " is: " + temp + "°C, and the weather is: " + weather;
    console.log(replyText);
    // Update the replyText:
    post(tweet, replyText);
	  }
  }
  var city = apiJson['city']['name'];
  var temp = apiJson['list'][0]['main']['temp'];
  var weather = apiJson['list'][0]['weather'][0]['description'];
  var replyText = "The temperature Tomorrow in " + city + " is: " + temp + "°C, and the weather is: " + weather;
  console.log(replyText);
  // Update the replyText:
  post(tweet, replyText);
  
 /* var replyText = "The temperature now in " + city + " is: " + temp_c + "°C, and the weather is: " + weather;
  console.log(replyText);
  post(tweet, replyText);*/
}
function loadWeatherInfosFromJsonTom(api_url, tweet) {

  // This function is called when getJSON successfully returns data.
  function onSuccess(apiJson) {
    // Inside of this function, I have access to data, and I have access to tweet
    // (because of the scoping).
    weatherinfosTom(apiJson, tweet);
  }

  // Instead of passing the weatherinfos function, I pass onSuccess.
  getJSON(api_url, onSuccess);

  //   getJSON(api_url, weatherinfos);
}

// Test-setup:
var rl = Readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('line', function(input) {
  // Do something with input.
  // For instance: just log it.
  console.log("You typed: " + input);
  // Call this when done.
  rl.prompt();
});

rl.prompt();
