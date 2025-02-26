
const express = require('express');
const app = express();
const path = require('path');
const adminmodel = require('./models/admin');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const usermodel = require('./models/user');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const upload = require('./utils/multer');
const postmodel = require('./models/post');
const deliverymodel = require('./models/delivery');
const { log } = require('console');
const { ADDRGETNETWORKPARAMS } = require('dns');
const socketio=require('socket.io');
const user = require('./models/user');
const server = require('http').createServer(app);
const io=socketio(server);
const db=require('./models/deliveryboy');
require('dotenv').config();

// Set view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(cookieParser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/usertrack/:id', async(req, res) => {
    id=req.params.id;
    const lastLocation = await usermodel.findOne({ _id: id });
    res.render('usertrack', { lastLocation:{latitude:lastLocation.latitude,longitude:lastLocation.longitude} });
  });
  
  io.on('connection', (socket) => {
    socket.on('send-location', async (data) => {
      
      const newLocation = await usermodel.findOneAndUpdate({email:data.email},{latitude:data.latitude,longitude:data.longitude});
    
      io.emit('receive-location', newLocation);
    });
  });
  app.get('/deliverytrack/:id', async(req, res) => {
    id=req.params.id;
    const lastLocation = await usermodel.findOne({ _id: id });
    res.render('deliverytrack', { lastLocation:{latitude:lastLocation.latitude,longitude:lastLocation.longitude} });
  });

app.post('/login',async (req, res) => {
    let{username,email,mobile,password}=req.body;
    let user=await usermodel.findOne({email:email});
   let users=await usermodel.findOne({mobile:mobile});
    
    if(user || users){
        req.flash('error','User already exists');
        return res.redirect('/');
    }
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
            if(err) throw err;
            password=hash;
            let user=await usermodel.create({
                username,
                email,
                mobile,
                password:hash
            });
            let token=jwt.sign({email},'suhanamin')
            res.cookie('token',token);
            let post1=await postmodel.find();
            res.render('home',{post1,user});
        })
    })
  
    
})
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register',async (req, res) => {
    let{email,password}=req.body;
    let admin=await adminmodel.findOne({email:email});
    let d=await db.findOne({email:email});
    if(admin){
    bcrypt.compare(password,"suhan1234",(err,result)=>{
        if (result) {
            res.render('adminhome');
        }
        else{
             req.flash('error','Wrong credentials');
                return res.redirect('/register');
       
        }
   })
}
else if(d){
    bcrypt.compare(password,d.password,(err,result)=>{
        if (result) {
            res.redirect('/delivery');
        }
        else{
             req.flash('error','Wrong credentials');
                return res.redirect('/register');
       
        }
   })
}
else{

    let user=await usermodel.findOne({email:email});
    let post1=await postmodel.find();
   
  if(!user){
   
   
        req.flash('error','Wrong credentials');
        return res.redirect('/register');
    
    }
    
    bcrypt.compare(password,user.password,(err,result)=>{
       
        if(result){
            let token=jwt.sign({email,},'suhanamin')
            res.cookie('token',token);
            res.render('home',{post1,user});
           
     }
        else{
            req.flash('error','Wrong credentials');
            return res.redirect('/register');
        }
    })
}



})

app.get('/adminhome', (req, res) => {
    res.render('adminhome');
});
app.get('/upload', (req, res) => {
    res.render('adminpost');
});
app.get('/update', async(req, res) => {
    let post1=await postmodel.find();
    res.render('adminupdate',{post1});
})

app.post('/submit',upload.single('filename'),async (req, res) => {
    let{title,price}=req.body;
    
    let post=await postmodel.create({
        filename:req.file.filename,
        title,
        price
    });
   
   res.render('adminpost');
})

app.get('/selectitem',async (req, res) => {
    let post1=await postmodel.find();   
    res.render('selection',{post1});
   
    
})

app.get('/cart',islogedIn,async (req, res) => {
    let user=await usermodel.findOne({email:req.user.email}).populate('cart');
 res.render("cartpage",{user:user.cart})
})
    
app.post('/buy', islogedIn, async (req, res) => {
    let { item, quantity, price } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    let post= await postmodel.findOne({title:item});
   let delivery = await deliverymodel.create({
        userid:user._id,
     item,
     pic:post.filename,
    quantity,
      price
    });
 
    user.cart.push(delivery._id);
    await user.save();
    res.redirect('/selectitem')
  
  });
app.get('/orders',islogedIn,async (req, res) => {
    let {email}=req.user;
    let user=await usermodel.findOne({email:email})
    .populate('orders')
    .populate('myorders');
    
    res.render('orderpage',{user:user,user1:user.myorders});
  
  })

  

  
  app.get('/userorder', async (req,res)=> {
   let users=await usermodel.find().populate('orders');
   res.render('userorder',{users});
  
 
   
  })
  io.on('connection', (socket) => {
    socket.on('sendd-location',  (data) => {
        io.emit('receivedd-location', data);
    });
  })

  
  
  app.get('/checkout',islogedIn,async (req, res) => {
    let{email}=req.user;
    let user=await usermodel.findOne({email:email}).populate('cart');
    res.render("checkout",{user})
  })
  app.post('/payment',islogedIn,async (req, res) => {
    let {email}=req.user;
    let{username,mobile,state,address,payment,pincode}=req.body
    let user=await usermodel.findOne({email:req.user.email}).populate('cart');
    user.orders.push(...user.cart);
    await user.save();
    let j=user.cart.splice(0,user.cart.length);
    let users=await usermodel.findOneAndUpdate({email:email},{username,mobile,state,payment,address,pincode,$pull:{cart:j}});
    await user.save()
    res.redirect('/home')
  })
  
app.get('/delivery', async (req, res) => {
    let users=await usermodel.find().populate('orders');
    
    res.render('delivery',{users});
    
}); 
app.get('/delivery/:id', async (req, res) => {
    let id=req.params.id;
    let user=await usermodel.findOne({_id:id}).populate('orders');
    user.myorders.push(...user.orders);
    await user.save();
    let j=user.orders.splice(0,user.orders.length);
    let users=await usermodel.findOneAndUpdate({_id:id},{$pull:{orders:j}});
    await user.save()
    res.redirect('/delivery')

}
    )
app.get('/deleteItem/:id',islogedIn, async (req, res) => {
    let{email}=req.user;
    let user=await usermodel.findOne({email:email});
    let id=req.params.id;
    user.cart.splice(user.cart.indexOf(id),1);
    await user.save();
    res.redirect('/cart');
})
app.get('/edit/:id',async (req, res) => {
    let post1=await postmodel.findOne({_id:req.params.id});
    res.render('adminedit',{post1});
})

app.post('/sub/:id',async (req, res) => {
    let{title,price}=req.body;
    
   let post1=await postmodel.findOneAndUpdate({_id:req.params.id},{title,price});
    res.redirect('/update')
})
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});
let stored={message:''};


app.post('/abutton',async (req, res) => {
   
 stored=req.body

})
app.get('/get-data', (req, res) => {
    res.json(stored);
  });

  app.post('/profile',islogedIn,async (req, res) => {
   let {email}=req.user;
   let post1=await postmodel.find();
   let{username,mobile,state,address,pincode}=req.body
   let user=await usermodel.findOneAndUpdate({email:email},{username,mobile,state,address,pincode})
    
   res.render('home',{user,post1})
    

  })
  app.get('/home',islogedIn,async (req,res)=>{
    let user=await usermodel.findOne({email:req.user.email});
    let post1=await postmodel.find();
   
    res.render('home',{user,post1})
  })

  app.get('/delete/:id',async (req,res)=>{
    let id=req.params.id;
let post1=await postmodel.findOneAndDelete({_id:id});
res.redirect('/update')
  })
function islogedIn(req, res, next) {
    if(req.cookies.token===''){
        res.redirect('/register');
    }
    else{
        let data=jwt.verify(req.cookies.token,'suhanamin');
        req.user=data;
    }
    next();
}

server.listen(3000)
