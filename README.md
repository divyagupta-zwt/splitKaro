# Clone git repo
git clone https://github.com/divyagupta-zwt/splitKaro

# Install dependencies
cd backend 
npm install

cd frontend
npm install

# Add environment variables
## Backend .env

copy the variables from .env.example into .env with your credentials

## Frontend .env

copy the variables from .env.example into .env with your credentials

# Run migrations and seeders
## cd into backend

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Start server

npm run dev

## cd into frontend

npm run dev