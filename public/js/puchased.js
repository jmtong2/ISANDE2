$(document).ready ( () => {
    $('#purchase').click( () => {

        const purchasedIngredient = $('#purchasedIngredient').val();
        const qty = $('#qty').val();


        if(purchasedIngredient == '' || qty == ''){
            $('#purchase').prop('disabled', false);

        }
         else {
            $.get("/addPurchased",
                {
                    purchasedIngredient: purchasedIngredient,
                    qty: qty
                },
                result => {
                $('body').load('/');
                $('#name').val("");
                $('#refno').val("");
                $('#amount').val("");
                });
                    
        }
});


