$(function(){	
	$('#load').click(function(){
		$("#booksDetailsDiv").html(null);
		var frag = can.view("tableWrapper");
		$("#booksDetailsDiv").html(frag);
	});
});