$(document).ready(function() {
    
    
    $("#aRight").on("click", function(e){
        let startDisplay = $("#imageStart").css("display");
        if (startDisplay === "block") {
            $("#imageStart").css("display", "none")
            $("#imageSecond").css("display", "inline-block")
        } else {
            $("#imageSecond").css("display", "none")
            $("#imageFinish").css("display", "inline-block")
        }
    })
    
    $("#aLeft").on("click", function(e){
        let finishDisplay = $("#imageFinish").css("display");
        if (finishDisplay === "block") {
            $("#imageFinish").css("display", "none")
            $("#imageSecond").css("display", "inline-block")
        } else {
            $("#imageSecond").css("display", "none")
            $("#imageStart").css("display", "inline-block")
        }
    })
})

