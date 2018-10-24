const utility = {}

utility.handleError = function (error, req, res) {
        if(error){
            console.log(error)
            req.flash('error', 'there was a problem')
            res.redirect('back')
            return
        }
}

utility.createProdArray = function (prodObject) {
    let prodArray = [];
    let clearanceArray = [];
    prodObject.forEach(function(product){
            prodArray.push(product);
            if(product.clearance === true){
                clearanceArray.push(product);
            }
        });
        prodArray.sort(function(a,b){
            return b.timesPurchased - a.timesPurchased;
        });
    return {
        prodArray: prodArray,
        clearanceArray: clearanceArray
    }
}

module.exports = utility;