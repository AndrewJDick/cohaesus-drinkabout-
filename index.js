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
        var cms; 
        var speech = '';
        var cmsContext = {};

        if (req.body) {
          var requestBody = req.body;

          if (requestBody.result) {

            if (requestBody.result.action === 'tech.cms.evaluate') {

              const contexts = requestBody.result.contexts; 
              let cmsContext = {};
              
              // Locate and store the CMS context, containing all of the user's parameters 
              for (let context of contexts) {
                if (context.name === "tech-cms") {
                  cmsContext = context;
                }
              }

              // Determine the size of the site, based on the number of developers working on the project.
              const site = {
                size: cmsContext.parameters['developers'] < 20 ? "small" : "large",
                stack: cmsContext.parameters['tech-stack'],
                commerce: cmsContext.parameters['ecommerce'],
                style: cmsContext.parameters['tech-site-style']
              };

              if (site.size === 'small' && site.stack === 'php' && site.commerce === 'no' && site.style === 'brochure') {
                cms = 'Drupal';
              }

              if (site.size === 'large' && site.stack === 'php' && site.commerce === 'no' && site.style === 'personalised') {
                cms = 'Wordpress';
              }

              if (site.size === 'small' && site.stack === '.net' && site.commerce === 'no' && site.style === 'brochure') {
                cms = 'Umbraco';
              }

              if (site.size === 'large' && site.stack === '.net' && site.commerce === 'no' && site.style === 'personalised') {
                cms = 'Sitecore';
              }

              if (site.commerce === 'yes' && site.style === 'brochure') {
                cms = 'Magento';
              }

              if (site.commerce === 'yes' && site.style === 'personalised') {
                cms = 'Shopify';
              }              

              return res.json({
                speech: cms,
                source: 'drinkabout-evaluation',
                displayText: cms
              });             
            }
          }
        }

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





