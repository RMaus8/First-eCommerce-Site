var stripe = Stripe('pk_test_sNKs2EaDESoJPar6GZeCYVdo');


var elements = stripe.elements();

var $form = $("#checkout-form");

var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    width: '300px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

$form.submit(function(event) {
    event.preventDefault();
    $("#charge-error").addClass("hidden");
    $form.find("button").prop("disabled", true);
    stripe.createSource(card, {
        owner: {
            name: $("#card-name").val(),
            email: $("#email").val()
        }
    }).then(function(result) {
        if(result.error) {
            console.log(result.error);
            $("#charge-error").text(result.error.message);
            $("#charge-error").removeClass("hidden");
            $form.find("button").prop("disabled", false);
        } else {
            var token = result.token;
            console.log(token);
            // // Insert the token into the form so it gets submitted to the server:
            // $form.append($('<input type="hidden" name="stripeToken" />').val(token));
            // Send the source to your server
            stripeSourceHandler(result.source);
            // // Submit the form:
            // $form.get(0).submit()
                
        }
    });
    return false;
})

function stripeSourceHandler(source) {
  // Insert the source ID into the form so it gets submitted to the server
  var form = document.getElementById('checkout-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeSource');
  hiddenInput.setAttribute('value', source.id);
  form.appendChild(hiddenInput);

  // Submit the form
  form.submit();
}



