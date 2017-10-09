# Overview

Module Name: Example Bidder Adapter
Module Type: Bidder Adapter
Maintainer: prebid@example.com

# Description

Module that connects to Example's demand sources

# Test Parameters
```
    var adUnits = [
           {
               code: 'test-div',
               sizes: [[300, 250]],  // a display size
               bids: [
                   {
                       bidder: "example",
                       params: {
                           placement: '12345'
                       }
                   }
               ]
           },{
               code: 'test-div',
               sizes: [[300, 50]],   // a mobile size
               bids: [
                   {
                       bidder: "example",
                       params: {
                           placement: 67890
                       }
                   }
               ]
           }
       ];
```
