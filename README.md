# Cây Xanh Việt

Create a modern full-stack web application named "Trade & Care Plants".

The project is a graduation project website that supports buying products and looking up care information for ornamental plants and fruit trees.

Main goal:

Build a clean and user-friendly website where customers can view plant-related products, search products, view product details, place direct orders, track their orders, look up plant care information, look up plant diseases by symptoms, and use a basic chatbot for plant care advice.

Use Vietnamese language for all UI text.

Technology:

- Frontend: React

- Styling: Tailwind CSS

- UI style: modern, clean, green and white theme

- Database: Supabase

- Authentication: Supabase Auth

- App should be responsive for desktop and mobile

Main user roles:

1. Customer

2. Admin

Customer features:

- Register

- Login

- Logout

- View homepage

- View product list

- Search products

- Filter products by category

- View product detail

- Place direct order without shopping cart

- Enter receiver name, phone number, address, note, quantity

- View my orders

- View order detail

- Track order status

- View plant care guides

- Look up plant diseases by symptoms

- Use basic chatbot for plant care advice

Admin features:

- Admin dashboard

- Manage users

- Manage product categories

- Manage products

- Add product

- Edit product

- Delete or hide product

- Manage orders

- View order details

- Update order status

- Manage plant care guide data

- Manage plant disease data

- Manage chatbot response data

- View basic statistics

Product categories:

- Cây cảnh

- Cây ăn quả

- Phân bón

- Đất trồng

- Chậu cây

- Dụng cụ chăm sóc cây

Pages to create:

Customer pages:

1. Home page

2. Login page

3. Register page

4. Product list page

5. Product detail page

6. Direct order form page

7. My orders page

8. Order detail page

9. Plant care guide page

10. Disease lookup page

11. Chatbot advice page

Admin pages:

1. Admin dashboard

2. User management

3. Category management

4. Product management

5. Add product

6. Edit product

7. Order management

8. Order detail

9. Plant care management

10. Plant disease management

11. Chatbot data management

Homepage design:

- Top navbar with logo "Trade & Care Plants"

- Menu: Trang chủ, Sản phẩm, Chăm sóc cây, Tra cứu bệnh cây, Chatbot tư vấn

- Buttons: Đăng nhập, Đăng ký

- Hero section with headline about buying plant products and plant care support

- Category cards

- Featured product cards

- Plant care highlight section

- Chatbot floating button

- Footer with contact information

Product list page:

- Search bar

- Category filter

- Price filter

- Product grid

- Product cards with image, name, price, stock status, and "Xem chi tiết" button

Product detail page:

- Product image

- Product name

- Price

- Description

- Stock quantity

- Category

- Related products

- Button "Đặt hàng ngay"

Order page:

- Product summary

- Quantity input

- Receiver name

- Phone number

- Address

- Note

- Total price

- Submit order button

Plant care guide page:

- List of ornamental plants and fruit trees

- Care information including:

  - Tưới nước

  - Ánh sáng

  - Đất trồng

  - Phân bón

  - Lưu ý

Disease lookup page:

- Search or choose symptoms such as:

  - Lá vàng

  - Héo lá

  - Thối rễ

  - Đốm nâu

  - Rụng lá

  - Sâu ăn lá

- Show possible cause

- Show treatment solution

- Show suggested products

Chatbot:

- Basic chatbot, not real AI

- It should answer based on keyword matching and prepared data

- Example:

  User asks: "Cây bị vàng lá thì làm sao?"

  Bot answers: possible causes, solution, and suggested products

- Include quick question buttons

Admin dashboard:

- Total products

- Total orders

- Total users

- Total revenue from completed orders

- Low stock products

- Recent orders

Database tables:

1. users

2. categories

3. products

4. orders

5. order_details

6. plant_care_guides

7. plant_diseases

8. chatbot_responses

Table fields suggestion:

users:

- id

- full_name

- email

- phone

- role

- status

- created_at

categories:

- id

- name

- description

- created_at

products:

- id

- category_id

- name

- description

- price

- stock_quantity

- image_url

- status

- created_at

orders:

- id

- user_id

- receiver_name

- phone

- address

- note

- total_amount

- status

- created_at

order_details:

- id

- order_id

- product_id

- quantity

- unit_price

- subtotal

plant_care_guides:

- id

- plant_name

- plant_type

- watering

- sunlight

- soil

- fertilizer

- note

- image_url

- created_at

plant_diseases:

- id

- symptom

- disease_name

- cause

- solution

- suggested_product_type

- image_url

- created_at

chatbot_responses:

- id

- keyword

- question_sample

- response

- suggested_product_type

- created_at

Order statuses:

- Chờ xác nhận

- Đang xử lý

- Hoàn thành

- Đã hủy

Important scope limitations:

- Do not build multi-vendor shop system

- Do not build real online payment

- Do not build detailed shipping system

- Do not build AI image disease detection

- Do not build real-time chat

- Do not build product review system

Design requirements:

- Use a fresh green and white color palette

- Use rounded cards and soft shadows

- Use plant-themed icons and images

- Make the website look clean, modern, and suitable for a graduation project

- All text must be in Vietnamese

- Make admin pages simple, clear, and easy to use

Please generate the full application with:

- Clean routing

- Reusable components

- Supabase database integration

- Authentication and role-based access

- Sample seed data

- Responsive UI

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tradeandcare.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/74254e1d-22f1-49b9-b9dc-7493223341b5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
