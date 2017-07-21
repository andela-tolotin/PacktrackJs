/*
 * Please see the included README.md file for license terms and conditions.
 */
// This file is a suggested starting place for your code.
// It is completely optional and not required.
// Note the reference that includes it in the index.html file.
/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */
// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.
function myEventHandler() { //cordova code to initializing the device
  "use strict";

  var ua = navigator.userAgent;
  var str;

  if (window.Cordova && dev.isDeviceReady.c_cordova_ready__) {
    str = "It worked! Cordova device ready detected at " + dev.isDeviceReady.c_cordova_ready__ + " milliseconds!";
  } else if (window.intel && intel.xdk && dev.isDeviceReady.d_xdk_ready______) {
    str = "It worked! Intel XDK device ready detected at " + dev.isDeviceReady.d_xdk_ready______ + " milliseconds!";
  } else {
    str = "Bad device ready, or none available because we're running in a browser.";
  }

  console.log(str);
}

// ...additional event handlers here...
function thirdPartyEmulator() {
  alert("This feature uses a third party barcode scanner plugin. Third party plugins are not supported on emulator or app preview. Please build app to test.");
}


function packageDelivery() {
  "use strict";
  var fName = "scan():";
  try {
    if (window.tinyHippos) {
      thirdPartyEmulator();
      console.log(fName, "emulator alert");
    } else {
      var baseURL = "https://packtracking.herokuapp.com/api/";
      var modalForm = $(document).find('div#signature-info'); //modalForm: the modal form for package delivery
      cordova.plugins.barcodeScanner.scan(function(result) {
          if (result.text == '') {
            return false;
          }
          alert("Scann Succeded!\n" + "Result: " + result.text + "\n");
          var packageNumber = result.text; // get the package number from the barcode scanner
          packageNumber = packageNumber.replace(/[/]/g, '');
          // var signaturePad = null;       // initialize the canvas for signature
          /* Once the package has been scanned and the user signs that the package
            has been delivered then the package number is sent to the server;
            if it has been delivered before then the user get alert; and if not 
            it gets a confirmation message that the package was successfully received and delivered.*/
          makeAjaxRequest(baseURL + 'packages/' + packageNumber + '/user', {}, 'GET')
            .done(function(res) {
              // clear prited name field
              document.getElementById('printed_name').value = '';
              if (res.status) {
                $(document).find('input[type="hidden"]#package_number').val(packageNumber); //search tracking number from the form
                var found = confirm("Please confirm the package recipient \n Recipient Name: " + res.data.name + "\n" + " Package Number: " + packageNumber); // shows confirmation dialog

                if (found) {
                  modalForm.modal('show'); // show the modal form
                }

                return false;
              }

              return alert(res.message); //alert when package has never been receive, meaning was not found in the database.

            }).fail(function(error) { //fails due ti server or network   
              // console.log('Error', error); for debugging purposes
            });
        },
        function(error) { //when the scannig fails, device failure
          alert("Scanning failed: " + error);
        }, {
          orientation: "portrait" //keeps the screen in portrait mode
        }
      );
    }
  } catch (e) {
    // console.log('Error', e); for debugging purposes
  }
}

acceptPackageDelivery(); // Accept package delivery

function acceptPackageDelivery() {
  var baseURL = "https://packtracking.herokuapp.com/api/";
  var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    penColor: 'rgb(0, 0, 0)'
  });
  var saveButton = document.getElementById('save'); //saveButton: the button to the clicked to submit the package delivery
  // Save the signature and package number
  saveButton.addEventListener('click', function(event) {
    var _this = this;
    _this.disabled = true;

    var data = signaturePad.toDataURL('image/png'); // converts the signature to base64 image data
    var packageNumber = $(document).find('input[type="hidden"]#package_number').val();
    var deliveryName = document.getElementById('printed_name'); // capture the input name of the package delivery officer
    var printedName = deliveryName.value; // get the client's delivering the package name

    makeAjaxRequest(baseURL + 'packages/' + packageNumber + '/deliver', { // send the data to the server
      'package_number': packageNumber, // package number
      'printed_name': printedName, // client's name
      'signature': data // signature
    }, 'POST').done(function(res) { // successful response
      _this.disabled = false;
      saveButton.removeEventListener('click', function() {});
      if (res.status) { // if successful
        alert(res.message);
        return modalForm.modal('hide'); // hide modal form
      }
      alert(res.message);
      return modalForm.modal('hide'); // hide modal form
    }).fail(function(error) {
      console.log('Error:', error);
      for debugging purposes only
    });
  });

  var cancelButton = document.getElementById('clear'); /// clear the signature pad
  cancelButton.addEventListener('click', function(event) { // clear the signature canvas
    signaturePad.clear();
    return false;
  });
}

function scan() { //packages receival
  "use strict";
  var fName = "scan():";
  //console.log(fName, "entry");for debugging purposes
  try {
    if (window.tinyHippos) { //ba
      thirdPartyEmulator();
      //  console.log(fName, "emulator alert");for debugging purposes
    } else {
      cordova.plugins.barcodeScanner.scan(function(result) { //cordova barcode scanner initialization plugin 
          if (result.text == '') { //if barcode cannot be red by barcode scanner
            return false;
          }
          alert("Scann Succeded!\n" + "Result: " + result.text + "\n"); //scanning succesful
          var packageNumber = result.text; //outputs tracking number
          packageNumber = packageNumber.replace(/[/]/g, '');
          $(document).find('input[type="hidden"]#package_number').val(packageNumber); //search tracking number from the form
          showModalForm(); //activates modal form
        },
        function(error) { //scanning failed due to device failure
          alert("Scanning failed: " + error);
        },
      );
    }
  } catch (e) { //catch any errors 
    //console.log(fName, "catch, failure");for debugging only
  }
  //console.log(fName, "exit");for debugging only
}

addPackageRecipient(); // listen to the ok button and save the recipient information

function addPackageRecipient() {
  var modalForm = $(document).find('div#user-info'); //modal form TO and FROM
  var okButton = modalForm.find('button.ok');
  okButton.on('click', function() { //submits the form in form of number, recipient and sender
    var packageNumber = $(document).find('input[type="hidden"]#package_number').val();
    var recipient = modalForm.find('input#to_recipient').val();
    var sender = modalForm.find('input#from').val();

    makeAjaxRequest('https://packtracking.herokuapp.com/api/packages', { //API endpoint
      'package_number': packageNumber,
      'sender': sender,
      'recipient': recipient,
    }, 'POST').done(function(data) {
      okButton.unbind('click'); //unbinind the event to prevent multiple submitions
      if (data.status) { //if submited hides the moal form then return success message
        modalForm.modal('hide');
        clearForm(modalForm);
        return alert(data.message);
      }
      alert(data.message); //returns error if not added then clears the form and hide the modal form
      clearForm(modalForm);
      return modalForm.modal('hide');

    }).fail(function(error) { //if AJAX fails report the error
      //return console.log(error); for debugging only
    });
    return false; //prevent form from reloading when the buttonis clicked
  });
}

function clearForm(modalForm) { //clears the form input fields
  modalForm.find('input#to_recipient').val(''); //empies the field
  modalForm.find('input#from').val(''); //empies the field
}

function makeAjaxRequest(url, params, method) { //makes AJAX request and returns a premise
  return $.ajax({
    url: url,
    type: method,
    data: params
  });
}

function showModalForm() { //auto complete for modal form
  $(document).ready(function() {
    var autocompleteOptions = {
      minLength: 3, //need at least 3 character to autocomplete
      source: function(request, response) {
        $.ajax({
          type: "GET", //sends get request to the server
          url: "https://packtracking.herokuapp.com/api/users",
          success: function(data) { //if succeded
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i"); //Filter user requests in the returned results
            response($.grep(data, function(item) {
              return matcher.test(item); // return macted items or names
            }));
          }
        });
      }
    };

    // Appends the autocomplete to the modal form
    var modalForm = $(document).find('div#user-info');
    if (modalForm.length > 0) {
      var fInput = $("input#to_recipient");
      fInput.autocomplete(autocompleteOptions);
      modalForm.modal('show');
    }
  });
}