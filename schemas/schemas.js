const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    referal: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Both'],
        required: true
    },
    wantPromotions: {
        type: Boolean,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    isAccountActive: {
        type: Boolean,
        required: false,
        default: false
    },
    isSuperUser: {
        type: Boolean,
        required: false,
        default: false
    },
    isVendor: {
        type: Boolean,
        required: false,
        default: false
    },
    isRider: {
        type: Boolean,
        required: false,
        default: false
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pan: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
        default: "/mediaFiles/1674535977132_chowmein.jpg"
    },
    restaurantType: {
        type: String,
        required: true
    },
    isOnline: {
        type: Boolean,
        required: false,
        default: false
    },
    isPopular: {
        type: Boolean,
        required: false,
        default: false
    },
    offerText: {
        type: String,
        required: false
    }
}, { timestamps: true })


const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    srp: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isStock: {
        type: Boolean,
        required: false,
        default: false
    },
    isPopular: {
        type: Boolean,
        required: false,
        default: false
    },
    offerText: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
        default: "/mediaFiles/1674536780038_chilli.webp"
    },
    foodType: {
        type: String,
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant',
        required: true
    }
}, { timestamps: true })

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    modeOfPayment: {
        type: String,
        required: true
    },
    orderStatus:{
        type:String,
        required:false,
        default:'Placed',
        enum:['Placed','Accepted','Delivered','Picked','Operational Issue','Pending Order','Determined','Undetermined','Cancelled By Restaurant','Cancelled By Rider', 'Cancelled By Customer', 'Cancelled By Admin', 'Cancelled By SuperUser','Rejected By Admin','Rejected By Super User']
    },
    tax: {
        type: Number,
        required: false
    },
    deliveryCharge: {
        type: Number,
        required: false
    },
    discount: {
        type: Number,
        required: true
    },
    surgeCharge: {
        type: Number,
        required: true
    },
    orderValue: {
        type: Number,
        required: true
    },
    orderDetails: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId, ref: 'Menu',
                required: true
            },
            restaurant: {
                type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant',
                required: true
            },
            qty: {
                type: Number,
                required: true
            }
        }
    ]
},
    
    { selectPopulatedPaths: false }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 12)
    }
    next();
})

userSchema.methods.generateAuthToken = async function () {
    const token = await jwt.sign({ id: this._id.toString(), isAccountActive: this.isAccountActive, isAdmin: this.isAdmin, isSuperUser: this.isSuperUser, isVendor: this.isVendor, isRider: this.isRider }, 'iambunnyandiloveblackcolorbecauseihateblackcolorbecauseiaminwhiteandiamsinglecoreprocessortaskcapable');
    this.tokens = await this.tokens.concat({ token: token });
    await this.save()
    return token
}

module.exports = { userSchema, restaurantSchema, menuSchema, orderSchema }