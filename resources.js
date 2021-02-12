//Required Libraries
var fs = require('fs');

//Find a Webpage 
exports.findPage = function(req, res, pathname) {

    //lookup the requested webpage
    switch (pathname) {

        //Config page for setting up the overlay
        case '/config':
            //HTML content
            res.writeHead(200, { 'Content-Type': 'text/html' });
            //Read the HTML
            fs.readFile('webpages/config.html', null, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('File not found!');
                } else {
                    res.write(data);
                }
                res.end();
            });
            break;

        //Overlay page
        default:
            //HTML content
            res.writeHead(200, { 'Content-Type': 'text/html' });
            //Read the HTML
            fs.readFile('webpages/overlay.html', null, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('File not found!');
                } else {
                    res.write(data);
                }
                res.end();
            });
            break;
    }
}