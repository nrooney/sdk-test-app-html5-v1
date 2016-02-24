# Mobile Connect HTML5 Demo

HTML5 demo app showing a very simple run through of Mobile Connect including both mobile operators discovery and authorisation through Mobile Connect. The variables below are hard-coded into the app and discovery is running everytime. You may use this as a basis for your HTML5 app but some additions should be added. The app uses [Bootstrap](http://getbootstrap.com/) to make it nicer to look at - although Bootstrap is too heavy for this size app.

* Discovery URL: https://discover.mobileconnect.io/gsma/v2/discovery
* Client IDL: gZJ8mEnjoLiAgrfudHCEZvufOoafvf1S
* Client Secret: oESO7jLriPaF3qKA
* OpenID Connect Redirect URI: http://mc.mobilesites.net/authorised.html

For ways to improve the user exerience and extend the app please refer to the [Mobile Connect Developer Portal](https://developer.mobileconnect.io/).

### Things which should be added
If building this app there are some ways you should extend it. This app is very basic and requires some additional elements for a better user experience. These are:

* Caching the discovery endpoint: discovery is run everytime the app is run, this should be cached somewhere, other apps use local storage to do this.
* In our demo app the processDiscoveryResult(discoveryResult) function (in app.js) has a call to runAuthorization() to get the authorisation flowing straight after the discovery, it is at this point that discovery credentials should be stored so discovery does not need to run every time. 
* User should be redirected to an authorised page when they login
* The user's PCR details should be used to help maintain their session within the app.
* add: verify the authorisation
