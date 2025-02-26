const multer=require('multer');
const path=require('path');
const crypto=require('crypto');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/images'));
    },
    filename:(req,file,cb)=>{
      crypto.randomBytes(16,(err,bytes)=>{
        cb(null,bytes.toString('hex') + path.extname(file.originalname));
      })
    }
});
const upload = multer({ storage: storage })
    
module.exports=upload