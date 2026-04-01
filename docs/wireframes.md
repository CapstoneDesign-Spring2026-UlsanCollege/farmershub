# FarmersHub - Wireframes

Wireframes are simple sketches of each page's layout. They show where elements like buttons, text, and images go — without worrying about colors or styling.

---

## 1. Landing Page

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub              [Login]  [Sign Up]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│         Welcome to FarmersHub                            │
│         Connect directly with local farmers              │
│                                                          │
│         [I'm a Farmer]     [I'm a Consumer]              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   How It Works                                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │  1. Sign  │  │ 2. Browse│  │ 3. Order │              │
│   │    Up     │  │  Farms   │  │  & Buy   │              │
│   └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│   Featured Farmers                                       │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│   │ [img]  │  │ [img]  │  │ [img]  │  │ [img]  │        │
│   │ Farm A │  │ Farm B │  │ Farm C │  │ Farm D │        │
│   │ ★★★★☆ │  │ ★★★★★ │  │ ★★★☆☆ │  │ ★★★★☆ │        │
│   └────────┘  └────────┘  └────────┘  └────────┘        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  © 2026 FarmersHub   [About]  [Contact]  [Privacy]       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Sign Up / Login Page

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub                          [Home]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              ┌──────────────────────┐                    │
│              │   Create Account     │                    │
│              │                      │                    │
│              │   [Farmer] [Consumer]│  ← role toggle     │
│              │                      │                    │
│              │   Name:  [________]  │                    │
│              │   Email: [________]  │                    │
│              │   Pass:  [________]  │                    │
│              │   Phone: [________]  │                    │
│              │                      │                    │
│              │   [Sign Up]          │                    │
│              │                      │                    │
│              │   Already have an    │                    │
│              │   account? [Log In]  │                    │
│              └──────────────────────┘                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Consumer - Browse Products

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub    [Search...]    [Cart] [Profile]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Filters:  [Location ▼]  [Category ▼]  [Price ▼] [Go]   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   [image]   │  │   [image]   │  │   [image]   │      │
│  │             │  │             │  │             │      │
│  │  Tomatoes   │  │  Potatoes   │  │  Carrots    │      │
│  │  Farm A     │  │  Farm B     │  │  Farm C     │      │
│  │  5,000 KRW  │  │  3,000 KRW  │  │  4,500 KRW  │      │
│  │  ★★★★☆      │  │  ★★★★★      │  │  ★★★☆☆      │      │
│  │  [View]     │  │  [View]     │  │  [View]     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   [image]   │  │   [image]   │  │   [image]   │      │
│  │  Apples     │  │  Rice       │  │  Cabbage    │      │
│  │  Farm D     │  │  Farm E     │  │  Farm A     │      │
│  │  8,000 KRW  │  │  12,000 KRW │  │  2,500 KRW  │      │
│  │  [View]     │  │  [View]     │  │  [View]     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│              [1]  [2]  [3]  [Next →]                     │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Product Detail Page

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub    [Search...]    [Cart] [Profile]    │
├──────────────────────────────────────────────────────────┤
│  ← Back to products                                      │
│                                                          │
│  ┌────────────────────┐  Product: Tomatoes               │
│  │                    │  Farmer:  Farm A                  │
│  │    [Product        │  Price:   5,000 KRW / kg         │
│  │     Image]         │  Stock:   100 kg available        │
│  │                    │  Rating:  ★★★★☆ (24 reviews)     │
│  │                    │  Location: Ulsan, South Korea     │
│  └────────────────────┘                                  │
│                          Quantity: [- ] 1 [ +] kg        │
│                                                          │
│                          [Add to Cart]  [Message Farmer] │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  About This Product                                      │
│  Organic tomatoes grown without pesticides.              │
│  Harvested fresh every morning.                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Farm Video                                              │
│  ┌──────────────────────────────┐                        │
│  │        [▶ Play Video]        │                        │
│  └──────────────────────────────┘                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Reviews                                                 │
│  ┌──────────────────────────────────────────┐            │
│  │ User1  ★★★★★  "Great quality!"          │            │
│  │ User2  ★★★★☆  "Fresh and tasty"         │            │
│  │ User3  ★★★☆☆  "Good but delivery slow"  │            │
│  └──────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Farmer Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub                [Messages] [Profile]   │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  Dashboard Overview                         │
│            │                                             │
│  Dashboard │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  Products  │  │ Products │ │  Orders  │ │ Revenue  │    │
│  Orders    │  │    12    │ │    5     │ │ 150,000  │    │
│  Messages  │  │          │ │ pending  │ │   KRW    │    │
│  Reviews   │  └──────────┘ └──────────┘ └──────────┘    │
│  Profile   │                                             │
│            │  Recent Orders                              │
│            │  ┌──────────────────────────────────────┐   │
│            │  │ #101  Tomatoes  5kg   Consumer1      │   │
│            │  │       Status: Pending   [Accept]     │   │
│            │  ├──────────────────────────────────────┤   │
│            │  │ #100  Potatoes  3kg   Consumer2      │   │
│            │  │       Status: Shipped                │   │
│            │  ├──────────────────────────────────────┤   │
│            │  │ #099  Tomatoes  2kg   Consumer3      │   │
│            │  │       Status: Delivered  ✓           │   │
│            │  └──────────────────────────────────────┘   │
│            │                                             │
│            │  [View All Orders →]                        │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

---

## 6. Farmer - Manage Products

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub                [Messages] [Profile]   │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  My Products              [+ Add Product]   │
│            │                                             │
│  Dashboard │  ┌──────┬──────────┬───────┬──────┬──────┐  │
│  Products← │  │Image │ Name     │ Price │Stock │Action│  │
│  Orders    │  ├──────┼──────────┼───────┼──────┼──────┤  │
│  Messages  │  │[img] │ Tomatoes │ 5,000 │100kg │[Edit]│  │
│  Reviews   │  │[img] │ Potatoes │ 3,000 │ 50kg │[Edit]│  │
│  Profile   │  │[img] │ Carrots  │ 4,500 │ 30kg │[Edit]│  │
│            │  │[img] │ Apples   │ 8,000 │ 20kg │[Edit]│  │
│            │  └──────┴──────────┴───────┴──────┴──────┘  │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

---

## 7. Messaging Page

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub                [Messages] [Profile]   │
├────────────────┬─────────────────────────────────────────┤
│                │                                         │
│  Conversations │  Chat with: Farm A                      │
│                │                                         │
│  ┌────────────┐│  ┌─────────────────────────────────┐    │
│  │ Farm A   ● ││  │ Farm A: Hello! How can I help?  │    │
│  ├────────────┤│  │                                 │    │
│  │ Farm B     ││  │         You: Do you deliver to  │    │
│  ├────────────┤│  │              Ulsan city?         │    │
│  │ Consumer1  ││  │                                 │    │
│  ├────────────┤│  │ Farm A: Yes we deliver on       │    │
│  │ Consumer2  ││  │         Tuesdays and Fridays     │    │
│  └────────────┘│  │                                 │    │
│                │  └─────────────────────────────────┘    │
│                │                                         │
│                │  [Type a message...          ]  [Send]  │
│                │                                         │
└────────────────┴─────────────────────────────────────────┘
```

---

## 8. Order Tracking (Consumer)

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] FarmersHub    [Search...]    [Cart] [Profile]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  My Orders                                               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Order #101                          Apr 1, 2026  │    │
│  │ Tomatoes - 5kg from Farm A                       │    │
│  │ Total: 25,000 KRW                                │    │
│  │                                                  │    │
│  │ Status:                                          │    │
│  │  (●) Placed → (●) Accepted → (○) Shipped → (○) Delivered │
│  │                                                  │    │
│  │ [Message Farmer]  [Cancel Order]                 │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Order #099                         Mar 28, 2026  │    │
│  │ Potatoes - 3kg from Farm B                       │    │
│  │ Total: 9,000 KRW                                 │    │
│  │                                                  │    │
│  │ Status:                                          │    │
│  │  (●) Placed → (●) Accepted → (●) Shipped → (●) Delivered │
│  │                                                  │    │
│  │ [Leave Review]                                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Page Summary

| # | Page               | Users    | Purpose                          |
|---|--------------------|----------|----------------------------------|
| 1 | Landing            | All      | Introduction and sign-up entry   |
| 2 | Sign Up / Login    | All      | Account creation and login       |
| 3 | Browse Products    | Consumer | Search and filter products       |
| 4 | Product Detail     | Consumer | View product info and order      |
| 5 | Farmer Dashboard   | Farmer   | Overview of farm activity        |
| 6 | Manage Products    | Farmer   | Add, edit, delete products       |
| 7 | Messaging          | All      | Direct chat between users        |
| 8 | Order Tracking     | Consumer | Track order status               |
