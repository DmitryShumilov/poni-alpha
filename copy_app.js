const fs=require('fs'); fs.writeFileSync('src/App.js', fs.readFileSync('App.js.template','utf8')); console.log('App.js created');  
