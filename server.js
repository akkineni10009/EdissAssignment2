var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var redis = require("redis");
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379,'mycachecluster.23kglk.0001.use1.cache.amazonaws.com', {no_ready_check: true});

app.use(session({
    secret: 'Ajay',
    cookie:{maxAge: 15*60*1000}, 
	resave: true,
	rolling:true,
	store: new redisStore({ host: 'mycachecluster.23kglk.0001.use1.cache.amazonaws.com', port:6379, client:client,ttl:260}),
	saveUninitialized:true
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
// connection configurations
/*var mc = mysql.createConnection({
    host: 'mysql-instance.cc9eehfqupez.us-east-1.rds.amazonaws.com',
    user: 'akkineni10009',
    password: 'Pedapadu1',
    database: 'Ediss'
});*/

/*var mc = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'ediss'
})*/

 var poolRead = mysql.createPool({
    connectionLimit :3000, 
    host: 'mysql-instance.cc9eehfqupez.us-east-1.rds.amazonaws.com',
    user: 'akkineni10009',
    password: 'Pedapadu1',
    database: 'Ediss',
    port     : '3306',
    debug    :  false
});
/*var poolRead = mysql.createPool({
    connectionLimit : 600, 
	host: 'mysql-instance.cc9eehfqupez.us-east-1.rds.amazonaws.com',
    user: 'akkineni10009',
    password: 'Pedapadu1',
    database: 'Ediss',
    port     : '3306',
    debug    :  false
});*/
 
 /*var poolRead = mysql.createPool({
    connectionLimit : 600, 
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'ediss',
    port     : '3306',
    debug    :  false
});
var poolRead = mysql.createPool({
    connectionLimit : 600, 
	host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'ediss',
    port     : '3306',
    debug    :  false
});*/

 
// connect to database
console.log("Connection established");
//mc.connect();
 
app.post('/login', function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	
	   console.log("Connection established");
	   poolRead.getConnection(function(err,mc){
	   if( err) throw err;
	   mc.query('select * from userdetails where username=? and password=?',[username,password],function(err, rows){
		   
		   if(err)
		   {
			   console.log(err);
			   //mc.end();   
			   //throw err;
		   }
		   
		   else if (!err && rows.length>0)
		   {
			   if(rows[0].role=='admin')
			   {
				   req.session.admin=username;
			   }
			   req.session.username=username;
			   res.json({'message':'Welcome '+rows[0].fname});		   
		   }
		   
		   else{
			   res.json({'message':'There seems to be an issue with the username/password combination that you entered'});
		   }
		   
	   });mc.release(); });
});

app.post('/logout',function(req,res){
	if(req.session.username)
	{
		req.session.destroy();
	    res.json({'message':'You have been successfully logged out'});
	}
	
	else
	{
		res.json({'message':'You are not currently logged in'});
	}
});

app.post('/registerUser',function(req,res){
	console.log(req.body);
	if(!(req.body.fname) || !(req.body.lname) ||!(req.body.address) || !(req.body.city) || !(req.body.state) || !(req.body.zip) || !(req.body.email)|| !(req.body.username) || !(req.body.password))
	{
       res.json({'message':'The input you provided is not valid'});
	}
	
	else
	{
		
	
	var fname = req.body.fname;
	var lname = req.body.lname;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var userId= username;
	var role=req.session.admin;
	if(!role) role='user';
		
	
	  poolRead.getConnection(function(err,mc){
		   if( err) throw err;
	  mc.query('select * from userdetails where username=?',[username],function(err,rows){
		console.log("query executed");
		if(err)
		{
			//mc.end();
			console.log("in err");
			console.log(err);
			//throw err;
		}
		
		else if(rows.length>=1)
		{
			res.json({'message':'The input you provided is not valid'});
		}
		
		else
		{
			//var sqlquery= "insert into userdetails values (?,?,?,?,?,?,?,?,?)",[fname,lname,address,city,state,zip,email,username,password];
			//console.log(sqlquery);
			poolRead.getConnection(function(err,mc){
				 if( err) throw err;
			mc.query('insert into userdetails values (?,?,?,?,?,?,?,?,?,?,?)',[fname,lname,address,city,state,zip,email,username,password,userId,role],function(err,results){
				if(err)
				{
					//mc.end();
				}
				else
				{
					res.json({'message':fname + ' was registered successfully'});	
				}
			});mc.release();});		
		}
	
	});mc.release(); }); 
	}
});

app.post('/updateInfo',function(req,res){
	var json=req.body;
	var set_clause="";
	var where_clause=" where ";
	var query ="update userdetails set ";
	var session_user= req.session.username;

 if(req.session.username)
 {
	 
 
	if(("fname" in json)==true)
    {
	   var fname=json['fname'];
	   set_clause += " fname= '"+fname+"'";
	}
	
	if(("lname" in json)==true)
    {
	   var lname=json['lname'];
	   if(set_clause=='')
	   {
		  set_clause += " lname= '"+lname+"'";
	   }
	   else
	   {
		   set_clause += ","+ " lname= '"+lname+"'";
	   }
	}
	
	if(("address" in json)==true)
    {
	   var address=json['address'];
	   if(set_clause=='')
	   {
		   set_clause += " address= '"+address+"'";
	   }
	   else
	   {
		   set_clause += ","+ " address= '"+address+"'";
	   }
	}
	
	if(("city" in json)==true)
    {
	   var city=json['city'];
	   if(set_clause=='')
	   {
		   set_clause += " city= '"+city+"'";
	   }
	   else
	   {
		   set_clause += ","+ " city= '"+city+"'"; 
	   }
	}
	
	if(("state" in json)==true)
    {
	   var state=json['state'];
	   if(set_clause=='')
	   {
		   set_clause += " state= '"+state+"'";
	   }
	   else
	   {
		   set_clause += ","+ " state= '"+state+"'";  
	   }
	}
	
	if(("zip" in json)==true)
    {
	   var zip=json['zip'];
	   if(set_clause=='')
	   {
		   set_clause += " zip= '"+zip+"'";
	   }
	   else
	   {
		   set_clause += ","+ " zip= '"+zip+"'";
	   }
	}
	
	if(("email" in json)==true)
    {
	   var email=json['email'];
	   if(set_clause=='')
	   {
		   set_clause += " email= '"+email+"'";
	   }
	   else
	   {
		  set_clause += ","+ " email= '"+email+"'";
	   }
	}
	
	if(("username" in json)==true)
    {
	   var username=json['username'];
	   //where_clause+= 'username= ?';
	   if(set_clause=='')
	   {
		   set_clause += " username= '"+username+"'";
	   }
	   else
	   {
		   set_clause += ","+ " username= '"+username+"'";
	   }
	   
	}
	
	if(("password" in json)==true)
    {
	   var password=json['password'];
	   if(set_clause=='')
	   {
		  set_clause += " password= '"+password+"'";
	   }
	   else
	   {
		  set_clause += ","+ " password= '"+password+"'";
	   }
	}
	query+=set_clause;
	where_clause+= " username= '"+session_user+"'";
	query+=where_clause;
	
	if(fname=='' || lname=='' || address=='' || city=='' || state=='' || zip=='' || email=='' || username=='' || password=='')
    {
		res.json({'message':'The input you provided is not valid'});
	}
	
	else
	{
		poolRead.getConnection(function(err,mc){
			 if( err) throw err;
		mc.query('select * from userdetails where username=?',[username],function(err,rows){
			if(err)
			{
					console.log(err);
					//mc.end();
			}
			
			else if(rows.length>=1)
			{
					res.json({'message':'The input you provided is not valid'});
			}
			
			else
			{
				console.log(query);	
				poolRead.getConnection(function(err,mc){
					 if( err) throw err;
				mc.query(query,function(err,results){
				if(err)
				{
					console.log(err);
					//mc.end();
				}
				
				else
				{
					console.log(username);
					console.log(session_user);
					req.session.username=username;
					poolRead.getConnection(function(err,mc){
						 if( err) throw err;
					mc.query('select fname from userdetails where username=?',[username],function(err,rows){
							
						
						res.json({'message':rows[0].fname + ' your information was successfully updated'});	
							
					});mc.release(); });
					
				}
				
			}); mc.release();});	
			}
	});mc.release(); });
			
	}
  }
  
  else
  {
	  return res.json({'message':'You are not currently logged in'});
  }
});

app.post('/addProducts', function(req,res){
	
	if(req.session.username)
	{
	  
	  if(req.session.admin)
	  {
		  
		  if(!(req.body.asin) || !(req.body.productName) || !(req.body.productDescription) || !(req.body.group))
		  {
			res.json({'message':'The input you provided is not valid'});	
		  }
	       
          else
	     {
		   var asin = req.body.asin;
		   var productName = req.body.productName;
	       var productDescription = req.body.productDescription;
	       var group =  req.body.group;
	       var username=req.body.asin;
         poolRead.getConnection(function(err,mc){	
		if( err) throw err;		 
		 mc.query('select * from products where username = ?',[asin],function(err,results){
		 
		if(err)
		{
			console.log(err);
			//mc.end();
		}
		
		else if(results.length>=1)
		{
			res.json({'message':'The input you provided is not valid'});	
		}
		
		else
		{
			poolRead.getConnection(function(err,mc){
				 if( err) throw err;
			mc.query('insert into products values (?,?,?,?,?)',[username,asin,productName,productDescription,group],function(err,results){
		
			if(err)
			{
				console.log(err);
				//mc.end();
			}
		
			else
			{
				res.json({'message':productName + ' was successfully added to the system'});	
			}
			});mc.release();});
		}
		 });mc.release();});
		  
    }
	
	  }
	  
	  else
	  {
		  res.json({'message':'You must be an admin to perform this action'});
	  }
	}
	
	else
	{
		res.json({'message':'You are not currently logged in'});
	}
});

app.post('/modifyProduct', function(req,res){
	
  if(req.session.username)
  {
	if(req.session.admin)
     {
		
		if(!(req.body.asin)|| !(req.body.productName)|| !(req.body.productDescription)|| !(req.body.group))
		  {
			res.json({'message':'The input you provided is not valid'});	
		  }
		
		else
		{
			var asin = req.body.asin;
			var productName = req.body.productName;
			var productDescription = req.body.productDescription;
			var group =  req.body.group;
			var username=req.body.asin;
			poolRead.getConnection(function(err,mc){
				 if( err) throw err;
			mc.query('update products set productName=?, productDescription=? where username=? and groups=? ',[productName,productDescription,asin,group],function(err,results){
			if(err)
			{
				console.log(err);
				//mc.end();
			}
		
			else
			{
				res.json({'message':productName + ' was successfully updated'});	
			}
			});mc.release(); });
		}
	 }
	 else
	 {
		 res.json({'message':'You must be an admin to perform this action'});
	 }
  }
  else
  {
	  res.json({'message':'You are not currently logged in'});
  }
});

app.post('/viewUsers', function(req,res){
	
	/*
		Check for login
	*/
	var json=req.body;
	var where_clause="";
	var fname="",lname="";
	var query= "select fname,lname,userId from userdetails where ";
	var final_result=[];
	var temp_result={};
	var j=0;
	
	if(req.session.username)
	{
		if(req.session.admin)
		{
			
		
	
	
	if(("fname" in json)==false && ("lname" in json)==false)
	{
	where_clause = "'"+'1==1'+"'";
	}
	
	if(("fname" in json)==true)
    {
	   fname=json['fname'];
	   where_clause += "fname= '"+ fname +"'";
	}
	
	if(("lname" in json)==true)
    {
	   lname=json['lname'];
	   if(where_clause=='')
	   {
		   where_clause += "lname= '"+ lname +"'";
	   }
	   else
	   {  
		   where_clause += " and " + "lname= '"+ lname +"'";
	   }
	}
    query+=where_clause;
	console.log(query);
	
	poolRead.getConnection(function(err,mc){
		 if( err) throw err;
	mc.query(query,function(err,rows){
		
			if(err)
			{
				console.log(err);
				//mc.end();
			}
		
			else
			{
				console.log(rows.length);
				if(rows.length<1)
				{
					res.json({'message':'There are no users that match that criteria'});	
				}
				else
				{
						res.json({'message':'The action was successful', 'user':rows});
				}
				
			}
	});mc.release();});
    }
    else
	{
			res.json({'message':'You must be an admin to perform this action'});
	}
   
   }
   else
   {
	   res.json({'message':'You are not currently logged in'});
   }
});

app.post( '/viewProducts',  function(req, res, next) { 
var params =[req.body.asin,req.body.keyword,req.body.group];
var pin= req.body.asin;
var key= req.body.keyword;
var grp = req.body.group;
var querystring;


poolRead.getConnection(function(err,readconnection){
if(typeof req.body.asin === 'undefined' && typeof req.body.group ==='undefined' && typeof req.body.keyword === 'undefined'){
    querystring = "SELECT asin, productName from products limit 10;";
}
else{
querystring = "SELECT asin, productName from products where";
if(pin) { querystring+=" asin = "+ readconnection.escape(req.body.asin)+" or"; }  
if(grp) { querystring += ' match(`groups`) against ('+ readconnection.escape(req.body.keyword) +' IN NATURAL LANGUAGE MODE) or'; }
if(key) { 
        var word = req.body.keyword;
    var numberOfWords = req.body.keyword.split(" ");
    if(numberOfWords.length > 1){
      //console.log(word);
        if(word.charAt(0) !== '\"'){
        req.body.keyword = "\"" + req.body.keyword + "\"";
      }
    }
   
  querystring+=  ' match(productName) against ('+ readconnection.escape(req.body.keyword) +' IN NATURAL LANGUAGE MODE) and productName='+ req.body.keyword +' or'; }
  
querystring = querystring.slice(0,-2);
querystring += 'limit 10;';
}
console.log("querystring"+querystring);

var queries = readconnection.query(querystring, function(err, rows, fields) {
   if (!err && rows.length > 0 )
    {    
          var obj= '{"message":"The action was successful","product":[';    
          var results = [];
          //var prod = [];
          for(var i =0; i< rows.length; i++)
          {
              //prod=  rows[i].productName.split(',');
              var temp= '{"asin":"'+rows[i].asin+'","productName":"'+rows[i].productName+'"}';
              results.push(temp);
          }
          obj=obj+results+']}';
          res.setHeader('Content-Type', 'application/json');
          return res.send(obj);
    }            

   else          
    {           
      var obj= '{"message":"There are no products that match that criteria"}';
      res.setHeader('Content-Type', 'application/json');
      return res.send(obj);     
          
    } 
 });
 readconnection.release();
}); 
 (req,res,next);
});

/*app.post( '/viewProducts',  function(req, res, next) { 
var params =[req.body.asin,req.body.keyword,req.body.group];
var asin= req.body.asin;
var key= req.body.keyword;
var grp = req.body.group;
var querystring;


poolRead.getConnection(function(err,readconnection){
	 if( err) throw err;
if(typeof req.body.asin === 'undefined' && typeof req.body.group ==='undefined' && typeof req.body.keyword === 'undefined'){
    querystring = "SELECT asin, productName from products limit 10;";
}
else{
querystring = "SELECT asin, productName from products where";
if(asin) { querystring+=" asin = "+ readconnection.escape(req.body.asin)+" or"; }  
if(grp) { querystring += " `groups` = "+ readconnection.escape(req.body.group)+ " or"; }

if(key) { 
        var word = req.body.keyword;
    var numberOfWords = req.body.keyword.split(" ");
    if(numberOfWords.length > 1){
      //console.log(word);
        if(word.charAt(0) !== '\"'){
        req.body.keyword = "\"" + req.body.keyword + "\"";
      }
    }
   
  querystring+=  ' match(productName) against ('+ readconnection.escape(req.body.keyword) +' IN NATURAL LANGUAGE MODE) or'; }
  
querystring = querystring.slice(0,-2);
querystring += 'limit 10;';
}
console.log("querystring"+querystring);

var queries = readconnection.query(querystring, function(err, rows, fields) {
   // readconnection.release();
   if(err) throw err;
   if (rows.length > 0 )
    {    
         //res.json({'message':'The action was successful', 'product':rows});
		  var obj= '{"message":"The action was successful","product":[';    
          var results = [];
		  var temp_result=[];
          for(var i =0; i< rows.length; i++)
          {
              temp_result[i]=rows[i].productName.split(',');
			  var temp= '{"asin":"'+rows[i].asin+'","productName":"'+temp_result[0]+'"}';
              results.push(temp);
          }
          obj=obj+results+']}';
          res.setHeader('Content-Type', 'application/json');
          return res.send(obj);

    }            

   else          
    {           
      res.json({'message':'There are no users that match that criteria'});    
    } 
 });readconnection.release();
}); 
});


*/app.post('/viewProductsA', function(req,res){
	var asin=req.body.asin;
	var keyword=req.body.keyword;
	var group=req.body.group;
	var json=req.body;
	var where_clause="";
    var query= "select asin,productName from products where ";
	
	if(("asin" in json)==false && ("keyword" in json)==false && ("group" in json)==false)
	{
	where_clause = "'"+'1==1'+"'";
	}
	
	if(("asin" in json)==true)
    {
	   asin=json['asin'];
	   where_clause += "username= '"+ asin +"'";
	}
	
	if(("group" in json)==true)
    {
	   group=json['group'];
	   if(where_clause=='')
	   {
		   where_clause += "groups= '"+ group +"'";
	   }
	   else
	   {  
		   where_clause += " and " + "groups= '"+ group +"'";
	   }
	}
	
	if(("keyword" in json)==true)
    {
	   keyword=json['keyword'];
	   keyword = '%'.concat(keyword.concat('%'));
	   if(where_clause=='')
	   {
		   where_clause += " productName like '"+ keyword +"'" + " or " + " productDescription like '"+ keyword +"'";
	   }
	   else
	   {  
		   where_clause += " and (" + " productName like '"+ keyword +"'" + " or " + " productDescription like '"+ keyword +"')";
	   }
	}
	
    query+=where_clause;
	console.log(query);
	poolRead.getConnection(function(err,mc){
		 if( err) throw err;
	mc.query(query,function(err,rows){
		
		if(err)
		{
			console.log(err);
			//mc.end();
		}
		
			else
			{
				console.log(rows.length);
				if(rows.length<1)
				{
					res.json({'message':'There are no products that match that criteria'});	
				}
				else
				{
						res.json({'product':rows});
				}
				
			}
	});mc.release();});
});

app.post('/buyProducts', function(req,res){
	
  if(req.session.username)
  {
	var parameters =req.body.products;
	var values = "";
	var temp = 0;
	poolRead.getConnection(function(err,mc){
		 if( err) throw err;
	for(i=0;i<parameters.length;i++)
	{
	    if(temp)
		{
		  values+=',';
	    }
		values+=(parameters[i].asin);
		temp++;
	}
	var paramset = [values,parameters.length];
	
	mc.query("SELECT verifyAsins(?,?) as isValid" ,paramset, function (err, rows, fields) {
		if (err)
		{
			//throw err;
		}
		else
		{
				if(rows[0].isValid==0)
				{
					res.json({'message':'There are no products that match that criteria'});
				}
				else
				{
		var temp=true, result_temp=true;
		var inputproducts = req.body.products;
		var requestsLength = inputproducts.length;
        var products=[];
		
		for(var i=0;i<requestsLength;i++)
		{
			products[i]= inputproducts[i].asin;
		}
		console.log(products);
	
		// Update the items purchaed by the customer
		var currentProductName;
		poolRead.getConnection(function(err,mc){
			 if( err) throw err;
		for(var i=0;i<requestsLength;i++)
		{
			console.log("Update the productsPurchasedByCustomer table");
			var currentasin=products[i];
			console.log(req.session.username + " " + currentasin);
			
			mc.query('select productName from products where asin = ?',[currentasin],function(err,results){
		    if(err)
		    {
			  
		    }
			else
			{
				currentProductName=results[0].productName;
				mc.query('insert into productsPurchasedByCustomer values (?,?)',[req.session.username,currentProductName],function(err,results){
				if(err)
				{
					console.log(err);
					result_temp = false;
				}
				});	
			}
			
			});	
			
			
		} mc.release();
		});
		// Update for recommendation
		poolRead.getConnection(function(err,mc){
			 if( err) throw err;
		for(var i=0;i<requestsLength-1;i++)
		{
		   	
			for(var j=i+1;j<requestsLength;j++)
		    {     
				for(var k=j-1;k>=0;k--)
				{
					if(products[j]==products[k])
					{
						temp=false;
						break;
					}  
				}
				if(temp)
				{
				    console.log("Update the productsPurchasedTogether table");
					
					mc.query('insert into productsPurchasedTogether values (?,?)',[products[i],products[j]],function(err,results){
		            if(err)
		            {
			         console.log(err);
					 result_temp = false;
		            }
				});	
					
					mc.query('insert into productsPurchasedTogether values (?,?)',[products[j],products[i]],function(err,results){
		            if(err)
		            {
			         console.log(err);
					 result_temp = false;
		            }
		            });
				}
			}				  
				}mc.release();	}); 
			res.json({'message':'The action was successful'});		
	 }
								
	  }
			
	});mc.release();});
  }
	
  else
  {
	  res.json({'message':'You are not currently logged in'});
  }
  
  console.log("End of buyProducts");
});

app.post('/productsPurchased', function(req,res){
  console.log("In productsPurchased");
  if(req.session.username)
  {
	if(req.session.admin)
    {
		console.log(req.body.username);
		poolRead.getConnection(function(err,mc){
			 if( err) throw err;
		mc.query('select * from userdetails where username=?',[req.body.username],function(err, rows){
		   
		   if(err)
		   {
			   console.log(err);
			   //mc.end();   
			   //throw err;
		   }
		   
		   else if (rows.length<=0)
		   {
			   res.json({'message':'There are no users that match that criteria'});
		   }
		   
		   else
		   {
			   console.log("Before query");
			   poolRead.getConnection(function(err,mc){
				    if( err) throw err;
			   mc.query('select productName, count(productName) as quantity from productsPurchasedByCustomer where username=? group by productName ',[req.body.username],function(err, rows){
		   
		        if (err || rows.length<=0)
		        {
			      res.json({'message':'There are no users that match that criteria'});
		        }
				
				else
				{
					res.json({'message':'The action was successful', 'products':rows});
				}
		   
			   });mc.release();});
		   }
		   
		});mc.release();});
	}
	else
	{
		 res.json({'message':'You must be an admin to perform this action'});
	}
  }
  else
  {
	  res.json({'message':'You are not currently logged in'});
  }
  console.log("End of productsPurchased");
});


app.post('/getRecommendations', function(req,res){
	var asin = req.body.asin;
	poolRead.getConnection(function(err,mc){
		 if( err) throw err;
	mc.query('select * from productsPurchasedTogether where product1=?',[asin],function(err, rows){
		   
	if (err || rows.length<=0)
	{
	   res.json({'message':'There are no recommendations for that product'});
	}
		   
	else
	{
		poolRead.getConnection(function(err,mc){
			 if( err) throw err;
	     mc.query('select asin from ( select product2 as asin , count(*) as cnt from productsPurchasedTogether where product1=? group by product2 order by cnt desc limit 5  ) as temp',[asin],function(err, rows){
			res.json({'message':'The action was successful', 'products':rows});
		});mc.release();});
	}
		   
    });mc.release();});
	console.log("End of getRecommendations");
});


// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});