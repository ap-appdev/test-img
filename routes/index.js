const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const getNameFile = function (dir) {
  let name = 0;
  let files = fs.readdirSync(dir);
  if(files.length) files.forEach((file) => {
    if(!fs.statSync(dir + '/' + file).isDirectory()) {
      let n = +file.split('.')[0];
      if(n > name) name = n
    }
  });
  return +name + 1
};

let destinationDefault = './public/users';
let destination = './public/users';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = req.body.dest ? '/' + req.body.dest : '';
    fs.mkdir(destinationDefault + dest, { recursive: true }, (err) => {
      if (!err) destination = destinationDefault + dest;
      else destination = destinationDefault;
      cb(null, destination)
    });
  },
  filename: function (req, file, cb) {
    let name = getNameFile(destination);
    const ext = path.extname(file.originalname);
    destination = './public/users';
    cb(null, name + ext)
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  fileFilter,
  limits: {
    fileSize: 20000000
  },
  storage: storage
}).single('img');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', upload, function(req, res) {
  let url = req.file.destination + '/' + req.file.filename;
  Jimp.read(url, (err, image) => {
    if (err) throw err;
    image.resize(256, 256).greyscale().write(url);
  });
  res.json({
    status: 1,
    url: url.replace('./public', '')
  })
});

module.exports = router;
