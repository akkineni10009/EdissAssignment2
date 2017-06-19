var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

app.use(session({
    secret: 'Ajay',
    cookie:{maxAge: 15*60*1000}, 
	resave: true,
	rolling:true,
	saveUninitialized:true
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
 
// connection configurations
var mc = mysql.createConnection({
    host: 'mysql-instance.cc9eehfqupez.us-east-1.rds.amazonaws.com',
    user: 'akkineni10009',
    password: 'Pedapadu1',
    database: 'Ediss'
});

/*var mc = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'ediss'
})*/
 
// connect to database
console.log("Connection established");
mc.connect();
 
app.post('/login', function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	
	   console.log("Connection established");
	   mc.query('select * from userdetails where username=? and password=?',[username,password],function(err, rows){
		   
		   if(err)
		   {
			   console.log(err);
			   //mc.end();   
			   throw err;
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
		   
	   });
	
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
		
	
	  mc.query('select * from userdetails where username=?',[username],function(err,rows){
		console.log("query executed");
		if(err)
		{
			//mc.end();
			console.log("in err");
			console.log(err);
			throw err;
		}
		
		else if(rows.length>=1)
		{
			res.json({'message':'The input you provided is not valid'});
		}
		
		else
		{
			//var sqlquery= "insert into userdetails values (?,?,?,?,?,?,?,?,?)",[fname,lname,address,city,state,zip,email,username,password];
			//console.log(sqlquery);
			mc.query('insert into userdetails values (?,?,?,?,?,?,?,?,?,?,?)',[fname,lname,address,city,state,zip,email,username,password,userId,role],function(err,results){
				if(err)
				{
					//mc.end();
				}
				else
				{
					res.json({'message':fname + ' was registered successfully'});	
				}
			});			
		}
	
	});
	
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
					mc.query('select fname from userdetails where username=?',[username],function(err,rows){
							
						
						res.json({'message':rows[0].fname + ' your information was successfully updated'});	
							
					});
					
				}
				
			 });	
			}
	   });
			
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
		  
		  if(!(req.body.asin)=='' || !(req.body.productName)=='' || !(req.body.productDescription)=='' || !(req.body.group)=='')
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
			});
		}
	});
		  
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
		
		if(!(req.body.asin)=='' || !(req.body.productName)=='' || !(req.body.productDescription)=='' || !(req.body.group)=='')
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
			});
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
			});
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


app.post('/viewProducts', function(req,res){
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
						/*for(var i=0;i<rows.length;i++)
						{
							var fname= rows[i].fname;
							var lname= rows[i].lname;
							var userId= rows[i].userId;
							var temp_result= "fname:"+ fname + " , " + "lname:"+ lname + " , " + "userId:"+userId;
							final_result[j++]= temp_result;
							temp_result="";
						}
						temp_result=final_result;
						res.json({'message':'The action was successful', 'user':temp_result});*/
						res.json({'product':rows});
				}
				
			}
			});
});


//mc.end();

// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});