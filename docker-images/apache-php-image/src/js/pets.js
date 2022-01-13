$(function(){
   console.log("Loading pets");


   function loadPets() {
      $.getJSON("/pets/", function( pets ) {
         console.log(pets);
            var message = "No pets here.";
            var color = "black";
            if ( pets.length > 0 ) {
               message = pets[0].animal;
               color = pets[0].color;
            }
            $(".pets").text(message);
            $(".pets").css('color', color);
      });
   };

   loadPets();
   setInterval( loadPets, 2000 );
});
