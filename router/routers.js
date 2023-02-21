const express = require('express');
const multer = require('multer');
const router = new express.Router();
const { User, Restaurant, Menu, Order } = require('../models/models');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth')


const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, './mediaFiles') },
    filename: function (req, file, cb) { cb(null, Date.now() + '_' + file.originalname) }
});

const upload = multer({ storage: storage });


//Register New User
router.post('/api/registeruser', upload.single('myFile'), async (req, res) => {
    try {
        // console.log(req.body);
        // console.log(req.file);
        const image = req.file ? '/mediaFiles/' + req.file.filename : null;
        const toSave = User({ ...req.body, image });
        //Adding a middleware here for storing token in DB
        // const token = await toSave.generateAuthToken();
        console.log('before save')
        const results = await toSave.save();
        console.log('data registered')
        if (results) {
            res.status(200).send({ message: 'Register Successfully' })
        }
        else {
            res.status(400).send({ message: 'Failed to Create User' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Log In User
router.post('/api/verifyuser', async (req, res) => {
    try {
        console.log(req.body,41)
        const isUserExist = await User.findOne({ mobile: req.body.mobile });
        if (isUserExist) {
            const isPasswordMatched = await bcrypt.compare(req.body.password, isUserExist.password);
            if (isPasswordMatched) {
                const token = await isUserExist.generateAuthToken()
                console.log('Res Sent Successfully')
                res.status(200).cookie('authToken', token, {
                    httpOnly: true,
                    expires: new Date(Date.now() + 600000)
                }).send({ message: 'User Authenticated Successfully' })
            }
            else {
                res.status(400).send({ message: 'Incorrect Password' })
            }
        }
        else {
            res.status(400).send({ message: 'Mobile Number Does not Exist' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
});

//Get All Users
router.get('/api/allusers',async(req,res)=>{
    try {
        const records = await User.find().select({tokens:0});
        
        if(records){
            res.status(200).send(records)
        }
        else{
            res.status(400).send({message:'Bad Request or Empty Collection'})
        }
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }
})

//Get User Profile
router.get('/api/userProfile', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.USER_ID }).select({ tokens: 0, __v: 0, password: 0 })
        if (user) {
            res.status(200).send({ message: 'Profile Fetched Successfully', user: [user] })
        }
        else {
            res.status(400).send({ message: 'Failed to Fetched User Profile' });
        };
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

//Register New Restaurant
router.post('/api/restaurant', upload.single('myFile'), async (req, res) => {
    try {
        const image = req.file ? '/mediaFiles/' + req.file.filename : null;
        const toSave = Restaurant({ ...req.body, image });
        const results = await toSave.save();
        if (results) {
            res.status(201).send({ message: 'Restaurant Created Successfully' })
        }
        else {
            res.status(400).send({ message: 'Failed to Create Restaurant' })
        }
        // console.log(req.body)
        // console.log(req.file)
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Get All Restaurants
router.get('/api/restaurant', async (req, res) => {
    try {
        const results = await Restaurant.find()
        if (results) {
            res.status(200).send(results)
        }
        else {
            res.status(400).send({ message: 'Failed to Fetch Restaurants' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Create New Menu
router.post('/api/menu', upload.single('myFile'), async (req, res) => {
    try {
        // console.log(116, req.body);
        // console.log(117, req.file)
        const image = req.file ? '/mediaFiles/' + req.file.filename : null;
        const toSave = new Menu({ ...req.body, image });
        const results = await toSave.save();
        if (results) {
            res.status(201).send({ message: 'Menu Created Successfully' })
        }
        else {
            res.status(400).send({ message: 'Failed to create Menu' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Get All Menu
router.get('/api/menu', async (req, res) => {
    try {
        const results = await Menu.find();
        if (results) {
            res.status(200).send(results)
        }
        else {
            res.status(400).send({ message: 'Failed to Fetch Menus' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Place new Order
router.post('/api/placeorder', auth, async (req, res) => {
    try {
        const userId = req.USER_ID;
        // const test =  {...req.body,user:userId};
        // console.log(152,test);
        const toSave = Order({ ...req.body, user: userId });
        const results = await toSave.save();
        if (results) {
            res.status(201).send({ message: 'Order Placed Successfully', output: results })
        }
        else {
            res.status(400).send({ message: 'Failed to Place Order' })
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

//Get All Orders
router.get('/api/allorders', async (req, res) => {
    try {
        const data = await Order.find().populate({ path: 'user', select: { tokens: 0 } }).populate('orderDetails.item').populate('orderDetails.restaurant')
        if (data) {
            res.status(200).send(data);
        }
        else {
            res.status(400).send({ message: 'Failed to Fetch All Orders' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

//Get Order By User Auth
router.get('/api/activeorder', auth, async (req, res) => {
    try {
        const userId = req.USER_ID;
        console.log(185,userId)
        const data = await Order.find({user:userId}).populate({path:'orderDetails.item'}).populate({path:'orderDetails.restaurant'}) ;
        if(data){
            res.status(200).send(data);
        }
        else{
            res.status(400).send({message:'Failed to Fetche Data'});
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

//Get User Order Details by Order ID
router.get('/api/orderdetail/:id', async (req, res) => {
    try {
        const _id = req.params.id
        // console.log(202,_id)
        const data = await Order.findById({_id:_id}).populate({path:'orderDetails.restaurant'}).populate({path:'orderDetails.item'}).populate({path:'user',select:{tokens:0,password:0}}) ;
        if(data){
            res.status(200).send(data);
        }
        else{
            res.status(400).send({message:'Failed to Fetch Data'});
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
})

router.get('/api/testapi',async(req,res)=>{
    try {
        res.status(200).send({message:'Api Test Successfully Done'})
    } catch (error) {
        res.status(500).send({message:'Internal Server Error'})
    }
})

module.exports = router





// showDialog(
//     context: context,
//     builder: (ctx) => AlertDialog(
//       title: const Text("Alert Dialog Box"),
//       content: const Text("You have raised a Alert Dialog Box"),
//       actions: <Widget>[
//         TextButton(
//           onPressed: () {
//             Navigator.of(ctx).pop();
//           },
//           child: Container(
//             color: Colors.green,
//             padding: const EdgeInsets.all(14),
//             child: const Text("okay"),
//           ),
//         ),
//       ],
//     ),
//   );
// },
// child: const Text("Show alert Dialog box"),
// ),