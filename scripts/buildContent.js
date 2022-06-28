const path = require('path');
const fs = require('fs-extra');
const propertiesParser = require('properties-parser');
const _ = require('lodash');

const getMessages = (
  basePath = path.resolve('./', 'locales/US/en'),
  messages = {}
) => {
  const files = fs.readdirSync(basePath);
  files.forEach((file) => {
    const [fileKey, extension] = file.split('.');
    if (/properties/.test(extension)) {
      const properties = propertiesParser.read(`${basePath}/${file}`);
      const parsedResult = Object.keys(properties).reduce((acc, prop) => {
        _.set(acc, prop, properties[prop]);
        return acc;
      }, {});
      messages[fileKey] = parsedResult;
    } else {
      messages[fileKey] = getMessages(`${basePath}/${file}`, {});
    }
  });
  return messages;
};

// Read all ./locales folders by country + locale
//
// For each locale, generate the JSON representation of content e.g.
// >locales/US/en/
// >> login.properties
// >> common.properties
// >> nestedDir/nested.properties

const buildJSONContent = (sourceFolder, outputPath) => {
  const countries = fs.readdirSync(path.resolve('./', sourceFolder));

  countries.forEach((country) => {
    const locales = fs.readdirSync(
      path.resolve('./', `${sourceFolder}/${country}/`)
    );

    locales.forEach((locale) => {
      const messages = getMessages(
        path.resolve('./', `${sourceFolder}/${country}/${locale}`)
      );
      fs.outputJsonSync(
        path.resolve('./', `${outputPath}/${country}/${locale}.json`),
        messages,
        {
          spaces: 2,
        }
      );
    });
  });
  console.log(`Content build successful, output to ${outputPath}`);
};

buildJSONContent('source-content/mobile', 'build-content/mobile');
buildJSONContent('source-content/web', 'build-content/web');
