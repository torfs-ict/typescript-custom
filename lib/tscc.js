var fs = require('fs');
var path = require('path');
var glob = require('glob');

var handled = {};

/**
 * Walk up all folders and discover `tsconfig.json` files.
 */
function handleRecipeFiles(folderPath) {
    if (handled[folderPath]) {
        return;
    }
    handled[folderPath] = true;

    handleRecipeFile(path.join(folderPath, 'tsconfig.json'));
    handleRecipeFiles(path.dirname(folderPath));
}

/**
 * Given a recipe is found at `recipePath`, create a `tsconfig.json` sibling file with the glob resolved.
 */
function handleRecipeFile(recipePath) {
    var contents = null;
    try {
        contents = fs.readFileSync(recipePath);
    } catch (err) {
        // Not finding a recipe is OK
        return;
    }

    var config = null;
    try {
        config = JSON.parse(contents.toString());
    } catch (err) {
        // Finding a recipe that cannot be parsed is a disaster
        console.log('Error in parsing JSON for ' + recipePath);
        process.exit(-1);
    }

    // Determine the glob patterns
    var filesGlob = ['**/*.ts'];
    if (typeof config.filesGlob === 'string') {
        filesGlob = [config.filesGlob];
    } else if (Array.isArray(config.filesGlob)) {
        filesGlob = config.filesGlob;
    }

    var resultConfig = {};
    for (var prop in config) {
        resultConfig[prop] = config[prop];
    }
    resultConfig.files = findFiles(recipePath, filesGlob);

    var resultTxt = JSON.stringify(resultConfig, null, '  ');
    var resultPath = path.join(path.dirname(recipePath), 'tsconfig.json');
    fs.writeFileSync(resultPath, resultTxt);
    console.log('Updated ' + resultPath);
}

function findFiles(recipePath, filesGlob) {
    var folderPath = path.dirname(recipePath);

    var result = [];
    filesGlob.forEach(function(globPattern) {
        result = result.concat(glob.sync(globPattern, {
            cwd: folderPath
        }));
    });
    return result;
}

handleRecipeFiles(process.cwd());

require('./include');