var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/webhook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
          var requestBody = req.body;

          if (requestBody.result) {

            if (requestBody.result.action === 'drinkabout.test') {
              var userResponse = parseInt(requestBody.result.resolvedQuery);

              if (userResponse < 10) {
                speech = 'You want Drupal!';
              } else {
                speech = 'You want Wordpress';
              }
            }
          }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            source: 'drinkabout-webhook',
            displayText: speech
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});





