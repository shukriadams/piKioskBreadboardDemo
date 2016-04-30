$(document).ready(function() {

    $('#fullpage').fullpage({
        afterLoad: function(anchorLink, index){
			fullSizeImages();
        },
        afterResize: function(){
        	fullSizeImages();
        }
    });

	// socket stuff
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};	
	
	/* ================================================================================== */
	function fullSizeImages(){
		var img = $('.section.active .background-tile img');
		if (!img.length)
			return;
		
		var imageRatio = img[0].naturalHeight / img[0].naturalWidth,
			windowRatio = $(window).height() / $(window).width();

		console.log(imageRatio,windowRatio);	
		if (imageRatio < windowRatio){
			img.parent().addClass('centerWidth');
			img.parent().removeClass('centerHeight');
		} else if (imageRatio > windowRatio) {
			img.parent().addClass('centerHeight');
			img.parent().removeClass('centerWidth');
		}
	}
	fullSizeImages();
	/* ================================================================================== */




	function scrollNext () {
		$.fn.fullpage.moveSectionDown();
		var active = $('.section.active');

		if (active.index() >= $('#fullpage').children().length - 1){
			console.log('back to start');
			$.fn.fullpage.moveTo(1);	
		}
	};


	function scrollPrevious () {
		$.fn.fullpage.moveSectionUp();
	};

	try
	{
		var socket = io.connect('http://127.0.0.1:3000');

		socket.on('switch', function (data) {
			console.log(data.value);
			if (data.value == 0){
				console.log('prev');
				scrollPrevious();
			}
			else{
				console.log('next');
				scrollNext();
			}
			//console.log(data);
			//socket.emit('my other event', { my: 'data' });
		});
	}
	catch (ex){

	}

})
