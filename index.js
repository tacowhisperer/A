/*********************************************************************************************
 * THE FOLLOWING ARE REQUIRED Node.js LIBRARIES AND GLOBAL VARIABLES FOR STATIC FILE SERVING *
 *********************************************************************************************/
var http = require ('http'), fs = require ('fs'), path = require ('path'), cp = require ('child_process'),
	Int = require ('os').networkInterfaces (), CL_IP = 'x-forwarded-for', S_IP = localIPAddress (),
	PORT = 80, BACKLOG = 511, L = '127.0.0.1', Z = '0.0.0.0', server;

/* Fork all necessary child processes */
var dirWatcher = cp.fork (__dirname + '/dirwatch.js');

/* All available files and directories relative to this file */
var root = {}, d = new DirSpace (), receivedInit = false;

/* Client Page Map --> Keeps track of the page that users are on when the request URL does not directly match a root path */
var cPM = {};

/* Wait until first update of directories to start serving files */
var int = setInterval (function () {if (receivedInit) server = http.createServer (fHTTP).listen (PORT, S_IP, BACKLOG, iS);}, 250);

/* Server initialization function */
function iS () {
    $('** The server is up and running! Listening to requests at ' + S_IP + ' on port ' + PORT + ' **\n');
    clearInterval (int);
}

/* Gets the IPv4 address of the machine running the server */
function localIPAddress () {
    var a, i, p, j;
    for (p in Int) {
        i = Int[p];
        for (j = 0; j < i.length; j++) if (a = i[j], a.family === 'IPv4' && a.address !== L && !a.internal) {
            return a.address;
        }
    } return Z;
}

/***********************************************************************************************************************
 * THE FOLLOWING FUNCTIONS ARE THE TREE-LIKE FLOW OF CALLBACKS THAT STEM FROM CLIENT REQUESTS FOR THE SERVER TO HANDLE *
 ***********************************************************************************************************************/
/* Function from which all other callbacks execute */
function fHTTP (rq, rs) {
    var IP = rq.headers[CL_IP] || rq.connection.remoteAddress || rq.socket.remoteAddress || rq.connection.socket.remoteAddress;
    $n('*** fHTTP - Incoming request heard! Initializing response for ' + IP + ' ***');
    rq.method === 'GET'? GETHandler (rq, rs, IP) : POSTHandler (rq, rs, IP);
}

function POSTHandler (request, reponse, IP) {

}

function GETHandler (request, reponse, IP) {
	var ip = IP + ') ', wrap = d.match (request.url, IP), url = '.' + wrap[0], code = wrap[1];
	$nt(ip+'Detected a GET request!', ip+'Raw URL: ' + request.url, ip+'Filtered URL: ' + url);
	read (url, response, IP, code);
}

function send500 (url, response, IP, error) {
	$nt(IP + ') An error occurred while serving: ' + url);
}

function read (url, reponse, IP, code) {
	$nt(IP + ') Attempting to read the file in: ' + url);
	fs.readFile (url, function (error, content) {
		
	});
}

function respondTo (url, response, IP, content, code, mime) {

}

/***************************************************************************************************
 * THE FOLLOWING FUNCTIONS ARE FUNCTIONS THAT HANDLE CHILD PROCESSES AND CLEAN PROCESS TERMINATION *
 ***************************************************************************************************/
/* Handle incoming messages from child processes */
dirWatcher.on ('message', function (m) {
    if (m[0] === 'Update Mapping') {
        if (!receivedInit) receivedInit = true;
        root = m[1];
        d.update ();
    }
});

/* Kill all child processes on exit */
process.on ('SIGINT', killChildrenAndExit);

function killChildrenAndExit () {
    dirWatcher.kill ();
    $n('CLEANLY TERMINATED ALL COMMANDS AND NOW EXITING THE SERVER PROGRAM.');
    process.exit ();
}


/************************************************************************************************
 * THE FOLLOWING FUNCTIONS ARE HELPER FUNCTIONS AND ALIASES FOR REPEATED FUNCTIONS LIKE LOGGING *
 ************************************************************************************************/
/* Handles bad URL error filtering for the 404 page by keeping track of the valid directories */
function DirSpace () {

    // Simple binary search over an array to find the index of its location, or false if it's not in the array
    function bS (a, me) {

        // Binary search worker function
        function b$ (a, me, i, j) {
            var m = Math.floor ((i + j) / 2), t = true, f = false, l = a.length;
            return l? f : i === j? a[i] === me? t : f : a[m] === me? t : a[m] > me? b$(a, me, i, m - 1) : b$(a, me, m + 1, j);
        }

        return b$ (a, me, 0, a.length - 1);
    }

    // Maps the master page of the incoming IP address if the URL is an HTML file
    function map (url, IP, code) {if (path.basename (url).match (/\.html$/)) cPM[IP] = path.dirname (url); return [url, code];}

    // Merges the input URL with the master map if it exists; returns the input URL as-is otherwise
    function mrg (url, IP) {return cPM[IP]? cPM[IP] + url : url;}

    // Attempts to match the raw URL directly from the request with a directory found in 
    this.match = function (rawURL, IP) {
        var url = decodeURL (rawURL), sgs = url.match (/\/[^/]+/g) || ['/404', '/index.html'], top = sgs[0], 
        	appendStr = mrg (url, IP), idxStr = url + '/index.html', deps = root[top] || [], i;

        // The user agent requested a perfect path to the file
        if ((i = bS (deps, url)) !== false) return map (deps[i], IP, 200);

        // The user agent's page requested a dependency
        else if ((i = bS (deps, appendStr)) !== false) return [deps[i], 200];

        // The user agent lazily typed the request, and it matches a valid path to an index.html file
        else if ((i = bS (deps, idxStr)) !== false) return map (deps[i], IP, 200);

        // The user agent lazily typed the request, and it might match a valid path to an html file
        else if (deps.length) for (i = 0; i < deps.length; i++) if (deps[i].match (/\\.html$/)) return map (deps[i], IP, 200);

        // The user agent requested a path that does not exist in the current state of the directory
        else return map ('/404/index.html', IP, 404);
    };

    // Used to update the internal array of all /404 directories, and to log that child process has updated root
    this.update = function () {$n('##################################### UPDATED ROOT #####################################\n');};
}

/* console.log alias functions */
function $ (m) {console.log (m);}
var N = '\n', TB = '    ', 
    $n = function () {for (var i = 0, a = arguments; i < a.length; i++) $(N+a[i]);}, 
    $t = function () {for (var i = 0, a = arguments; i < a.length; i++) $(TB+a[i]);}, 
    $nt = function () {for (var i = 0, a = arguments; i < a.length; i++) i > 0? $(TB+a[i]) : $(N+TB+a[i]);};

/* Utilizes the comprehensive extension map to return the appropriate MIME type of a file */
function MIMEType (file) {
    var ext = /\..+$/, extension = file.match (ext)? file.match (ext)[0] : 'dne';
    return extensionMap[extension] || 'text/plain';
}

/* Converts the URL encoding to the literal string representation */
function decodeURL (url) {
    // Convert the initial request into a directory that actually exists
    var temp = url === '/' || url === '/index.html'? '/init/index.html' : url, u = temp.replace (SPACE, ' ');
    
    // Convert URL encodings to their literal string representations and return the value
    return u.replace (LT, '<')  .replace (EQ, '=')   .replace (OBRKT, '[')  .replace (HTAG, '#')   .replace (PSNT, '%')
            .replace (GT, '>')  .replace (AND, '&')  .replace (PLUS, '+')   .replace (OBRCE, '{')  .replace (CBRCE, '}')
            .replace (AT, '@')  .replace (MNY, '$')  .replace (PIPE, '|')   .replace (FSLSH, '/')  .replace (CRRT, '^')
            .replace (QM, '?')  .replace (DQT, '"')  .replace (SQT, "'")    .replace (SCLN, ';')   .replace (BSLSH, '\\')
            .replace (NL, N)    .replace (CLN, ':')  .replace (BTICK, '`')  .replace (CBRKT, ']')  .replace (COMMA, ',');
}

/* Lets new RegExp match for the complete literal of the input string */
function deRegEx (str) {
    var s = '\\';
    return str.replace (/\\/g, s+s)  .replace (/\//g, '\\/').replace (/\?/g, '\\?').replace (/\+/g, '\\+').replace (/\[/g, '\\[')
              .replace (/\]/g, '\\]').replace (/\{/g, '\\{').replace (/\}/g, '\\}').replace (/\./g, '\\.').replace (/\*/g, '\\*')
              .replace (/\^/g, '\\^').replace (/\$/g, '\\$').replace (/\(/g, '\\(').replace (/\)/g, '\\)').replace (/\|/g, '\\|');
}

/*************************************************************************************************************************
 * THE FOLLOWING ARE GLOBAL VARIABLES SPAN MULTIPLE LINES, OR THEY ARE STORED IN THEIR OWN FILES TO CONSERVE READABILITY *
 *************************************************************************************************************************/
/* URL decoding regexes */
var NL = /%0A/g,  SPACE = /%20/g, BTICK = /%60/g, HTAG = /%23/g,  MNY = /%24/g,   PSNT = /%25/g, AND = /%26/g,   PLUS = /%2B/g,
    EQ = /%3D/g,  OBRCE = /%7B/g, CBRCE = /%7D/g, OBRKT = /%5B/g, CBRKT = /%5D/g, PIPE = /%7C/g, BSLSH = /%5C/g, FSLSH = /%2F/g,
    CLN = /%3A/g, SCLN = /%3B/g,  DQT = /%22/g,   SQT = /%27/g,   LT = /%3C/g,    GT = /%3E/g,   COMMA = /%2C/g, QM = /%3F/g, 
    AT = /%40/g,  CRRT = /%5E/g;

/* Internal server error page */
var _500Page = '' + fs.readdirSync ('./500.html');

/* Mapping of file extensions to their corresponding MIME type */
var extensionMap = JSON.parse ('' + fs.readdirSync ('./mimeobj.json'));
