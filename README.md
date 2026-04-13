# Clone git repo
git clone https://github.com/divyagupta-zwt/splitKaro

# Install dependencies
cd backend 
npm install

cd frontend
npm install

# Add environment variables
## Backend .env

DB_USER=root
DB_HOST=127.0.0.1
DB_PASSWORD=your_db_password
DB_NAME=split_karo
PORT=3000

## Frontend .env

VITE_API_URL=http://localhost:3000/api

# Run migrations and seeders
## cd into backend

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Start server

npm run dev

## cd into frontend

npm run dev