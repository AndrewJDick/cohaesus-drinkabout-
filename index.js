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

    try {
        var speech = '';
        var cms;

        if (req.body) {
          var requestBody = req.body;

          if (requestBody.result) {

            if (requestBody.result.action === 'tech.cms.evaluate') {

              var cms = requestBody.result.contexts.name; 

              console.log(cms);
            }

            // Sample number Evaluation
            if (requestBody.result.action === 'number.eval') {
              var userResponse = parseInt(requestBody.result.resolvedQuery);

              if (userResponse < 10) {
                speech = 'You want Drupal!';
              } else {
                speech = 'You want Wordpress';
              }
            }
          }
        }

        return res.json({
            speech: cms,
            source: 'drinkabout-webhook',
            displayText: cms
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





