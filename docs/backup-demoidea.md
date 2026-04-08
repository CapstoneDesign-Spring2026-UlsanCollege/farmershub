# FarmersHub - Backup Demo Idea

**Document Created:** 2026-04-08  
**Project:** Farmers Hub: Smart Rural Marketplace  
**Purpose:** Simple demo scenario for presentation

---

## Demo Overview

This is a backup demo scenario showcasing the core functionality of FarmersHub in a simple, linear workflow.

---

## Demo Scenario

### Step 1: Farmer Login & Dashboard
- Open FarmersHub landing page
- Click "Login as Farmer"
- Enter credentials:
  - Email: farmer@test.com
  - Password: TestPass123!
- Farmer dashboard loads with empty product list

### Step 2: Create Produce Listing
- Click "Add New Product" button
- Fill form:
  - Product Name: Tomatoes
  - Quantity: 100 kg
  - Price: 5,000 KRW
  - Description: Fresh organic tomatoes
- Click "Create Listing"
- Tomatoes appear in farmer's product list

### Step 3: Buyer Search & Order
- Logout (or open new browser session)
- Login as buyer:
  - Email: buyer@test.com
  - Password: TestPass123!
- Buyer dashboard loads
- Click "Search Products"
- Search for "Tomatoes"
- Tomatoes listing appears with price: 5,000 KRW
- Click "Place Order"
- Enter quantity: 50 kg
- Click "Confirm Order"
- Order confirmation page displays

### Step 4: Farmer Accepts Order
- Logout buyer
- Login as farmer again
- Farmer sees new order notification
- Click "View Orders"
- See buyer's order: 50 kg tomatoes
- Click "Accept Order"
- Click "Mark as Prepared"
- Order status changes to "Ready for Pickup"

### Step 5: Admin Views Activity (Optional)
- Logout farmer
- Login as admin:
  - Email: admin@test.com
  - Password: TestPass123!
- Admin dashboard shows:
  - New order completed
  - Sales activity logged
  - User activity visible

---

## Time Estimate
- Total demo time: 5-7 minutes
- No delays or errors expected with pre-seeded data

---

## Success Criteria
✅ Farmer can list product  
✅ Buyer can find and order product  
✅ Farmer can accept order  
✅ Order status updates correctly  
✅ Admin can view activity  

---

## Backup Plan

If any step fails:
1. Use pre-recorded video of the demo
2. Show only the database records to proof functionality
3. Walk through code logic on screen

---

**Notes:**
- Test all accounts and data before presentation
- Have test database seeded with sample data
- Clear browser cache before starting
- Test on presentation device 24 hours before
