var fs = require('fs');

process.stdout.write = (function(write) {
    return function(string, encoding, fd) {
        if (string.substring(0, 8) == 'TSFILE: ') {
            var filename = string.substring(8).trim();
            console.log('Processing ' + filename + ' for include statements');
            var code = fs.readFileSync(filename).toString();
            code = code.replace(/(\/\/#\s+include\s?=\s?"([^"]+)")/mg, function() {
                return fs.readFileSync(process.cwd() + '/' + arguments[2]).toString();
            });
            fs.writeFileSync(filename, code);
        } else {
            write.apply(process.stdout, arguments);
        }
    }
})(process.stdout.write);

require('../node_modules/typescript/lib/tsc');