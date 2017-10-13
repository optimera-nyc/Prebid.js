import adaptermanager from 'src/adaptermanager';
import {registerBidder} from 'src/adapters/bidderFactory';
const BIDDER_CODE = 'optimera';
const SCORES_BASE_URL = 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-397719490216/json/client/';


export const spec = {
  code: BIDDER_CODE,
  /**
   * Determines whether or not the given bid request is valid.
   *
   * @param {BidRequest} bid The bid params to validate.
   * @return boolean True if this is a valid bid, and false otherwise.
   */
  isBidRequestValid: function (bid) {
    return !!(bid.params.placementId);
  },
  /**
   * Make a server request from the list of BidRequests.
   *
   * @param {validBidRequests[]} - an array of bids
   * @return ServerRequest Info describing the request to the server.
   */
  buildRequests: function (validBidRequests) {
    var optimeraHost = window.location.host;
    var optimeraPathName = window.location.pathname;
    var timestamp = Math.round(new Date().getTime() / 1000);
    console.log(validBidRequests);
    var clientId = validBidRequests[0].params.custom.clientId;
    console.log(clientId);
    if (clientId != undefined) {
      var scoresURLx = SCORES_BASE_URL + clientId + '/' + optimeraHost + '/' + optimeraPathName + '.js?t=' + timestamp;
      console.log(scoresURLx);
      var scoresURL = '/scores.js';
      console.log(scoresURL);
      var payload = validBidRequests;
      var payloadString = payload;
      return {
        method: 'GET',
        url: scoresURL,
        payload: payloadString
      };
    }
  },
  /**
   * Unpack the response from the server into a list of bids.
   *
   * @param {*} serverResponse A successful response from the server.
   * @return {Bid[]} An array of bids which were nested inside the server.
   */
  interpretResponse: function (serverResponse, bidRequest) {
    console.log(serverResponse);
    console.log(bidRequest);
    var scores = JSON.parse('{"div-0":["RB_K","728x90K"], "div-1":["RB_K","300x250K", "300x600K"], "timestamp":["RB_K","1507565666"]}');
    var validBids = bidRequest.payload;
    console.log('---------------');
    console.log(validBids);
    var bidResponses = [];
    var dealId = '';
    for (var i = 0; i < validBids.length; i++) {
      console.log(validBids[i]);
      if (validBids[i].adUnitCode in scores && validBids[i].params.custom.clientID != undefined) {
        dealId = scores[validBids[i].adUnitCode];
      }
      var bidResponse = {
        requestId: validBids[i].bidId,
        bidderCode: spec.code,
        cpm: 0.01,
        width: 0,
        height: 0,
        dealId: dealId,
        ad: '<div></div>'
      };
      bidResponses.push(bidResponse);
      console.log(bidResponses);
    }
    return bidResponses;
  }
}
registerBidder(spec);
