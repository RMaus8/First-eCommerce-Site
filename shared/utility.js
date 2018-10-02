const utility = {}

utility.handleError = function (error, req, res) {
        if(error){
            console.log(error)
            req.flash('error', 'there was a problem')
            res.redirect('back')
            return
        }
}

module.exports = utility;