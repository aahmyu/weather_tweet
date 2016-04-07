var parseTweet = require('/parseTweet');
var Twitter = require('twitter');

client.stream('statuses/filter', {track: 'weathernfo'}, function(stream) {
  stream.on('data', processTweet);
 
  stream.on('error', function(error) {
    throw error;
  });
});

console.log(tweet.text);