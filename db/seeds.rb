# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'csv'

# clear the database 
User.destroy_all
Company.destroy_all
Transaction.destroy_all

# demo user 
robert = User.create!(email: 'batman34@gmail.com', password: 'watermelon', first_name: 'Robert', last_name: 'Smith')

# add robert's (demo user) transactions
amazon = {buy: true,
user_id: robert.id,
created_at: "2019-08-03T04:21:41.217Z",
purchase_price: 1784.00,
quantity: 1,
ticker: "AMZN"}

microsoft_buy = {buy: true,
user_id: robert.id,
created_at: "2019-08-04T01:21:41.217Z",
purchase_price: 134.60,
quantity: 2,
ticker: "MSFT"}

microsoft_sell = {buy: false,
user_id: robert.id,
created_at: "2019-08-05T03:43:45.217Z",
purchase_price: 142.34,
quantity: 1,
ticker: "MSFT"}

etsy = {buy: true,
user_id: robert.id,
created_at: "2019-08-06T02:43:45.217Z",
purchase_price: 55.55,
quantity: 3,
ticker: "ETSY"}

# add nasdaq companies
csv_nasdaq = File.read(Rails.root.join('lib', 'seeds', 'nasdaq.csv'))
csv_nasdaq = CSV.parse(csv_nasdaq, :headers => true, :encoding => 'ISO-8859-1')

csv_nasdaq.each do |row|
  company = Company.create!(ticker: row['Symbol'])
end

# add nyse companies
csv_nyse = File.read(Rails.root.join('lib', 'seeds', 'nyse.csv'))
csv_nyse = CSV.parse(csv_nyse, :headers => true, :encoding => 'ISO-8859-1')

csv_nyse.each do |row|
  unless Company.find_by(ticker: row['Symbol'])
    company = Company.create!(ticker: row['Symbol'])
  end
end

# add amex companies 
csv_amex = File.read(Rails.root.join('lib', 'seeds', 'amex.csv'))
csv_amex = CSV.parse(csv_amex, :headers => true, :encoding => 'ISO-8859-1')

csv_amex.each do |row|
  unless Company.find_by(ticker: row['Symbol'])
    company = Company.create!(ticker: row['Symbol'])
  end
end

