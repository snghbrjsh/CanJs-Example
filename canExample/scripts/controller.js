$(document).ready(function(){
	var listOfBooks = [
		{id:'1', bookName:"Java for beginers", author: "Random Author", city:"Hyderabad", country:"India", pin: "896541"},
		{id:'2', bookName:"Javascript Advance with Nevile", author: "Eric Meyer", city:"Chennai", country:"India", pin: "456987"},
		{id:'3', bookName:"Oracle 11g", author: "Jane Doe"},
		{id:'4', bookName:"ABC", author: "John Doe"},
		{id:'5', bookName:"Oracle 10g", author: "Eric Meyer", city:"BBSR", country:"India", pin: "852369"},
		{id:'6', bookName:"Java cerification OCJP", author: "Oracle India Pvt. Ltd.", city:"Hyderabad", country:"India", pin: "500088"},
		{id:'7', bookName:"Learn JS All Alone", author: "Yourelf", city:"Mysore", country:"India", pin: "400316"}
	]
	
	can.fixture.delay = 1000;
	
	can.fixture({
		"GET /service/books": function(){
			var books = listOfBooks;
			return books;
		},
		
		"DELETE /service/book/{id}": function(){
			return {};		
		},
		
		'PUT /service/book/{id}': function(){
			return '';
		},
		
		'POST /service/books' : function(){
			return {id: Math.floor(Math.random()*1000)};
		}
	})

	can.Model.extend("sakura.models.Books", 
		{
			findAll : 'GET /service/books',
			destroy : "DELETE /service/book/{id}",
			update  : 'PUT /service/book/{id}',
			create 	: 'POST /service/books'
		},
		{
			init: function(){
				var locBook = this;
				locBook.attr('isEdited',false);
			}
		});
	
	can.Model.extend("sakura.models.Pagination", 
	{
		
		count : Infinity,
		offset: 0,
		itemperpage: 0,
		currPageNo : 1,
		isNext: false,
		isPrev: false,
		
		next: function(){
			this.attr('offset', this.offset + this.itemperpage );
			this.attr('currPageNo', this.attr('currPageNo')+1);
			this.hasNext();
			this.hasPrev();
		},
		
		prev: function(){
			this.attr('offset', this.attr('offset') - this.attr('itemperpage') )
			this.attr('currPageNo', this.attr('currPageNo')-1);
			this.hasNext();
			this.hasPrev();
		},
		
		hasNext: function(){
			if(this.offset < (this.count - this.itemperpage)){
				this.attr('isNext',true);
			} else {
				this.attr('isNext',false);
			}
		},
		
		hasPrev: function(){
			if(this.offset > 0){
				this.attr('isPrev',true);
			} else{
				this.attr('isPrev',false);
			}
		},
		
		setOffset: function(){
		
		},
		pagecount: function(){
			return Math.ceil(this.attr('count')/this.attr('itemperpage'));
		}
		
	});
	
	BookList = can.Component.extend({
		tag: "mycantable",
		template: can.view("bookstemplate"),
		scope: {
			isBookListNotEmpty : true,
			nbook: [],
			allBooks: [],
			edit : function(abook, ev){
				abook.attr('isEdited',true);
			},
			paginate: {},
			init: function(){
				var scope = this;
				sakura.models.Books.findAll({}, function(data){
					scope.attr('allBooks', data);
					scope.attr('nbook', scope.attr('allBooks').slice(0,5));
					scope.attr('paginate', new sakura.models.Pagination({
						count:data.length,
						itemperpage: 5,
// 						pagecount: Math.ceil(data.length/5),
						isNext: data.length>5,
						isPrev: false
					}));
				}); 
			},
			
			saveBook: function(scope, el, ev){
				ev.preventDefault();
				var abookName = can.$('#bookName').val();
				var aAuthor = can.$('#author').val();
				var acity = can.$('#city').val();
				var acountry = can.$('#country').val();
				var apin = can.$('#pin').val();
				
				can.$('#bookName').val('');
				can.$('#author').val('');
				can.$('#city').val('');
				can.$('#country').val('')
				can.$('#pin').val('');
				
				var newBook = new sakura.models.Books({
						bookName: abookName, 
						author:aAuthor,
						city: acity,
						country: acountry,
						pin: apin 
						});
				newBook.save();
				
			},
			
			search: function(){
				debugger;
			}
						
		},
		events: {			
			".save click": function(el, ev){
				el.parent().parent().data('book').attr('isEdited',false);
				
				var scope = this.scope;
				this.scope.attr('allBooks').filter( function(item, index, list){
					if(el.parent().parent().data('book').attr('id') == item.id){
						scope.attr('allBooks')[index].update();
					}
				});
			},
			
			".destroy click": function(el, ev){
				var scope = this.scope;
				this.scope.attr('allBooks').filter( function(item, index, list){
					if(el.parent().parent().data('book').attr('id') == item.id){
						scope.attr('allBooks')[index].destroy();
					}
				});
			},
			
			"{allBooks} destroyed" : function(itemsLeft, itemDeleted, idx, n){
				if(this.scope.allBooks.length == 0){
					this.scope.attr('isBookListNotEmpty',false);
				}
				
				this.scope.attr('paginate').attr('count',this.scope.attr('allBooks').length);
				var booksToShow = this.scope.attr('allBooks').slice(this.scope.attr('paginate').attr('offset'),this.scope.attr('paginate').attr('offset')+5);
				this.scope.attr('nbook',booksToShow);
			},
			
			'{sakura.models.Books} created': function(model, evt, object){
// 				debugger;
				this.scope.attr('allBooks').unshift(object);
				if(this.scope.allBooks.length > 0){
					this.scope.attr('isBookListNotEmpty',true);
				}
				
				this.scope.attr('paginate').attr('count',this.scope.attr('allBooks').length);				
				var booksToShow = this.scope.attr('allBooks').slice(this.scope.attr('paginate').attr('offset'),this.scope.attr('paginate').attr('offset')+5);
				this.scope.attr('nbook',booksToShow);

			},
			"{scope.paginate} offset": function(){
				var booksToShow = this.scope.attr('allBooks').slice(this.scope.attr('paginate').attr('offset'),this.scope.attr('paginate').attr('offset')+5);
				this.scope.attr('nbook',booksToShow);
				this.scope.attr('paginate').hasNext();
				this.scope.attr('paginate').hasPrev();
			},
			
			"{scope.paginate} count": function(){
				this.scope.attr('paginate').hasNext();
				this.scope.attr('paginate').hasPrev();
			},
			
			".search blur": function(el, ev){
// 				debugger;
				this.scope.allBooks.forEach(function(data, idx, list){
// 					debugger;
				})
			}
			
			
		}
	});
			
	can.Component.extend({
  		tag: "next-prev",
  		template: 
    		'<div><a href="javascript://"' + 
      		'class="prev {{#paginate1.isPrev}}enabled{{/paginate1.isPrev}}" can-click="paginate1.prev">Prev</a>' + 
    		'<a href="javascript://"' + 
      		'class="next {{#paginate1.isNext}}enabled{{/paginate1.isNext}}" can-click="paginate1.next">Next</a>' +
      		'<div class="pageCount">showing page {{paginate1.currPageNo}} of {{paginate1.pagecount}}<div> </div>'
	})

})	