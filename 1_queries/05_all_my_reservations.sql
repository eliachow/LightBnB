-- SELECT reservations.id, properties.title, reservations.start_date, properties.cost_per_night, avg(property_reviews.rating)
-- FROM properties
-- JOIN reservations ON reservations.property_id = properties.id
-- JOIN property_reviews ON property_reviews.property_id = properties.id
-- WHERE reservations.guest_id = 1
-- GROUP BY reservations.id, properties.title, properties.cost_per_night
-- ORDER BY start_date
-- LIMIT 10;

SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;