const https = require('https');

/*
    HTTP GET function
*/
function Get(urlHost, urlPath) {
    
    // return Promise -> async 
    return new Promise(((resolve, reject) => {
        
    // request options
    var options = {
        host: urlHost,
        port: 443,
        path: urlPath,
        method: 'GET',
    };
    
    // make request, fetch and parse data
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';
    
      response.on('data', (chunk) => {
        returnData += chunk;
      });
    
      response.on('end', () => {
          console.log('GET: ' + urlPath);
          console.log('Data end GET: ' + returnData);
        resolve(JSON.parse(returnData));
      });
    
      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
    }));
}

function Post(urlHost, urlPath, postData){
    
    const data = JSON.stringify(postData);
    console.log("MAKING HTTPS POST "+ data.toString('utf8', 0, data.length) )
    // return Promise -> async 
    return new Promise(((resolve, reject) => {
    
        // request options
        var options = {
            host: urlHost,
            port: 443,
            path: urlPath,
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
            }
        };

        
        const req = https.request(options, res => {
            
            res.setEncoding('utf8');
            let returnData = '';

            res.on('data', (chunk) => {
                returnData += chunk;
            });
            
            res.on('end', () => {
                console.log(`response: ${returnData}`)
                resolve(returnData);
            });
              
            res.on('error', (error) => {
                console.log(`response: ${res}`)
                reject(error);
            });
              
        })
        
        req.on('error', error => {
            console.error(error)
        })
        
        req.on('end', ()  => {
            console.log("i just sent " + data.toString('utf8', 0, data.length))
        })
    
        req.write(data.toString('utf8', 0, data.length))
        req.end()
    }));
}

module.exports = { 
    Get: Get,
    Post: Post
}