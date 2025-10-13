# How To Run Project

## 5. Setup Cloudinary for file storage

1. Create account and log into: [https://cloudinary.com/](https://cloudinary.com/)
2. Then go to Dashboard
3. Copy and paste the Cloud Name, API Key, and Secret Key in the `backend/.env` file.

## 6. Setup The MongoDB

a. Open this link - LINK  
b. After that Sign Up on the website.  
c. And paste it in the `backend/.env` file and replace the `<password>` with the password you set previously in step 4.F & save changes.  
**Note:** In MongoDB URI don’t add `/` in the end.

## 7. Setup Stripe (Optional)

a. Create a Stripe account from [here](https://stripe.com).  
b. After creating account, get the Stripe Secret Key from dashboard.  
c. Paste the Secret Key in `backend/.env` file and save file.

## 8. Setup Razorpay (Optional)

a. Create a Razorpay account from [here](https://razorpay.com).  
b. After creating account, get the Razorpay Secret Key & Razorpay Key ID from dashboard.  
c. Paste the Secret Key in `backend/.env` file and save file.

## 9. To Run Backend

Use `npm run server` command in Integrated Terminal.

**Note:** Before running Frontend or Admin Projects, make sure Backend is running in the background terminal.

## Steps To Run Frontend of The Project

1. Right Click on `frontend` folder > Select “Open In Integrated Terminal”.  
2. Type `npm install` and press Enter. Wait for installation to be completed (requires Internet).  
3. After that type `npm run dev` in terminal.  
4. Now you will see the `http://localhost:5173` link in that terminal. Open that link in the browser.

## Steps To Run Admin Panel of The Project

1. Right Click on `admin` folder > Select “Open In Integrated Terminal”.  
2. Type `npm install` and press Enter. Wait for installation to be completed (requires Internet).  
3. After that type `npm run dev` in terminal.  
4. Now you will see the `http://localhost:5174` link in that terminal. Open that link in the browser.

## Support

If you still face any issue, then you can contact us on [Instagram](https://instagram.com/greatstackdev).

## Find More Projects

Visit: [https://greatstack.dev/source-code](https://greatstack.dev/source-code)