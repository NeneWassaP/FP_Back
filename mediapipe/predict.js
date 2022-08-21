const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');
const multer  = require('multer');
const upload = multer({ dest: './collect' });
const fs = require('fs');
const path = require('path');

if (!fs.existsSync("./collect")){
    fs.mkdirSync("./collect");
}

fs.readdir("./collect", (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join("./collect", file), err => {
        if (err) throw err;
      });
    }
  });

//const holistic = require('@mediapipe/holistic/holistic');

//console.log(holistic.Solution())


router.post('/predict',upload.single('image'), (req, res) => {
    console.log(req.file, req.body);
    return res.json({ message: "success" });
})

/*{
    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn('python', ['landmark.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend)
    });
}*/
 



module.exports = router;

