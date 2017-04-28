var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var agent = 

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
        let speech = '';

        if (req.body) {
          var requestBody = req.body;

          if (requestBody.result) {

            if (requestBody.result.action === 'tech.cms.stack') {
              const contexts = requestBody.result.contexts; 
              let cmsContext = {};

              // Locate and store the current CMS context, containing all of the user's parameters 
              for (let context of contexts) {
                if (context.name === "tech-cms") {
                  cmsContext = context;
                }
              }

              let techStack = cmsContext.parameters['tech-stack'];
              let speech = '';

              if (techStack === 'no preference') {
                cmsContext.parameters['tech-stack'] = 'php';
                speech = `No preference? No worries!\n Are you looking for a simple brochure website?`; 
              } else {
                speech = `${techStack}? A fine choice!\n Are you looking for a simple brochure website?`;
              }

              return res.json({
                speech: speech,
                source: 'drinkabout-webhook-stack',
                displayText: speech
              });

            }

            if (requestBody.result.action === 'tech.cms.evaluate') {

              const contexts = requestBody.result.contexts; 

              let cmsContext = {};
              let advancedSite = false;
              
              // Locate and store the current CMS context, containing all of the user's parameters 
              for (let context of contexts) {
                if (context.name === "tech-cms") {
                  cmsContext = context;
                }
              }

              // cms object created as a basis of evaluation.
              const requirements = {
                stack: cmsContext.parameters['tech-stack'] !== 'no preference' ? cmsContext.parameters['tech-stack'] : 'php',
                brochure: cmsContext.parameters.brochure === 'yes' ? true : false,
                ecommerce: cmsContext.parameters.ecommerce === 'yes' ? true : false,
                features: cmsContext.parameters['tech-features'] || []
              };
              
              const siteScope = function() {
                
                // TODO: Pull the entity values from the API.AI agent entity, rather than hard-coding.
                const advancedFeatures = ['multi-site', 'multi-lingual', 'personalisation', 'dynamic forms', 'interactive elements', 'user accounts', 'dynamic forms', 'interactive elements'];

                // If the features array contains any advanced features, switch requirements.level to advanced.
                for (let feature in requirements.features) {
                  for (let advancedFeature in advancedFeatures) {
                    if (requirements.features[feature] === advancedFeatures[advancedFeature]) {
                      advancedSite = true;
                    }
                  }
                }
              }();

              // Output all features to a single string value
              const featureList = function() {
                let features = '';

                for (let feature in requirements.features) {
                  features += (requirements.features[feature] !== requirements.features[requirements.features.length-1]) 
                    ? `${requirements.features[feature]}, ` 
                    : (requirements.features.length > 1) 
                      ? `and ${requirements.features[feature]},` 
                      : `a ${requirements.features[feature]},`;
                }

                return features;
              }();
              
              // Evaluate the parameters and return the correct CMS based on the user requirements.
              const evaluate = function() {

                if (requirements.ecommerce) {
                  if (advancedSite) {
                    return 'Magento';
                  } else {
                    return 'Shopify';
                  }
                } 

                else {
                  if (requirements.brochure || (!requirements.brochure && !advancedSite)) {
                    switch(requirements.stack) {
                      case 'php': return 'Wordpress';
                      case '.net' : return 'Umbraco';
                    }
                  }

                  if (!requirements.brochure && advancedSite) {
                    switch(requirements.stack) {
                      case 'php': return 'Drupal';
                      case '.net' : return 'Sitecore';
                    }
                  }

                  return 'unknown';
                }
              }();

              const speech = function() {

                let brochure = (requirements.brochure) ? 'brochure' : 'non-brochure';
                let ecommerce = (requirements.ecommerce) ? 'requires e-commerce' : 'does not require e-commerce';
                let features = featureList || 'no features';

                console.log(brochure);

                if (brochure) {
                  if (evaluate !== 'unknown') {
                    return `You want a ${requirements.stack}-based ${brochure} CMS.\nI would definitely recommend ${evaluate}!\n Type 'reset' to start again.`
                  } else {
                    return `I can't match a suitable CMS with your chosen tech stack (*${requirements.stack}*).\nHopefully my knowledge base will grow as the app continues to learn!\n Type 'reset' to start again.`
                  }
                } else {
                  if (evaluate !== 'unknown') {
                    return `You want a ${requirements.stack}-based ${brochure} CMS, with ${features} and ${ecommerce} functionality.\nI would definitely recommend ${evaluate}!\n Type 'reset' to start again.`
                  } else {
                    return `You want a ${brochure} CMS, with ${features} and ${ecommerce} functionality.\nI can't match a suitable CMS with your chosen tech stack (${requirements.stack}).\nHopefully my knowledge base will grow as the app continues to learn!\n Type 'reset' to start again.`
                  }
                }
              }();

              return res.json({
                speech: speech,
                source: 'drinkabout-evaluation-cms',
                displayText: speech
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





