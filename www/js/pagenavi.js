

var pagenavi =
{
	init : function(){
		console.log('pagenavi_init');
		pagenavi.root = document.querySelector('#myNavigator');
	},
	pushPage : function( onspageid , animation  , callback  )
	{
		animation = animation ? animation : "slide";
		document.querySelector('#myNavigator').pushPage(onspageid);
		if(callback){
            setTimeout(callback, 0.1);
		}
	},
	resetToPage : function( onspageid , animation  , callback  )
	{
		animation = animation ? animation : "none";
		pagenavi.root.resetToPage(onspageid);
		if(callback){
            setTimeout(callback, 0.1);
		}
	},
	popPage : function( onspageid , animation  , callback  )
	{
		animation = animation ? animation : "none";
		pagenavi.root.popPage(onspageid);
		if(callback){
            setTimeout(callback, 0.1);
		}
	}
}
