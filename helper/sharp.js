const sharp = require("sharp")
const fs = require("fs")
const compressImg = async (file, width, height) =>{
    await sharp(file)
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize(width, height)
    .png({ quality: 90, force: true });
   

}

module.exports = compressImg