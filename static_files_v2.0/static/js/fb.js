//TODO: http:// to // in fb sdk async

window.fbAsyncInit = function() {
	// init the FB JS SDK
	FB.init({
			appId      : '398933743549563',                    	// App ID from the app dashboard
			channelUrl : 'static/channel.html', 				// Channel file for x-domain comms
			status     : true,                					// Check Facebook Login status
			xfbml      : true,                                	// Look for social plugins on the page

	});
	// Additional initialization code such as adding Event Listeners goes here
	FB.Event.subscribe('auth.authResponseChange',function(response){
		if(response.status==='connected'){
			//success
			FB.api('/me',function(response){
				$('.nav-user-controls #username > strong').text(response.name);
			});
			FB.api('/me/picture?redirect=false&type=square',function(response){
				$('.nav-user-controls #username > img').attr('src',response.data.url);
			});
		}else if(response.status==='not_authorized'){
			//no access
			//respect their decision and do nothing
		}else{
			//not logged into facebook
		}
	})
};
// Load the SDK asynchronously
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));