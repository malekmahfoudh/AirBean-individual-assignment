Information and instructions for using this Airbean backend app. 

This is supposed to be a contiuation on a group assignment, but I found the process to be a bit confusing at first with the existing code, so I started a new one. I put in some menu items. Make sure to check the menu.db database to get an idea of how the menu is structured. Anyway here are some instructions. 

SIGNUP
- Open insomnia and create a new HTTP post request
- In the body, as a JSON object create a username, password and set your role to admin:
    {
        "username": "user123",
        "password": "pswrd123",
        "role": "admin"
    }
- A hashed password will get returned using bcrypt and the user should be visible in the users.db file. 

LOGIN
- Same as before, create a new HTTP post request and in the body write your username and password as a JSON:
    {
        "username": "user123",
        "password": "pswrd123"
    }
- A token will be returned. Copy this token and/or save it someware. Its valid for up to an hour (if an hour is passed by you'll have to login again).

ADD MENU ITEM
- To add an item, create a new post request and pass in the following in the body as a JSON:
    {
        "id": "whatever id makes sense to you",
        "title": "title of the product",
        "desc": "description of the product",
        "price": any number value
    }
- In "Headers" add a new header and write "Authorization" in the header input and "Bearer" in the value input followed by your token like this 
"Bearer -your token-".
- This should return a product with a createdAt attribute with a time stamp

UPDATE MENU ITEM
- Create a new HTTP request, this time make it a PUT request
- The endpoint should be the id (not to be confused with _id) of the product you'd like to update (for example /api/updateitem/product_03)
- In the body as a JSON object specify the changes. It can be either title, desc or price. Or all at once. Or maby just two. You decide:
    {
	"title":"A new value",
	"desc":"A new value",
	"price": a new value
    }
- Just like when you add items you'll have to verify your role as an admin with your token. Add it just like before in the header. 
- In the menu.db file you'll se that the product is added again but this time with a modifiedAt timestamp. This way you can se when the item was first created and when it was modified. 

DELETE MENU ITEM
- To delete an item create a new request this time a DELETE request. 
- Just like with the PUT request set the endpoint to the product id (for example /api/deleteitem/product_06)
- Add your token to the header just like before just to make sure you are an admin. 
- Leave the body empty 
- Restart se server to se the item dissapear from the menu.db file. 

CAMPAIGN
- Create one last POST request, pass in your token in the header just like before (you know the drill by now)
- And in the body write whatever products you'd like and a price:
    {
        "products": ["product_one", "product_two"],
        "campaignPrice": new price
    }
- And the campaign shoud pop up in the campaign.db file. # AirBean-individual-assignment
