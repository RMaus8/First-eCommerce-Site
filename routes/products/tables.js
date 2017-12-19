var mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    middleware = require("../../middleware"),
    path = require("path"),
    User = require("../../models/user"),
    Table = require("../../models/table");
    
//create the multer storage space
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, callback){
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

//create the upload var to upload images
const upload = multer({
    storage: storage, //for the storage: use our storage var
    // limits: {fileSize: 1000000}, //limit picture size to 1 mb
    fileFilter: function(req, file, callback){
        checkFileType(file, callback) //call function and then define it below
    }
}).single("image");

//function to check for filetypes
function checkFileType(file, callback){
    //allowed ext
    var filetypes = /jpeg|jpg|png|gif/;
    //check ext
    var extName = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    var mimetype = filetypes.test(file.mimetype);
    //check that both are true
    if(mimetype && extName){
        return callback(null, true)
    } else {
        callback("Error: Images Only")
    }
}

router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Table.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allTables){
            if(err){
                console.log(err);
            } else {
                Table.count({name: regex}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        if(allTables.length < 1){
                            noMatch = "No products match that query, please try again.";
                        }
                        res.render("products/tables/index", {
                            products: allTables,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search
                        });
                    };
                })
            }
        });
    } else {
        Table.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allTables){
            if(err){
                console.log(err)
            } else {
                Table.count({}).exec(function (err, count){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("products/tables/index", {
                            products: allTables,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: false
                            
                        });
                    };
                });
            }
        });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;