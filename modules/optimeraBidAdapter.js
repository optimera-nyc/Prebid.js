import bidfactory from 'src/bidfactory';
import adaptermanager from 'src/adaptermanager';
import {ajax} from 'src/ajax';
import {STATUS} from 'src/constants';
const utils = require('src/utils');

/**
 *
 * @returns {{callBids: _callBids}}
 * @constructor
 */
function OptimeraBidAdapter() {
  /**
   * Set up optimera client ID var.
   * This is populated by the Prebid config file later on.
   * @type {string}
   */
  var OptimeraClientId = '';

  /**
   * Create oDv, the array that holds the DIV IDs that Google will render ads into.
   * These are arbitrary ID's set by the publisher and will be populated by Prebid.
   * oDv is used by Optimera's OPS file which is responsible for measuring the ads
   * on the site (Nothing to do with pushing ads into DFP).
   * @type {Array}
   */
  //
  window.oDv = [];

  /**
   * Each bid has a unique ID.
   * A bid is something Prebid passes into adapters for each ad position on the site.
   * 3 ad positons / 3 IDs for example.
   * This will be populated by prebid later.
   * @type {Array}
   */
  var bidderRequestIds = [];

  /**
   * Each bid has a unique DIV ID. This will be populated by prebid later.
   * @type {Array}
   */
  var bidderRequestDivs = [];

  //
  /**
   * The client ID is key for success to run all things Optimera,
   * setting up placeholder here.
   */
  var OptimeraClientIdValid;

  function _callBids(params) {
    console.log('_callBids');
    console.log(OptimeraClientId);
    for (var i = 0; i < params.bids.length; i++) {
      // If the client ID is not set yet...
      if (OptimeraClientId == '') {
        // Ask the config file for this site's client ID
        OptimeraClientId = params.bids[i].params.clientId;
        OptimeraClientId = 10;
        // Confirm that the client ID is in fact a number by confirming it is "false" that it is not a number
        OptimeraClientIdValid = isNaN(OptimeraClientId);
        // If client ID is set to False and therefore is a number...
        if (OptimeraClientIdValid === false) {
          // Add client ID to oDv. It must always be the first element in the array.
          oDv.unshift(OptimeraClientId);
          // Set up the request to the Score File. This will have data that needs to be pushed into DFP. First grab the webpage's host
          // var optimeraHost = window.location.host;
          // Grab the webpage's path
          // var optimeraPathName = window.location.pathname;
          // Create a random number to append to the file request to make sure a cached version is not retrived. This file's data is "real-time".
          // var rand = Math.random();
          console.log('call ajax');
          ajax(
            // 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-397719490216/json/client/' + oDv[0] + '/' + optimeraHost + optimeraPathName + '.js?t=' + rand,
            // 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-397719490216/json/client/0/optimera.elasticbeanstalk.com/prebidDemoPage.php.js?t=0.542499926931846',
            'http://localhost:9999/scores.js',
            {
              success: function(result) {
                OptimeraCreateBids(result);
              },
              error: function() {
                console.log('ajax fail');
              }
            },
            '',
            {
              method: 'GET'
            }
          );
        }
      }
      // During this loop, add each DIV ID to oDv.
      oDv.splice(1, 0, params.bids[i].placementCode);
      // Store each bid request ID from Prebid in the same order
      bidderRequestIds[i] = params.bids[i].bidderRequestId;
      // Store each placement code from Prebid in the same order
      bidderRequestDivs[i] = params.bids[i].placementCode;
    }

    // As long as oDv was successfully created and the client ID is actually a number...
    if (typeof oDv !== 'undefined' && OptimeraClientIdValid === false) {
      // Add the OPS library to the page. Note appended to head so it will start up as the last head element. This allows all the site's ad code to run first.
      var optimeraOpsScript = document.createElement('script');
      optimeraOpsScript.async = true;
      optimeraOpsScript.type = 'text/javascript';
      optimeraOpsScript.src = 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-397719490216/external_json/oPS.js';
      document.head.appendChild(optimeraOpsScript);
    }
  }

  /**
   * Create bids with the data that comes back from the Score File.
   * Prebid specific.
   * @constructor
   */
  function OptimeraCreateBids (result) {
    window.oVa = '{"div-0":["RB_K","728x90K"], "div-1":["RB_K","300x250K", "300x600K"], "timestamp":["RB_K","1507565666"]}';
    /**
     * oVa is the array in the score file containing all the scores for this page.
     *
     * For example:
     * window.oVa = {
           *  "div-0":
           *    [
           *    "RB_K",
           *    "728x90K",
           *    "728x90L",
           *    "728x90M",
           *    "728x90N",
           *    "728x90Y"
           *    ],
           *  "div-1":
           *    [
           *    "RB_K",
           *    "728x90K",
           *    "300x250K",
           *    "300x250L",
           *    "300x250M",
           *    "300x250N",
           *    "300x250Y",
           *    "300x600K",
           *    "300x600L",
           *    "300x600M",
           *    "300x600N",
           *    "300x600Y"
           *    ],
           *    "timestamp":
           *    [
           *      "RB_K","1507250374"
           *    ]
           *  };
     */
    if (window.oVa) {
      console.log(oVa);
      // Push Bids
      // For each DIV ID...
      for (var i = 0; i < bidderRequestDivs.length; i++) {
        // Check if Score Exists For Position, for example: "div-0":["728x90K"]
        if (bidderRequestDivs[i].length > 0) {
          // Form bid request by assigning correct ID - prebid specific
          var bidRequest = utils.getBidRequest(bidderRequestIds[i]);
          // Signal "GOOD" bid status - Prebid specific
          var bidObject = bidfactory.createBid(STATUS.GOOD, bidRequest);
          // Set bidder code - Prebid specific - should be lowercase optimera
          bidObject.bidderCode = 'optimera';
          // Set bid price - Prebid specific - always 0.01 as Optimera doesn't serve an ad
          bidObject.cpm = 0.01;
          // Set ad code - Prebid specific - just HTML placeholder since Optimera does not deliver an ad
          bidObject.ad = '<html></html>';
          // Set ad width - prebid specific - no ad returned therefore 0
          bidObject.width = 0;
          // Set ad height - prebid specific - no ad returned therefore 0
          bidObject.height = 0;
          /**
           * Set the dealID namespace equal to the scores for this DIV.
           * - Prebid specific -
           * Optimera uses the dealId as a flexible area to add non-structured data.
           * All scores enter via this path.
           */
          bidObject.dealId = oVa[bidderRequestDivs[i]];
          // Add bid to the bid manager - Prebid specific
          bidfactory.addBidResponse(bidderRequestDivs[i], bidObject);
        }
      }
    }
  }

  // Export the `callBids` function, so that Prebid.js can execute
  // this function when the page asks to send out bid requests -Prebid specific
  return {
    callBids: _callBids
  };
}

adaptermanager.registerBidAdapter(new OptimeraBidAdapter(), 'optimera');
module.exports = OptimeraBidAdapter;
