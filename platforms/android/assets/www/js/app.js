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
function myEventHandler() {
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

  var baseURL = "https://packtracking.herokuapp.com/api/";
  var fName = "scan():";

  console.log(fName, "entry");

  try {
    if (window.tinyHippos) {
      thirdPartyEmulator();
      console.log(fName, "emulator alert");
    } else {
        
      var modalForm = $(document).find('div#signature-info'); //modalForm: the modal form for package delivery
      var saveButton = document.getElementById('save');         //saveButton: the button to the clicked to submit the package delivery
      var cancelButton = document.getElementById('clear');  /// clear the signature pad
      var deliveryName = document.getElementById('printed_name'); // capture the input name of the package delivery officer

      cordova.plugins.barcodeScanner.scan(function(result) {
          console.log(fName, "Scanned result found!");

          if (result.text == '') {
            return false;
          }

          alert("Scann Succeded!\n" + "Result: " + result.text + "\n");

          var packageNumber = result.text; // get the package number from the barcode scanner
           // initialize the canvas for signature
            var signaturePad = null;
          // Once the package has been scanned and the officer sign that the package
          // was delivered then the package number is sent to the server
          // if it has been delivered before then the user get inform and if not 
          //  it gets a confirmation message that the package was successfully delivered.
          makeAjaxRequest(baseURL + 'packages/' + packageNumber + '/user', {}, 'GET')
            .done(function(res) {
              if (res.status) {
                // show confirmation dialog
                var found = confirm("Please confirm the package recipient \n Recipient Name: " + res.data.name + "\n" + " Package Number: " + packageNumber);

                signaturePad =  new SignaturePad(document.getElementById('signature-pad'), {
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    penColor: 'rgb(0, 0, 0)'
                });

                if (found) {
                  modalForm.modal('show'); // hide the modal form
                }

                return false;
              }

              return alert(res.message);

            }).fail(function(error) {
              console.log('Error', error);

            });
        },
        function(error) {
          alert("Scanning failed: " + error);
        }, {
          orientation: "portrait"
        }
      );
      // Save the signature and package number
      saveButton.addEventListener('click', function(event) {
        var data = signaturePad.toDataURL('image/png'); // convert the signature to base64 image data
        var printedName = deliveryName.value; // get the officer delivering the package name
        // send the data to the server
        makeAjaxRequest(baseURL + 'packages/' + packageNumber + '/deliver', {
          'package_number': packageNumber, // package number
          'printed_name': printedName, // officer name
          'signature': data // signature
        }, 'POST').done(function(res) { // successful response
          saveButton.removeEventListener('click', function() {});
          if (res.status) { // if successful
            alert(res.message);
            return modalForm.modal('hide'); // hide modal form
          }
          alert(res.message);
          return modalForm.modal('hide'); // hide modal form
        }).fail(function(error) {
          console.log('Error:', error);
        });
      });
      // clear the signature canvas
      cancelButton.addEventListener('click', function(event) {
        signaturePad.clear();
        // return false;
      });
    }
  } catch (e) {
    console.log('Error', e);
  }

}


function scan() {
  "use strict";
  var fName = "scan():";
  console.log(fName, "entry")

  try {
    if (window.tinyHippos) {
      thirdPartyEmulator();
      console.log(fName, "emulator alert");
    } else {
      var modalForm = $(document).find('div#user-info');
      var okButton = modalForm.find('button.ok');
      cordova.plugins.barcodeScanner.scan(function(result) {

          console.log(fName, "Scanned result found!");

          if (result.text == '') {
            return false;
          }

          alert("Scann Succeded!\n" + "Result: " + result.text + "\n");

          var packageNumber = result.text;

          $(document).find('input[type="hidden"]#package_number').val(packageNumber);

          showModalForm();
        },
        function(error) {
          alert("Scanning failed: " + error);
        },

      );

      okButton.on('click', function() {
        var packageNumber = $(document).find('input[type="hidden"]#package_number').val();
        var recipient = modalForm.find('input#to_recipient').val();
        var sender = modalForm.find('input#from').val();

        makeAjaxRequest('https://packtracking.herokuapp.com/api/packages', {
          'package_number': packageNumber,
          'sender': sender,
          'recipient': recipient,
        }, 'POST').done(function(data) {
          //alert(JSON.stringify(data));
          okButton.unbind('click');

          if (data.status) {
            modalForm.modal('hide');
            clearForm(modalForm);
            return alert(data.message);
          }

          alert(data.message);
          clearForm(modalForm);
          return modalForm.modal('hide');

        }).fail(function(error) {
          return console.log(error);
        });

        return false;

      });

    }
  } catch (e) {
    console.log(fName, "catch, failure");
  }

  console.log(fName, "exit");
}

function clearForm(modalForm) {
  modalForm.find('input#to_recipient').val('');
  modalForm.find('input#from').val('');

}

function makeAjaxRequest(url, params, method) {
  return $.ajax({
    url: url,
    type: method,
    data: params
  });
}

function showModalForm() {
  $(document).ready(function() {
    var autocompleteOptions = {
      minLength: 3,
      source: function(request, response) {
        $.ajax({
          type: "GET",
          url: "https://packtracking.herokuapp.com/api/users",
          success: function(data) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response($.grep(data, function(item) {
              return matcher.test(item);
            }));
            //response(data);
          }
        });
      }
    };

    var modalForm = $(document).find('div#user-info');
    if (modalForm.length > 0) {
      var fInput = $("input#to_recipient");

      fInput.autocomplete(autocompleteOptions);

      modalForm.modal('show');
    }
  });
}